// Create a new room
const createRoom = (rooms, io) => {
    const newRoom = {
        id: rooms.length + 1,
        users: [],
        status: "waiting",
    };
    rooms.push(newRoom);
    console.log("Room created:", newRoom);
    io.emit("returnRooms", rooms);
};

// Join an existing room
const joinRoom = (socketId, roomId, rooms, users, io) => {
    console.log(socketId, "trying to join room #", roomId);
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
        if (!room.users.includes(socketId)) {
            room.users.push(socketId);
        }
        users.set(socketId, roomId);
        console.log("Updated Room:", room);
        io.emit("returnRooms", rooms);
    } else {
        io.to(socketId).emit("error", "Room not found");
    }
};

// Update rooms after user actions
const updateRooms = (io, rooms) => {
    io.emit("returnRooms", rooms);
};

module.exports = { createRoom, joinRoom, updateRooms };
