'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/useSocket';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';

export default function ConnectPage() {
  const { socket, socketId } = useSocket();
  const [rooms, setRooms] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (socket) {
      socket.on("returnRooms", (data) => {
        setRooms(data);
      });

      socket.on("error", (message) => {
        console.error("Error:", message);
      });

      socket.emit("getRooms");
    }

    return () => {
      if (socket) {
        socket.off("returnRooms");
        socket.off("error");
      }
    };
  }, [socket]);

  const createRoom = () => {
    if (socket) {
      socket.emit("createRoom");
    }
  };

  const joinRoom = (roomId: number) => {
    if (socket) {
      socket.emit("joinRoom", roomId);
      router.push(`/connect/${roomId}`);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Socket.io Room Manager</h1>
      <p className="mb-4">{socketId ? `Connected: ${socketId}` : 'Not connected'}</p>

      <Button className="mb-4" onClick={createRoom}>Create Room</Button>

      <h2 className="text-lg font-semibold mb-2">Available Rooms:</h2>
      <ScrollArea className="h-60 border rounded-lg p-2">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <Card key={room.id} className="mb-2">
              <CardContent className="p-4 flex justify-between items-center">
                <span>Room {room.id} - {room.status}</span>
                <Button onClick={() => joinRoom(room.id)}>Join</Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-gray-500">No rooms available</p>
        )}
      </ScrollArea>
    </div>
  );
}
