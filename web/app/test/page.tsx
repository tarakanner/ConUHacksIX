'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/useSocket'; // Ensure correct import path
import { Button } from "@/components/ui/button";

export default function TestPage() {
  const { socket, socketId } = useSocket();
  const [rooms, setRooms] = useState([]);

  // Listen for 'returnRooms' event when the component mounts
  useEffect(() => {
    if (socket) {
      socket.on("returnRooms", (data) => {
        console.log("Received rooms:", data);
        setRooms(data);
      });



    }

    return () => {
      if (socket) {
        socket.off("returnRooms"); // Cleanup the listener
      }
    };
  }, [socket]);

  const getRooms = () => {
    if (socket) {
      console.log("Requesting rooms...");
      socket.emit('getRooms');
    }
  };

  return (
    <div>
      <Button onClick={getRooms}>Get Rooms</Button>
      <div>{socketId ? `Socket ID: ${socketId}` : 'Not connected'}</div>
      <pre>{JSON.stringify(rooms, null, 2)}</pre>
    </div>
  );
}
