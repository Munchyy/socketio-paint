const express = require('express');
const path  = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let paint = [];
app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

io.on('connection', socket => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
  socket.on('paint', (payload) => {
    paint.push(payload);
    socket.broadcast.emit('paint', payload);
  })
  socket.on('clear', () => {
    paint = [];
    socket.broadcast.emit('clear');
  });
  socket.on('sync', (callback) => {
    callback(paint);
  })
});

http.listen(80, () => {
  console.log('Listening on port 80')
});
