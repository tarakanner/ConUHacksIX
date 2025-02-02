// lib/useSocket.ts
import { useSocket as useSocketContext } from './SocketContext';

export function useSocket() {
  const { socket, socketId } = useSocketContext();
  return { socket, socketId };
}
