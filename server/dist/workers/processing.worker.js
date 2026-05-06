import { Worker } from 'bullmq';
import { redis } from '../config/redis.js';
import { DocumentModel } from '../models/Document.js';
import { extractTextFromDocx, buildFormattedDocx, convertDocxToPdf } from '../services/document.service.js';
import { analyzeFields, buildPrompt } from '../services/template.service.js';
import { callAIBatch } from '../services/ai.service.js';
import { emitProgress, emitComplete, emitError } from '../socket/index.js';
import path from 'path';
import fs from 'fs';
async function processDocument(job) {
    const { documentId } = job.data;
    console.log(`🚀 Processing document: ${documentId}`);
    try {
        // 1. Load document from DB
        const doc = await DocumentModel.findById(documentId);
        if (!doc) {
            throw new Error(`Document not found: ${documentId}`);
        }
        doc.status = 'processing';
        doc.processingStartedAt = new Date();
        await doc.save();
        // 2. Extract text from DOCX
        emitProgress(documentId, { stage: 'extracting', progress: 10, message: 'Extracting content from document...' });
        const extractedText = await extractTextFromDocx(doc.originalFilePath);
        if (!extractedText || extractedText.trim().length < 10) {
            throw new Error('Document appears to be empty or could not be read');
        }
        // 3. Analyze fields against template
        emitProgress(documentId, { stage: 'analyzing', progress: 25, message: 'Analyzing document structure...' });
        const fieldAnalyses = analyzeFields(extractedText, doc.templateType);
        // 4. Collect all fields that need AI processing into a single batch
        const processedFields = [];
        const changeSummary = [];
        const processingMode = doc.processingMode || 'both';
        console.log(`📋 Processing mode: ${processingMode}`);
        // Separate fields that need AI vs fields that don't
        const aiFields = [];
        const nonAIFields = [];
        for (const analysis of fieldAnalyses) {
            if (!analysis.field.name)
                continue;
            const prompt = buildPrompt(analysis, extractedText, doc.tone);
            // Apply processing mode filter
            if (prompt) {
                const isMissing = analysis.status === 'MISSING';
                const isPresent = analysis.status === 'PRESENT' || analysis.status === 'PARTIAL';
                // 'enhance' mode: only process fields that EXIST (skip missing)
                // 'fill_missing' mode: only process MISSING fields (skip existing)
                // 'both' mode: process everything
                const shouldProcess = processingMode === 'both' ||
                    (processingMode === 'enhance' && isPresent) ||
                    (processingMode === 'fill_missing' && isMissing);
                if (shouldProcess) {
                    aiFields.push({
                        name: analysis.field.name,
                        label: analysis.field.label,
                        prompt,
                        analysis,
                    });
                }
                else {
                    // Skipped by mode — keep original content
                    nonAIFields.push(analysis);
                }
            }
            else {
                nonAIFields.push(analysis);
            }
        }
        // Process non-AI fields first
        for (const analysis of nonAIFields) {
            let value = analysis.existingContent || '';
            // Auto-fill date if missing
            if (analysis.field.name === 'date' && !value) {
                value = new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
            }
            processedFields.push({
                name: analysis.field.name,
                label: analysis.field.label,
                value,
                action: 'unchanged',
            });
            if (value) {
                changeSummary.push({
                    field: analysis.field.label,
                    action: 'unchanged',
                    description: `${analysis.field.label} — kept original content`,
                });
            }
        }
        // 5. Process ALL AI fields in a SINGLE batch call
        if (aiFields.length > 0) {
            emitProgress(documentId, {
                stage: 'enhancing',
                progress: 40,
                message: `AI processing ${aiFields.length} fields in batch...`,
            });
            try {
                console.log(`🤖 Sending batch AI request for ${aiFields.length} fields...`);
                const batchResult = await callAIBatch(aiFields.map((f) => ({ name: f.name, label: f.label, prompt: f.prompt })), doc.templateType, doc.tone);
                console.log(`✅ Batch AI response received. Fields: ${Object.keys(batchResult).join(', ')}`);
                // Map results back to fields
                for (const aiField of aiFields) {
                    const aiResult = batchResult[aiField.name];
                    const original = aiField.analysis.existingContent || '';
                    if (aiResult && aiResult.trim().length > 0) {
                        const action = aiField.analysis.status === 'MISSING' ? 'generated' : 'enhanced';
                        processedFields.push({
                            name: aiField.name,
                            label: aiField.label,
                            value: aiResult.trim(),
                            action,
                        });
                        changeSummary.push({
                            field: aiField.label,
                            action,
                            description: aiField.analysis.status === 'MISSING'
                                ? `${aiField.label} was missing — AI generated content`
                                : `${aiField.label} was enhanced for better quality and ${doc.tone} tone`,
                            originalContent: original.substring(0, 1000),
                            newContent: aiResult.trim().substring(0, 1000),
                        });
                    }
                    else {
                        processedFields.push({
                            name: aiField.name,
                            label: aiField.label,
                            value: original,
                            action: 'unchanged',
                        });
                        changeSummary.push({
                            field: aiField.label,
                            action: 'unchanged',
                            description: `${aiField.label} — AI returned empty, kept original`,
                            originalContent: original.substring(0, 1000),
                            newContent: original.substring(0, 1000),
                        });
                    }
                }
            }
            catch (aiError) {
                console.error('❌ Batch AI processing failed:', aiError);
                // Fall back — use all original content
                for (const aiField of aiFields) {
                    processedFields.push({
                        name: aiField.name,
                        label: aiField.label,
                        value: aiField.analysis.existingContent || '',
                        action: 'unchanged',
                    });
                    changeSummary.push({
                        field: aiField.label,
                        action: 'unchanged',
                        description: `${aiField.label} — AI processing failed, kept original`,
                    });
                }
            }
        }
        emitProgress(documentId, { stage: 'enhancing', progress: 80, message: 'AI processing complete' });
        // 6. Build formatted DOCX
        emitProgress(documentId, { stage: 'assembling', progress: 85, message: 'Building formatted document...' });
        const outputDir = path.join(process.cwd(), 'outputs', doc.userId.toString());
        fs.mkdirSync(outputDir, { recursive: true });
        const docxOutputPath = path.join(outputDir, `${documentId}.docx`);
        await buildFormattedDocx(doc.templateType, processedFields, docxOutputPath);
        let finalOutputPath = docxOutputPath;
        // 7. Convert to PDF if needed
        if (doc.outputFormat === 'pdf') {
            emitProgress(documentId, { stage: 'converting', progress: 92, message: 'Converting to PDF...' });
            const pdfOutputPath = path.join(outputDir, `${documentId}.pdf`);
            try {
                await convertDocxToPdf(doc.originalFilePath, pdfOutputPath);
                finalOutputPath = pdfOutputPath;
            }
            catch (pdfError) {
                console.error('PDF conversion failed, falling back to DOCX:', pdfError);
                doc.outputFormat = 'docx';
            }
        }
        // 8. Finalize
        emitProgress(documentId, { stage: 'finalizing', progress: 98, message: 'Finalizing...' });
        doc.outputFilePath = finalOutputPath;
        doc.status = 'completed';
        doc.changeSummary = changeSummary;
        doc.processingCompletedAt = new Date();
        await doc.save();
        emitProgress(documentId, { stage: 'complete', progress: 100, message: 'Document ready!' });
        emitComplete(documentId);
        console.log(`✅ Document processed successfully: ${documentId}`);
    }
    catch (error) {
        console.error(`❌ Processing failed for ${documentId}:`, error);
        await DocumentModel.findByIdAndUpdate(documentId, {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
        emitError(documentId, error instanceof Error ? error.message : 'Processing failed');
        throw error;
    }
}
export function startWorker() {
    const worker = new Worker('document-processing', processDocument, {
        connection: redis,
        concurrency: 1, // Process one at a time to avoid rate limits
        limiter: {
            max: 3,
            duration: 60000,
        },
    });
    worker.on('completed', (job) => {
        console.log(`✅ Job ${job.id} completed`);
    });
    worker.on('failed', (job, err) => {
        console.error(`❌ Job ${job?.id} failed:`, err.message);
    });
    console.log('🔧 BullMQ processing worker started');
    return worker;
}
//# sourceMappingURL=processing.worker.js.map