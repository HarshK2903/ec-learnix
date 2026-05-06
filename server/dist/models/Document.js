import mongoose, { Schema } from 'mongoose';
const changeSummarySchema = new Schema({
    field: { type: String, required: true },
    action: {
        type: String,
        enum: ['generated', 'enhanced', 'unchanged'],
        required: true,
    },
    description: { type: String, required: true },
    originalContent: { type: String, default: '' },
    newContent: { type: String, default: '' },
}, { _id: false });
const documentSchema = new Schema({
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
}, {
    timestamps: true,
});
documentSchema.index({ userId: 1, createdAt: -1 });
export const DocumentModel = mongoose.model('Document', documentSchema);
//# sourceMappingURL=Document.js.map