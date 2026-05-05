import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { DocumentModel } from '../models/Document.js';
import { User } from '../models/User.js';
import { isToday } from '../utils/helpers.js';
import { processingQueue } from '../queues/processing.queue.js';

const MAX_DAILY_UPLOADS = 5;

export const uploadDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { templateType, tone, outputFormat, processingMode } = req.body;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    if (!templateType) {
      res.status(400).json({ message: 'Template type is required' });
      return;
    }

    const validTemplates = ['journal', 'cv', 'biodata', 'blogpost', 'report'];
    if (!validTemplates.includes(templateType)) {
      res.status(400).json({ message: `Invalid template type. Must be one of: ${validTemplates.join(', ')}` });
      return;
    }

    const validTones = ['formal', 'casual', 'polite', 'aggressive', 'academic'];
    if (tone && !validTones.includes(tone)) {
      res.status(400).json({ message: `Invalid tone. Must be one of: ${validTones.join(', ')}` });
      return;
    }

    const validFormats = ['docx', 'pdf'];
    if (outputFormat && !validFormats.includes(outputFormat)) {
      res.status(400).json({ message: 'Invalid output format. Must be docx or pdf' });
      return;
    }

    const validModes = ['enhance', 'fill_missing', 'both'];
    if (processingMode && !validModes.includes(processingMode)) {
      res.status(400).json({ message: `Invalid processing mode. Must be one of: ${validModes.join(', ')}` });
      return;
    }

    // Check daily upload limit
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (isToday(user.lastUploadDate)) {
      if (user.dailyUploadCount >= MAX_DAILY_UPLOADS) {
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        res.status(429).json({
          message: `Daily upload limit reached (${MAX_DAILY_UPLOADS}/day). Try again tomorrow.`,
        });
        return;
      }
      user.dailyUploadCount += 1;
    } else {
      user.dailyUploadCount = 1;
      user.lastUploadDate = new Date();
    }
    await user.save();

    // Create document record
    const doc = await DocumentModel.create({
      userId: req.userId,
      originalFileName: file.originalname,
      originalFilePath: file.path,
      outputFormat: outputFormat || 'docx',
      templateType,
      tone: tone || 'formal',
      processingMode: processingMode || 'both',
      status: 'uploaded',
    });

    // Add processing job to BullMQ queue
    await processingQueue.add(
      'process-document',
      { documentId: doc._id.toString() },
      {
        attempts: 2,
        backoff: { type: 'exponential', delay: 5000 },
      }
    );

    // Update status to processing
    doc.status = 'processing';
    doc.processingStartedAt = new Date();
    await doc.save();

    res.status(201).json({
      documentId: doc._id,
      status: 'processing',
      message: 'Document uploaded and processing started',
    });
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((e) => e.message);
      res.status(400).json({ message: messages[0] || 'Validation failed' });
      return;
    }
    res.status(500).json({ message: 'Failed to upload document' });
  }
};

export const listDocuments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const documents = await DocumentModel.find({ userId: req.userId })
      .select('-originalFilePath -outputFilePath')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ documents });
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
};

export const getDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await DocumentModel.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).lean();

    if (!doc) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    res.json({
      document: {
        _id: doc._id,
        originalFileName: doc.originalFileName,
        outputFormat: doc.outputFormat,
        templateType: doc.templateType,
        tone: doc.tone,
        status: doc.status,
        changeSummary: doc.changeSummary,
        errorMessage: doc.errorMessage,
        processingStartedAt: doc.processingStartedAt,
        processingCompletedAt: doc.processingCompletedAt,
        createdAt: doc.createdAt,
      },
    });
  } catch (error) {
    console.error('Get document error:', error);
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid document ID' });
      return;
    }
    res.status(500).json({ message: 'Failed to fetch document' });
  }
};

export const downloadDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await DocumentModel.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!doc) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    if (doc.status !== 'completed' || !doc.outputFilePath) {
      res.status(400).json({ message: 'Document is not ready for download' });
      return;
    }

    if (!fs.existsSync(doc.outputFilePath)) {
      res.status(404).json({ message: 'Output file not found' });
      return;
    }

    const ext = doc.outputFormat === 'pdf' ? '.pdf' : '.docx';
    const downloadName = doc.originalFileName.replace(/\.docx$/i, `_formatted${ext}`);

    res.download(doc.outputFilePath, downloadName);
  } catch (error) {
    console.error('Download error:', error);
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid document ID' });
      return;
    }
    res.status(500).json({ message: 'Failed to download document' });
  }
};

export const deleteDocument = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doc = await DocumentModel.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!doc) {
      res.status(404).json({ message: 'Document not found' });
      return;
    }

    // Delete files from disk
    if (doc.originalFilePath && fs.existsSync(doc.originalFilePath)) {
      fs.unlinkSync(doc.originalFilePath);
    }
    if (doc.outputFilePath && fs.existsSync(doc.outputFilePath)) {
      fs.unlinkSync(doc.outputFilePath);
    }

    await DocumentModel.deleteOne({ _id: doc._id });

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: 'Invalid document ID' });
      return;
    }
    res.status(500).json({ message: 'Failed to delete document' });
  }
};

