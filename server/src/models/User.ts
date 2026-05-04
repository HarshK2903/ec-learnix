import mongoose, { Schema, Document as MongoDocument } from 'mongoose';

export interface IUser extends MongoDocument {
  name: string;
  email: string;
  password: string;
  refreshToken: string | null;
  dailyUploadCount: number;
  lastUploadDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
    },
    refreshToken: {
      type: String,
      default: null,
    },
    dailyUploadCount: {
      type: Number,
      default: 0,
    },
    lastUploadDate: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
