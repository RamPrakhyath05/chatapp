// custom-server.js
const express = require('express');
const http = require('http');
const next = require('next');
const socketIo = require('socket.io');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const users = new Map();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = socketIo(httpServer);

  server.all('*', (req, res) => handle(req, res));

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('login', (username) => {
      users.set(socket.id, username);
      io.emit('userList', Array.from(users.values()));
    });

    socket.on('message', (message) => {
      const username = users.get(socket.id);
      io.emit('message', { username, text: message });
    });

    socket.on('disconnect', () => {
      const username = users.get(socket.id);
      users.delete(socket.id);
      io.emit('userList', Array.from(users.values()));
      io.emit('message', {
        username: 'Server',
        text: `${username} has left the chat.`,
      });
    });
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
