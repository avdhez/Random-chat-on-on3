const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let onlineUsers = {};
let waitingUsers = [];

app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    onlineUsers[socket.id] = socket;

    if (waitingUsers.length > 0) {
        let partnerSocket = waitingUsers.pop();
        partnerSocket.partner = socket.id;
        socket.partner = partnerSocket.id;

        partnerSocket.emit('partner-found', { partnerId: socket.id });
        socket.emit('partner-found', { partnerId: partnerSocket.id });
    } else {
        waitingUsers.push(socket);
    }

    socket.on('message', (data) => {
        if (socket.partner) {
            onlineUsers[socket.partner].emit('message', data);
        }
    });

    socket.on('typing', () => {
        if (socket.partner) {
            onlineUsers[socket.partner].emit('typing');
        }
    });

    socket.on('stop-typing', () => {
        if (socket.partner) {
            onlineUsers[socket.partner].emit('stop-typing');
        }
    });

    socket.on('disconnect', () => {
        if (socket.partner && onlineUsers[socket.partner]) {
            onlineUsers[socket.partner].emit('partner-disconnected');
            onlineUsers[socket.partner].partner = null;
        }
        delete onlineUsers[socket.id];
        waitingUsers = waitingUsers.filter((s) => s.id !== socket.id);
    });
});

app.get('/online-users', (req, res) => {
    res.json({ count: Object.keys(onlineUsers).length });
});

server.listen(3001, () => {
    console.log('Server is running on port 3001');
});