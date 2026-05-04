import { Worker, Job } from 'bullmq';
import { redis } from '../config/redis.js';
import { DocumentModel } from '../models/Document.js';
import { extractTextFromDocx, buildFormattedDocx, convertDocxToPdf, ProcessedField } from '../services/document.service.js';
import { analyzeFields, buildPrompt } from '../services/template.service.js';
import { callAI } from '../services/ai.service.js';
import { emitProgress, emitComplete, emitError } from '../socket/index.js';
import path from 'path';
import fs from 'fs';

interface ProcessingJobData {
  documentId: string;
}

async function processDocument(job: Job<ProcessingJobData>): Promise<void> {
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

    // 4. Process each field with AI
    const processedFields: ProcessedField[] = [];
    const changeSummary: Array<{ field: string; action: 'generated' | 'enhanced' | 'unchanged'; description: string }> = [];

    const fieldsToProcess = fieldAnalyses.filter((a) => a.field.name);
    const totalFields = fieldsToProcess.length;

    for (let i = 0; i < fieldsToProcess.length; i++) {
      const analysis = fieldsToProcess[i];
      const progressPercent = 30 + Math.round((i / totalFields) * 50);

      emitProgress(documentId, {
        stage: 'enhancing',
        progress: progressPercent,
        field: analysis.field.label,
        message: `Processing: ${analysis.field.label} (${i + 1}/${totalFields})`,
      });

      const prompt = buildPrompt(analysis, extractedText, doc.tone);

      if (prompt) {
        try {
          const aiResult = await callAI(prompt);
          const action = analysis.status === 'MISSING' ? 'generated' : 'enhanced';

          processedFields.push({
            name: analysis.field.name,
            label: analysis.field.label,
            value: aiResult.trim(),
            action,
          });

          changeSummary.push({
            field: analysis.field.label,
            action,
            description:
              analysis.status === 'MISSING'
                ? `${analysis.field.label} was missing — AI generated content`
                : `${analysis.field.label} was enhanced for better quality and ${doc.tone} tone`,
          });
        } catch (aiError) {
          console.error(`AI error for field ${analysis.field.name}:`, aiError);
          // Fall back to existing content or empty
          processedFields.push({
            name: analysis.field.name,
            label: analysis.field.label,
            value: analysis.existingContent || '',
            action: 'unchanged',
          });
          changeSummary.push({
            field: analysis.field.label,
            action: 'unchanged',
            description: `${analysis.field.label} — AI processing failed, kept original`,
          });
        }
      } else {
        // No AI needed — use existing content or auto-fill
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
    }

    // 5. Build formatted DOCX
    emitProgress(documentId, { stage: 'assembling', progress: 85, message: 'Building formatted document...' });

    const outputDir = path.join(process.cwd(), 'outputs', doc.userId.toString());
    fs.mkdirSync(outputDir, { recursive: true });

    const docxOutputPath = path.join(outputDir, `${documentId}.docx`);
    await buildFormattedDocx(doc.templateType, processedFields, docxOutputPath);

    let finalOutputPath = docxOutputPath;

    // 6. Convert to PDF if needed
    if (doc.outputFormat === 'pdf') {
      emitProgress(documentId, { stage: 'converting', progress: 92, message: 'Converting to PDF...' });
      const pdfOutputPath = path.join(outputDir, `${documentId}.pdf`);
      try {
        await convertDocxToPdf(doc.originalFilePath, pdfOutputPath);
        finalOutputPath = pdfOutputPath;
      } catch (pdfError) {
        console.error('PDF conversion failed, falling back to DOCX:', pdfError);
        // Keep DOCX as fallback
        doc.outputFormat = 'docx';
      }
    }

    // 7. Finalize
    emitProgress(documentId, { stage: 'finalizing', progress: 98, message: 'Finalizing...' });

    doc.outputFilePath = finalOutputPath;
    doc.status = 'completed';
    doc.changeSummary = changeSummary;
    doc.processingCompletedAt = new Date();
    await doc.save();

    emitProgress(documentId, { stage: 'complete', progress: 100, message: 'Document ready!' });
    emitComplete(documentId);

    console.log(`✅ Document processed successfully: ${documentId}`);
  } catch (error) {
    console.error(`❌ Processing failed for ${documentId}:`, error);

    // Update document status to failed
    await DocumentModel.findByIdAndUpdate(documentId, {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });

    emitError(documentId, error instanceof Error ? error.message : 'Processing failed');
    throw error; // Let BullMQ handle retry
  }
}

export function startWorker(): Worker {
  const worker = new Worker('document-processing', processDocument, {
    connection: redis,
    concurrency: 2,
    limiter: {
      max: 5,
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
