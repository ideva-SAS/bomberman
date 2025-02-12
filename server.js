const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static('public'));

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start server
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
