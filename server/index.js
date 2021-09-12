const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PORT = process.env.PORT || 5000;
const handlers = require('./socket/handlers');

io.on('connection', (socket) => {
  handlers(io, socket);
});

app.get('*', (req, res) => {
  res.send('Page not found!');
});

server.listen(PORT, () => {
  console.log('Server Started!');
});
