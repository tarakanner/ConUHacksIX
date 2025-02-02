'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/lib/useSocket';
import { useParams } from 'next/navigation';
import WebcamComponent from '@/components/WebcamComponent';
import RoomCard from '@/components/RoomCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';


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
  const router = useRouter();

  useEffect(() => {
    if (socket && roomId) {
      const handleGameCompleted = (data: { winners: string }) => {
        alert(`Game Over! The winner(s): ${data.winners}`);
      };
  
      const handleRedirect = () => {
        alert("Game Over! Redirecting to the Connect page...");
        router.push("/connect");
      };
  
      socket.on("gameCompleted", handleGameCompleted);
      socket.on("redirectToConnect", handleRedirect);
  
      return () => {
        socket.off("gameCompleted", handleGameCompleted);
        socket.off("redirectToConnect", handleRedirect);
      };
    }
  }, [socket, roomId]);
  

  useEffect(() => {
    if (room && socket) {
      const userInRoom = room.users.some((user) => user.id === socket.id);
      if (!userInRoom) {
        router.push("/connect");
      }
    }
  }, [room, socket, router]);

  useEffect(() => {
    if (socket && roomId) {
      // Handle game completion and redirect
      const handleRedirect = () => {
        alert("Game Over! Redirecting to the Connect page...");
        router.push("/connect");
      };
  
      socket.on("redirectToConnect", handleRedirect);
  
      return () => {
        socket.off("redirectToConnect", handleRedirect);
      };
    }
  }, [socket, roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleError = (message: string) => {
      alert(message);
    };

    socket.on("error", handleError);

    return () => {
      socket.off("error", handleError);
    };
  }, [socket]);


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

      const handleGameStarted = (data: { objects: string[]; currentObject: string; round: number }) => {
        setRoom((prev) =>
          prev
            ? { ...prev, status: "started", started: true, objectList: data.objects, round: data.round }
            : null
        );
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
