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
const io = require("socket.io")(server, {  cors: {    origin: "http://localhost:8080",    methods: ["GET", "POST"]  }});

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
});

const PORT = process.env.PORT || 8082;

server.listen(PORT, function () {
  console.log(`Listening on ${server.address().port}`);
});