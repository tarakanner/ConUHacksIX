import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io('http://localhost:4000');
      socket = socketRef.current;

      socket.on('connect', () => {
        setSocketId(socket.id ?? null);
      });

      socket.on('disconnect', () => {
        setSocketId(null);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return { socket: socketRef.current, socketId };
}
