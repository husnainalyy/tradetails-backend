const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*", // Update with your frontend's origin
        methods: ["GET", "POST"],
    },
});


// Pass `io` to routes
const chatRoutes = require('./routes/chatRoutes')(io);
app.use("/api/chats", chatRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {

    socket.on("joinRoom", (chatId) => {
        socket.join(chatId);
    });

    socket.on("disconnect", () => {
        
    });

    socket.on('typing', (data) => {
        // Broadcast typing status to other clients in the same chat
        socket.broadcast.to(data.chatId).emit('typing', { userId: data.userId });
    });
});



// Start the server
const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server is running on port ${port}`));
