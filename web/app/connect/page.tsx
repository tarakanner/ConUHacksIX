"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Connect() {
  const [rooms, setRooms] = useState(["1234", "5678", "9012"])
  const [newRoom, setNewRoom] = useState("")
  const [searchRoom, setSearchRoom] = useState("")

  const createRoom = () => {
    if (newRoom) {
      setRooms([...rooms, newRoom])
      setNewRoom("")
    }
  }

  const filteredRooms = rooms.filter((room) => room.includes(searchRoom))

  return (
    <div className="flex items-center justify-center min-h-screen p-4 pt-8">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg space-y-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Connect to a Room</h1>

        {/* Card Content */}
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Create a room"
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
            maxLength={4}
          />
          <Button onClick={createRoom}>Create</Button>
        </div>
        <Input
          type="text"
          placeholder="Search rooms"
          value={searchRoom}
          onChange={(e) => setSearchRoom(e.target.value)}
        />
        <div className="space-y-2">
          {filteredRooms.map((room) => (
            <Link key={room} href={`/game/${room}`} className="block">
              <Button variant="outline" className="w-full">
                Join Room {room}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
