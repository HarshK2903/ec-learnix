import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
export declare const uploadDocument: (req: AuthRequest, res: Response) => Promise<void>;
export declare const listDocuments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getDocument: (req: AuthRequest, res: Response) => Promise<void>;
export declare const downloadDocument: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteDocument: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=document.controller.d.ts.map