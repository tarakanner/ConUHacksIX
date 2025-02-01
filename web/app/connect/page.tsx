'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/useSocket'; // Ensure correct import path
import { Button } from "@/components/ui/button";

type Room = {
  id: number;
  status: string;
};

export default function ConnectPage() {
  const { socket, socketId } = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]); // Explicitly set type

  useEffect(() => {
    if (socket) {
      socket.on("returnRooms", (data: Room[]) => {
        console.log("Received rooms:", data);
        setRooms(data);
      });

      socket.on("error", (message: string) => {
        console.error("Error:", message);
      });
    }

    return () => {
      if (socket) {
        socket.off("returnRooms");
        socket.off("error");
      }
    };
  }, [socket]);

  const getRooms = () => {
    if (socket) {
      console.log("Requesting rooms...");
      socket.emit("getRooms");
    }
  };

  const createRoom = () => {
    if (socket) {
      console.log("Creating new room...");
      socket.emit("createRoom");
    }
  };

  const joinRoom = (roomId: number) => {
    if (socket) {
      console.log(`Joining room ${roomId}...`);
      socket.emit("joinRoom", roomId);
    }
  };

  return (
    <div>
      <h1>Socket.io Room Manager</h1>
      <p>{socketId ? `Connected: ${socketId}` : 'Not connected'}</p>
      
      <Button onClick={getRooms}>Get Rooms</Button>
      <Button onClick={createRoom}>Create Room</Button>

      <h2>Available Rooms:</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            Room {room.id} - Status: {room.status} 
            <Button onClick={() => joinRoom(room.id)}>Join</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
