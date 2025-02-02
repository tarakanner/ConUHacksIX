const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { createRoom, joinRoom, updateRooms } = require("./utils/roomHandler");
const { startGame, handleGameAction } = require("./utils/gameHandler");

const PORT = 4000;

const app = express();
const server = http.createServer(app);

const users = new Map();
let rooms = [];

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
    createRoom(rooms, io);
  });

  socket.on("joinRoom", (roomId) => {
    joinRoom(socket.id, roomId, rooms, users, io);
  });

  // Game-related actions
  socket.on("startGame", (roomId) => {
    startGame(roomId, rooms, io);
  });

  socket.on("gameAction", (data) => {
    handleGameAction(data, rooms, io);
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
    updateRooms(io, rooms);
  });
});


server.listen(PORT, () => console.log(`Socket.IO server running on port ${PORT}`));
