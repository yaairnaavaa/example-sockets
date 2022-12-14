var express = require('express');
var app = express();
var server = require('http').Server(app);
var cors = require('cors');

var players = {};
app.use(cors());
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.send("HOLA desde HEROKU");
});

//const io = require('socket.io')(server);
const io = require("socket.io")(server, {  cors: {    origin: "*",    methods: ["GET", "POST"]  }});

io.on('connection', function (socket) {
  console.log('a user connected');
  // create a new player and add it to our players object
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
  };
  console.log(players);
  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);
  // when a player disconnects, remove them from our players object
  socket.on('disconnect', function () {
    console.log('user disconnected');
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    socket.broadcast.emit('removePlayer', socket.id);
    socket.disconnect();
    console.log(players);
  });

  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });

  socket.on('starCollected', function () {
    if (players[socket.id].team === 'red') {
      scores.red += 10;
    } else {
      scores.blue += 10;
    }
    star.x = Math.floor(Math.random() * 700) + 50;
    star.y = Math.floor(Math.random() * 500) + 50;
    io.emit('starLocation', star);
    io.emit('scoreUpdate', scores);
  });

  socket.on('nftMint', function (accountId) {
    console.log(accountId);
    data = {
      reload: true
    }
    socket.broadcast.emit('nftMint', data);
  });
  
});

const PORT = process.env.PORT || 8082;

server.listen(PORT, function () {
  console.log(`Listening on ${server.address().port}`);
});