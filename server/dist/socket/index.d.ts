import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
export declare function initSocket(httpServer: HTTPServer): SocketServer;
export declare function getIO(): SocketServer;
export declare function emitProgress(documentId: string, data: {
    stage: string;
    progress: number;
    field?: string;
    message?: string;
}): void;
export declare function emitComplete(documentId: string): void;
export declare function emitError(documentId: string, message: string): void;
//# sourceMappingURL=index.d.ts.map