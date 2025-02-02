'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/useSocket';
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from 'next/navigation';

interface Room {
  id: number;
  status: string;
  users: string[];
}

export default function RoomPage() {
  const { socket } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
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

      socket.on("gameStarted", () => {
        setIsGameStarted(true);
      });

      socket.emit("getRooms");
    }

    return () => {
      if (socket) {
        socket.off("returnRooms");
        socket.off("gameStarted");
      }
    };
  }, [socket, roomId]);

  const startGame = () => {
    if (socket && roomId) {
      socket.emit("startGame", roomId);
    }
  };

  if (!room) {
    return <p>Loading room...</p>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Room {room.id}</h1>
      <p>Status: {room.status}</p>
      <p>Users: {room.users.join(", ")}</p>

      {isGameStarted ? (
        <Button className="mt-4" onClick={() => router.push(`/game/${roomId}`)}>Go to Game</Button>
      ) : (
        <Button className="mt-4" onClick={startGame}>Start Game</Button>
      )}
    </div>
  );
}
