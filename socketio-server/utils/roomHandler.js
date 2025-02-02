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
    console.log(`${socketId} trying to join room #${roomId}`);
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
        const user = users.get(socketId);
        if (user) {
            const userObj = { id: socketId, username: user.username };
            if (!room.users.some((u) => u.id === socketId)) {
                room.users.push(userObj);
            }
            users.set(socketId, { ...user, roomId });
            console.log("Updated Room:", room);
            io.emit("returnRooms", rooms);
        }
    } else {
        io.to(socketId).emit("error", "Room not found");
    }
};

// Update rooms after user actions
const updateRooms = (io, rooms) => {
    io.emit("returnRooms", rooms);
};

module.exports = { createRoom, joinRoom, updateRooms };
