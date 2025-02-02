const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { createRoom, joinRoom, updateRooms } = require("./utils/roomHandler");
const { startGame, handleGameAction } = require("./utils/gameHandler");

const PORT = 4000;

const app = express();
const server = http.createServer(app);

const users = new Map(); // Store users as { socketId: { id, username, roomId } }
let rooms = [];

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  users.set(socket.id, { id: socket.id, username: `Guest_${socket.id.slice(-4)}`, roomId: null });

  // Set username
  socket.on("setUsername", (username) => {
    if (users.has(socket.id)) {
      users.get(socket.id).username = username;
    }
  });

  // Get rooms
  socket.on("getRooms", () => {
    console.log(`${socket.id} is getting rooms`);
    socket.emit("returnRooms", rooms);
  });

  // Create a new room
  socket.on("createRoom", () => {
    createRoom(rooms, io);
  });

  // Join an existing room
  socket.on("joinRoom", (roomId) => {
    joinRoom(socket.id, roomId, rooms, users, io);
  });

  // Start the game in a room
  socket.on("startGame", (roomId) => {
    startGame(roomId, rooms, io);
  });

  // Handle game actions
  socket.on("gameAction", (data) => {
    handleGameAction(data, rooms, io);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    const user = users.get(socket.id);
    if (user && user.roomId) {
      const room = rooms.find((r) => r.id === user.roomId);
      if (room) {
        room.users = room.users.filter((u) => u.id !== socket.id);
      }
    }
    users.delete(socket.id);
    updateRooms(io, rooms);
  });
});

server.listen(PORT, () => console.log(`Socket.IO server running on port ${PORT}`));
