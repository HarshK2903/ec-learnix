import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { env } from '../config/env.js';

let io: SocketServer | null = null;

export function initSocket(httpServer: HTTPServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join-room', (data: { documentId: string }) => {
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

export function getIO(): SocketServer {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function emitProgress(
  documentId: string,
  data: {
    stage: string;
    progress: number;
    field?: string;
    message?: string;
  }
): void {
  if (io) {
    io.to(`document:${documentId}`).emit('progress', data);
  }
}

export function emitComplete(documentId: string): void {
  if (io) {
    io.to(`document:${documentId}`).emit('complete', { documentId });
  }
}

export function emitError(documentId: string, message: string): void {
  if (io) {
    io.to(`document:${documentId}`).emit('error', { documentId, message });
  }
}
