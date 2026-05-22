import { Server as SocketServer } from 'socket.io';
import { env } from '../config/env.js';
let io = null;
export function initSocket(httpServer) {
    io = new SocketServer(httpServer, {
        cors: {
            origin: env.NODE_ENV === 'production'
                ? [env.CLIENT_URL, /\.onrender\.com$/]
                : env.CLIENT_URL,
            methods: ['GET', 'POST'],
        },
    });
    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        socket.on('join-room', (data) => {
            socket.join(`document:${data.documentId}`);
            console.log(`📎 Socket ${socket.id} joined room document:${data.documentId}`);
        });
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
    console.log('🔌 Socket.io initialized');
    return io;
}
export function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}
export function emitProgress(documentId, data) {
    if (io) {
        io.to(`document:${documentId}`).emit('progress', data);
    }
}
export function emitComplete(documentId) {
    if (io) {
        io.to(`document:${documentId}`).emit('complete', { documentId });
    }
}
export function emitError(documentId, message) {
    if (io) {
        io.to(`document:${documentId}`).emit('error', { documentId, message });
    }
}
//# sourceMappingURL=index.js.map