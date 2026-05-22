import mongoose, { Document as MongoDocument } from 'mongoose';
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
export declare const DocumentModel: mongoose.Model<IDocument, {}, {}, {}, mongoose.Document<unknown, {}, IDocument, {}, {}> & IDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Document.d.ts.map