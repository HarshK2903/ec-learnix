import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

export interface IProject extends MongoDocument {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  templateType: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'Untitled Project',
      maxlength: 200,
    },
    content: {
      type: String,
      default: '',
    },
    templateType: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ userId: 1, isDeleted: 1, updatedAt: -1 });

export const ProjectModel = mongoose.model<IProject>('Project', projectSchema);
