import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export interface ProgressUpdate {
  videoId: string;
  progress: number;
  status: string;
  timestamp: string;
}

export function initializeSocket(): Socket {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function subscribeToVideoProgress(videoId: string, callback: (update: ProgressUpdate) => void) {
  if (!socket) {
    initializeSocket();
  }

  socket?.on(`video-progress-${videoId}`, callback);
  socket?.emit('subscribe-video', videoId);

  return () => {
    socket?.off(`video-progress-${videoId}`, callback);
    socket?.emit('unsubscribe-video', videoId);
  };
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
