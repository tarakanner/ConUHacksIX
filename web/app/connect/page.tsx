'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/useSocket';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input"; // Shadcn UI Input component
import { useRouter } from 'next/navigation';

// Define the Room interface
interface Room {
  id: number;
  users: string[];
  status: string;
}

export default function ConnectPage() {
  const { socket, socketId } = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [username, setUsername] = useState<string>('');
  const router = useRouter();

  // Generate a random username (if the user doesn’t enter one)
  const generateUsername = () => `User_${Math.floor(Math.random() * 10000)}`;

  useEffect(() => {
    if (socket) {
      socket.on("returnRooms", (data: Room[]) => {
        setRooms(data);
      });

      socket.on("error", (message) => {
        console.error("Error:", message);
      });

      socket.emit("getRooms");

      // Set a default username and emit to the server
      const storedUsername = localStorage.getItem("username");
      const finalUsername = storedUsername || generateUsername();
      setUsername(finalUsername);
      socket.emit("setUsername", finalUsername);
      localStorage.setItem("username", finalUsername);
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

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = event.target.value;
    setUsername(newUsername);
    localStorage.setItem("username", newUsername);
    if (socket) {
      socket.emit("setUsername", newUsername);
    }
  };

  return (
    <div className="p-4 flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Socket.io Room Manager</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">{socketId ? `Connected: ${socketId}` : 'Not connected'}</p>

          {/* Auto-Set Username Input */}
          <div className="mb-4">
            <Input
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter your username"
              className="w-full"
            />
          </div>

          <Button className="w-full mb-4" onClick={createRoom}>Create Room</Button>

          <h2 className="text-lg font-semibold mb-2">Available Rooms:</h2>
          <ScrollArea className="h-60 border rounded-lg p-2">
            {rooms.length > 0 ? (
              rooms.map((room) => (
                <Card key={room.id} className="mb-2w-full max-w-md shadow-lg card-custom-bg">
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
        </CardContent>
      </Card>
    </div>
  );
}
