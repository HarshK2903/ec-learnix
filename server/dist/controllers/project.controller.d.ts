import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
export declare const createProject: (req: AuthRequest, res: Response) => Promise<void>;
export declare const listProjects: (req: AuthRequest, res: Response) => Promise<void>;
export declare const listTrash: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getProject: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProject: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteProject: (req: AuthRequest, res: Response) => Promise<void>;
export declare const restoreProject: (req: AuthRequest, res: Response) => Promise<void>;
export declare const permanentDeleteProject: (req: AuthRequest, res: Response) => Promise<void>;
export declare const importProject: (req: AuthRequest, res: Response) => Promise<void>;
export declare const exportProject: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=project.controller.d.ts.map