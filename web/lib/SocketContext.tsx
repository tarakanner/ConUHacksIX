'use client';

// lib/SocketContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  socketId: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);

  useEffect(() => {
    const socket = io('wss://obscure-stream-36208-a2c57f97d6d0.herokuapp.com');
    setSocket(socket);

    socket.on('connect', () => {
      // Ensure socket.id is a string, so no undefined value is passed to setSocketId
      setSocketId(socket.id ?? null);  // If socket.id is undefined (shouldn't be), set it to null
    });

    socket.on('disconnect', () => {
      setSocketId(null);  // Set socketId to null when disconnected
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, socketId }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
