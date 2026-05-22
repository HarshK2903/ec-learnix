import mongoose, { Schema } from 'mongoose';
const userSchema = new Schema({
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
}, {
    timestamps: true,
});
userSchema.index({ email: 1 });
export const User = mongoose.model('User', userSchema);
//# sourceMappingURL=User.js.map