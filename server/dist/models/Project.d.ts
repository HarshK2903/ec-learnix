import mongoose, { Document as MongoDocument } from 'mongoose';
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
export declare const ProjectModel: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}, {}> & IProject & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Project.d.ts.map