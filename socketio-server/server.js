const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const users = new Map();
let rooms = [
  {
    id: 1,
    users: [],
    status: "waiting",
  },
  {
    id: 2,
    users: [],
    status: "waiting",
  },
];

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  users.set(socket.id, null);

  socket.on("getRooms", () => {
    console.log(socket.id, "is getting rooms");
    socket.emit("returnRooms", rooms);
  });

  socket.on("createRoom", () => {
    const newRoom = {
      id: rooms.length + 1,
      users: [],
      status: "waiting",
    };
    rooms.push(newRoom);
    console.log("Room created:", newRoom);
    io.emit("returnRooms", rooms);
  });

  socket.on("joinRoom", (roomId) => {
    console.log(socket.id, "trying to join room #", roomId);
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      if (!room.users.includes(socket.id)) {
        room.users.push(socket.id);
      }
      users.set(socket.id, roomId);
      console.log("Updated Room:", room);
      io.emit("returnRooms", rooms);
    } else {
      socket.emit("error", "Room not found");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    const roomId = users.get(socket.id);
    if (roomId) {
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        room.users = room.users.filter((id) => id !== socket.id);
      }
    }
    users.delete(socket.id);
    io.emit("returnRooms", rooms);
  });
});

const PORT = 4000;
server.listen(PORT, () => console.log(`Socket.IO server running on port ${PORT}`));
