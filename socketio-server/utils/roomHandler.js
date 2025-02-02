// Create a new room
const createRoom = (rooms, io) => {
    const newRoom = {
        id: rooms.length + 1,
        users: [],
        status: "waiting",
        started: false, // Indicates if the game has started
        objectList: [],
        round: 0, // Tracks the round number
    };
    rooms.push(newRoom);
    console.log("Room created:", newRoom);
    io.emit("returnRooms", rooms);
};

// Join an existing room
function joinRoom(socketId, roomId, rooms, users, io) {
    const room = rooms.find(r => r.id === roomId);
    const user = users.get(socketId);

    if (room && user) {
        room.users.push({ id: socketId, username: user.username });
        user.roomId = roomId;

        io.sockets.sockets.get(socketId)?.join(roomId);
        io.to(roomId).emit("returnRooms", rooms);
    }
}

// Update rooms after user actions
const updateRooms = (io, rooms) => {
    io.emit("returnRooms", rooms);
};

module.exports = { createRoom, joinRoom, updateRooms };
