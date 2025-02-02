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
let roomCounter = 1; // Global counter for room IDs

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
      id: roomCounter, // Use the global counter for room ID
      users: [],
      status: "waiting",
      started: false,
      objectList: [],
      round: 0,
    };
    rooms.push(newRoom);
    console.log("Room created:", newRoom);
    roomCounter++; // Increment the global room counter after creating a room
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

    // Track found objects for each user in the room
    if (!user.foundObjects) {
      user.foundObjects = 0; // Initialize if not set
    }
    user.foundObjects++;

    // Notify all players who found the object
    io.to(roomId).emit("objectFound", {
      username: user.username,
      foundObject: room.objectList[room.round - 1],
    });

    room.round++;

    // Check if round 3 is completed and declare winner(s)
    if (room.round === 4) {  // After round 3, check if it's the end of the game
      room.status = "completed";

      // Calculate the winner(s)
      const maxFoundObjects = Math.max(...room.users.map((u) => u.foundObjects || 0));
      const winners = room.users.filter((u) => u.foundObjects === maxFoundObjects);

      // Announce winner(s)
      io.to(roomId).emit("gameCompleted", {
        winners: winners.map((w) => w.username).join(", "),
      });

      setTimeout(() => {
        // Force players to return to the connect page
        io.to(roomId).emit("redirectToConnect");

        // Remove the room from the active rooms list
        rooms = rooms.filter((r) => r.id !== roomId);

        console.log(`Room ${roomId} is now closed.`);
      }, 5000); // Give players 5 seconds before redirecting them
    } else {
      // Continue the game
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
  const objects = ['bicycle',
 'airplane',
 'stop sign',
 'cat',
 'dog',
 'horse',
 'sheep',
 'cow',
 'elephant',
 'bear',
 'zebra',
 'giraffe',
 'backpack',
 'umbrella',
 'skateboard',
 'tennis racket',
 'fork',
 'knife',
 'spoon',
 'banana',
 'apple',
 'sandwich',
 'orange',
 'broccoli',
 'carrot',
 'potted plant',
 'toilet',
 'keyboard',
 'cell phone',
 'microwave',
 'oven',
 'sink',
 'refrigerator',
 'book',
 'clock',
 'scissors',
 'hair drier',];
  return objects.sort(() => Math.random() - 0.5).slice(0, 3);
};

server.listen(PORT, () => console.log(`Socket.IO server running on port ${PORT}`));
