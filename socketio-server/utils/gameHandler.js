// Start the game in the given room
const startGame = (roomId, rooms, io) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.users.length >= 2) {
        room.started = true;
        room.status = "in-progress";
        room.objectList = generateObjectList(); // Now generates exactly 3 objects
        room.round = 1; // Initialize round counter

        io.to(roomId).emit("gameStarted", {
            objects: room.objectList,
            currentObject: room.objectList[0], // First object to find
            round: room.round,
        });

        console.log(`Game started in room ${roomId}, first object: ${room.objectList[0]}`);
    } else {
        io.to(roomId).emit("error", "Not enough players to start the game");
    }
};

// Handle the game action (whether the client found the object)
const handleGameAction = (data, rooms, io) => {
    const { roomId, userId, objectFound } = data;
    const room = rooms.find((r) => r.id === roomId);

    if (room && room.status === "in-progress" && room.round <= room.objectList.length) {
        const user = room.users.find((u) => u.id === userId);

        if (user && objectFound) {
            console.log(`${user.username} found the object: ${room.objectList[room.round - 1]}`);

            room.round++; // Move to the next round

            if (room.round > room.objectList.length) {
                room.status = "completed";
                io.to(roomId).emit("gameCompleted", `${user.username} won the game!`);
            } else {
                io.to(roomId).emit("gameProgress", {
                    round: room.round,
                    currentObject: room.objectList[room.round - 1],
                });
            }
        }
    } else {
        io.to(roomId).emit("error", "Game is not in progress");
    }
};

// Generate exactly 3 random objects for the game
const generateObjectList = () => {
    const objects = ["Pen", "Laptop", "Book", "Shoe", "Cup", "Chair", "Phone", "Lamp", "Wallet", "Watch"];
    return objects.sort(() => Math.random() - 0.5).slice(0, 3);
};

module.exports = { startGame, handleGameAction };
