// Start the game in the given room
const startGame = (roomId, rooms, io) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.users.length >= 2) {
        room.status = "in-progress";
        const objectList = generateObjectList(); // Generate random objects for the game
        room.objectList = objectList;
        io.to(roomId).emit("gameStarted", objectList);
        console.log("Game started in room", roomId);
    } else {
        io.to(roomId).emit("error", "Not enough players to start the game");
    }
};

// Handle the game action (whether the client found the object)
const handleGameAction = (data, rooms, io) => {
    const { roomId, userId, objectFound } = data;
    const room = rooms.find((r) => r.id === roomId);
    if (room && room.status === "in-progress") {
        const user = room.users.find((userId) => userId === userId);
        if (user) {
            // If the user found the object, mark it as found
            if (objectFound) {
                const objectIndex = room.objectList.findIndex(
                    (obj) => obj === data.object
                );
                if (objectIndex !== -1) {
                    room.objectList.splice(objectIndex, 1);
                }
                console.log(`${userId} found the object:`, data.object);
            }

            // Notify the room of progress
            if (room.objectList.length === 0) {
                room.status = "completed";
                io.to(roomId).emit("gameCompleted", `${userId} won the game!`);
            } else {
                io.to(roomId).emit("gameProgress", room.objectList);
            }
        }
    } else {
        io.to(roomId).emit("error", "Game is not in progress");
    }
};

// Helper function to generate random objects
const generateObjectList = () => {
    const objects = [
        "Pen",
        "Laptop",
        "Book",
        "Shoe",
        "Cup",
        "Chair",
        "Phone",
        "Lamp",
        "Wallet",
        "Watch",
    ];
    return objects.sort(() => Math.random() - 0.5).slice(0, 5); // Select 5 random objects
};

module.exports = { startGame, handleGameAction };
