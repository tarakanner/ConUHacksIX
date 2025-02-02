'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/useSocket';
import { useParams } from 'next/navigation';
import WebcamComponent from '@/components/WebcamComponent';
import RoomCard from '@/components/RoomCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";

interface Room {
  id: number;
  status: string;
  users: { id: string; username: string }[];
  started: boolean;
  objectList: string[];
  round: number;
}

export default function Game() {
  const { socket } = useSocket();
  const [room, setRoom] = useState<Room | null>(null);
  const params = useParams();
  const [roomId, setRoomId] = useState<number | null>(null);

  useEffect(() => {
    if (params.id) {
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      setRoomId(parseInt(id, 10));
    }
  }, [params]);

  useEffect(() => {
    if (socket && roomId) {
      const handleReturnRooms = (data: Room[]) => {
        const foundRoom = data.find((r) => r.id === roomId);
        setRoom(foundRoom || null);
      };

      const handleGameStarted = () => {
        setRoom((prev) => (prev ? { ...prev, status: "started", started: true } : null));
      };

      const handleObjectFound = (data: { username: string; foundObject: string }) => {
        alert(`${data.username} found the object: ${data.foundObject}`);
      };

      const handleGameProgress = (data: { round: number; currentObject: string }) => {
        setRoom((prev) =>
          prev ? { ...prev, round: data.round, objectList: [data.currentObject, ...prev.objectList.slice(1)] } : null
        );
      };

      socket.on("returnRooms", handleReturnRooms);
      socket.on("gameStarted", handleGameStarted);
      socket.on("objectFound", handleObjectFound);
      socket.on("gameProgress", handleGameProgress);
      socket.emit("getRooms");

      return () => {
        socket.off("returnRooms", handleReturnRooms);
        socket.off("gameStarted", handleGameStarted);
        socket.off("objectFound", handleObjectFound);
        socket.off("gameProgress", handleGameProgress);
      };
    }
  }, [socket, roomId]);

  const startGame = () => {
    if (socket && roomId) {
      socket.emit("startGame", roomId);
    }
  };

  const foundObject = () => {
    if (socket && roomId) {
      socket.emit("gameAction", {
        roomId,
        userId: socket.id,
        objectFound: true,
      });
    }
  };

  if (!room) {
    return <p>Loading room...</p>;
  }

  return (
    <div className="p-4 flex justify-center items-center min-h-screen">
      {room.started ? (
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Game Room</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg mb-2">
              Status: <span className="font-medium">{room.status}</span>
            </p>
            <p className="text-lg mb-2 font-bold">Find: {room.objectList[0]}</p>
            <WebcamComponent room={room} />
            <Button className="mt-4" onClick={foundObject}>
              Found Object
            </Button>
          </CardContent>
        </Card>
      ) : (
        <RoomCard room={room} startGame={startGame} />
      )}
    </div>
  );
}
