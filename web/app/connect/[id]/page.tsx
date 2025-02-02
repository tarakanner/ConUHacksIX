'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/useSocket';
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"; // Ensure this import is correct

interface Room {
  id: number;
  status: string;
  users: { id: string; username: string }[];
}

export default function RoomPage() {
  const { socket } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const router = useRouter();
  const params = useParams();
  const [roomId, setRoomId] = useState<number | null>(null);

  useEffect(() => {
    if (params.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      setRoomId(parseInt(id));
    }
  }, [params]);

  useEffect(() => {
    if (socket && roomId) {
      socket.on("returnRooms", (data) => {
        const foundRoom = data.find((r: Room) => r.id === roomId);
        setRoom(foundRoom || null);
      });

      const handleGameStarted = () => {
        console.log("Game started! Redirecting...");
        router.push(`/game/${roomId}`);
      };
      socket.on("gameStarted", handleGameStarted);

      socket.emit("getRooms");

      return () => {
        socket.off("returnRooms");
        socket.off("gameStarted", handleGameStarted);
      };
    }
  }, [socket, roomId, router]);

  const startGame = () => {
    if (socket && roomId) {
      socket.emit("startGame", roomId);
    }
  };

  if (!room) {
    return <p>Loading room...</p>;
  }

  return (
    <div className="p-4 flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-lg card-custom-bg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Room {room.id}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg mb-2">Status: <span className="font-medium">{room.status}</span></p>

          {/* Scrollable user list using ScrollArea */}
          <p className="text-lg mb-2">Users:</p>
          <ScrollArea className="h-40 border rounded-lg p-2 mb-4 bg-white">
            {room.users.length > 0 ? (
              room.users.map((user) => (
                <div key={user.id} className="text-lg">
                  {user.username || user.id}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No users available</p>
            )}
          </ScrollArea>

          <Button className="w-full mt-4" onClick={startGame}>Start Game</Button>
        </CardContent>
      </Card>
    </div>
  );
}
