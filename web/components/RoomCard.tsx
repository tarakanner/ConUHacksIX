'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface Room {
  id: number;
  status: string;
  users: { id: string; username: string }[];
}

interface RoomCardProps {
  room: Room;
  startGame: () => void;
}

export default function RoomCard({ room, startGame }: RoomCardProps) {
  return (
    <Card className="w-full max-w-md shadow-lg card-custom-bg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">Room {room.id}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-lg mb-2">
          Status: <span className="font-medium">{room.status}</span>
        </p>
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
        <Button className="w-full mt-4" onClick={startGame}>
          Start Game
        </Button>
      </CardContent>
    </Card>
  );
}
