import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

export type TemplateType = 'journal' | 'cv' | 'biodata' | 'blogpost' | 'report';
export type ToneType = 'formal' | 'casual' | 'polite' | 'aggressive' | 'academic';
export type OutputFormat = 'docx' | 'pdf';
export type ProcessingMode = 'enhance' | 'fill_missing' | 'both';
export type DocumentStatus = 'uploaded' | 'processing' | 'completed' | 'failed';

export interface IChangeSummary {
  field: string;
  action: 'generated' | 'enhanced' | 'unchanged';
  description: string;
  originalContent?: string;
  newContent?: string;
}

export interface IDocument extends MongoDocument {
  userId: mongoose.Types.ObjectId;
  originalFileName: string;
  originalFilePath: string;
  outputFilePath: string | null;
  outputFormat: OutputFormat;
  templateType: TemplateType;
  tone: ToneType;
  processingMode: ProcessingMode;
  status: DocumentStatus;
  changeSummary: IChangeSummary[];
  errorMessage: string | null;
  processingStartedAt: Date | null;
  processingCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const changeSummarySchema = new Schema<IChangeSummary>(
  {
    field: { type: String, required: true },
    action: {
      type: String,
      enum: ['generated', 'enhanced', 'unchanged'],
      required: true,
    },
    description: { type: String, required: true },
    originalContent: { type: String, default: '' },
    newContent: { type: String, default: '' },
  },
  { _id: false }
);

const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    originalFilePath: {
      type: String,
      required: true,
    },
    outputFilePath: {
      type: String,
      default: null,
    },
    outputFormat: {
      type: String,
      enum: ['docx', 'pdf'],
      required: true,
    },
    templateType: {
      type: String,
      enum: ['journal', 'cv', 'biodata', 'blogpost', 'report'],
      required: true,
    },
    tone: {
      type: String,
      enum: ['formal', 'casual', 'polite', 'aggressive', 'academic'],
      default: 'formal',
    },
    processingMode: {
      type: String,
      enum: ['enhance', 'fill_missing', 'both'],
      default: 'both',
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed'],
      default: 'uploaded',
    },
    changeSummary: {
      type: [changeSummarySchema],
      default: [],
    },
    errorMessage: {
      type: String,
      default: null,
    },
    processingStartedAt: {
      type: Date,
      default: null,
    },
    processingCompletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ userId: 1, createdAt: -1 });

export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);

