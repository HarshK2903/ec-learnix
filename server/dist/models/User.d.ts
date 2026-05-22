import mongoose, { Document as MongoDocument } from 'mongoose';
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
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map