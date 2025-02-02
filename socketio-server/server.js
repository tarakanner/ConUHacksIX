const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const PORT = 4000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const users = new Map(); // Store users as { socketId: { id, username, roomId } }
let rooms = [];

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Default user setup
  users.set(socket.id, { id: socket.id, username: `Guest_${socket.id.slice(-4)}`, roomId: null });

  // Set username
  socket.on("setUsername", (username) => {
    if (users.has(socket.id)) {
      users.get(socket.id).username = username;
    }
  });

  // Get available rooms
  socket.on("getRooms", () => {
    console.log(`${socket.id} requested rooms`);
    socket.emit("returnRooms", rooms);
  });

  // Create a new room
  socket.on("createRoom", () => {
    const newRoom = {
      id: rooms.length + 1,
      users: [],
      status: "waiting",
      started: false,
      objectList: [],
      round: 0,
    };
    rooms.push(newRoom);
    console.log("Room created:", newRoom);
    io.emit("returnRooms", rooms);
  });

  // Join an existing room
  socket.on("joinRoom", (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    const user = users.get(socket.id);

    if (room && user) {
      room.users.push({ id: socket.id, username: user.username });
      user.roomId = roomId;

      io.sockets.sockets.get(socket.id)?.join(roomId);
      io.to(roomId).emit("returnRooms", rooms);
    }
  });

  // Start the game in a room
  socket.on("startGame", (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.users.length >= 2) {
      room.started = true;
      room.status = "in-progress";
      room.objectList = generateObjectList();
      room.round = 1;

      io.to(roomId).emit("gameStarted", {
        objects: room.objectList,
        currentObject: room.objectList[0],
        round: room.round,
      });

      console.log(`Game started in room ${roomId}, first object: ${room.objectList[0]}`);
    } else {
      io.to(roomId).emit("error", "Not enough players to start the game");
    }
  });

  // Handle game actions
  socket.on("gameAction", (data) => {
    const { roomId, userId, objectFound } = data;
    const room = rooms.find((r) => r.id === roomId);

    if (!room || room.status !== "in-progress") {
      io.to(roomId).emit("error", "Game is not in progress");
      return;
    }

    const user = room.users.find((u) => u.id === userId);
    if (!user || !objectFound) return;

    console.log(`${user.username} found the object: ${room.objectList[room.round - 1]}`);

    // Notify all players who found the object
    io.to(roomId).emit("objectFound", {
      username: user.username,
      foundObject: room.objectList[room.round - 1],
    });

    room.round++;

    if (room.round > room.objectList.length) {
      room.status = "completed";
      io.to(roomId).emit("gameCompleted", { winner: user.username });
    } else {
      io.to(roomId).emit("gameProgress", {
        round: room.round,
        currentObject: room.objectList[room.round - 1],
      });
    }
  });



  // Get current round info
  socket.on("getRoundInfo", (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.status === "in-progress") {
      socket.emit("roundInfo", {
        round: room.round,
        currentObject: room.objectList[room.round - 1],
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    const user = users.get(socket.id);
    if (user && user.roomId !== null) {
      const room = rooms.find((r) => r.id === user.roomId);
      if (room) {
        room.users = room.users.filter((u) => u.id !== socket.id);
      }
    }
    users.delete(socket.id);
    io.emit("returnRooms", rooms);
  });
});

// Generate exactly 3 random objects for the game
const generateObjectList = () => {
  const objects = ["Pen", "Laptop", "Book", "Shoe", "Cup", "Chair", "Phone", "Lamp", "Wallet", "Watch"];
  return objects.sort(() => Math.random() - 0.5).slice(0, 3);
};

server.listen(PORT, () => console.log(`Socket.IO server running on port ${PORT}`));
