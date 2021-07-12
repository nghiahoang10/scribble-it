const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#800080', '#964B00', '#00b3ff', '#ff00c8', '#ff6600'];
const WORDS = [
    ['ankle', 'arm', 'beard', 'cheek', 'chest', 'chin', 'elbow', 'forehead', 'heel', 'hip', 'knee', 'leg', 'mustache', 'shoulder', 'thumb', 'finger', 'tooth', 'neck', 'eye', 'lip', 'mouth', 'ear', 'nose', 'tongue', 'face'], //body
    ['rice', 'noodle', 'ice cream', 'hamburger', 'cookie', 'donut', 'bagel', 'sandwich', 'chocolate', 'cake', 'egg', 'omelete', 'hot dog', 'pizza', 'bread', 'jam', 'spaghetti', 'sausage', 'sushi', 'yoghurt', 'taco', 'steak'], //food
    ['chicken', 'dog', 'cat', 'mouse', 'lion', 'tiger', 'giraffe', 'crocodile', 'bird', 'eagle', 'cheetah', 'gorilla', 'monkey', 'fish', 'shark', 'whale', 'snake', 'python', 'goat', 'horse', 'sheep', 'cow', 'buffalo', 'spider', 'octopus', 'squid', 'bear', 'penguin', 'duck'], //animal
    ['cristiano ronaldo', 'lionel messi', 'elon musk', 'tim cook', 'bill gates', 'steve jobs', 'pele', 'jeff bezos', 'mark zuckerberg', 'donald trump',]]; //celebrity
var numRounds;
var turn = 0;
var run = false;
var players = [];
var username;
var role;
var color;
var colorTrack = 0;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/game', (req, res) => {
    username = req.body.username;
    role = req.body.role;
    color = COLORS[colorTrack++ % 8];
    players.push({ username: username, color: color, score: 0 });
    if (role == 'admin') {
        res.sendFile(path.join(__dirname, 'public/admin.html'));
    } else if (role == 'player') {
        res.sendFile(path.join(__dirname, 'public/player.html'));
    }
});

io.on('connection', (socket) => {
    socket.emit('set username', { username: username, color: color });
    socket.username = username;
    players[players.length - 1].id = socket.id;
    console.log(`${socket.username} with ID: ${socket.id} connected`);
    io.emit('players list', players);
    io.emit('player joined', socket.username);
    socket.on('mouse', function (data) {
        socket.broadcast.emit('mouse', data);
    });
    /*data.sender: sender
    data.msg: message
    data.color: color of sender*/
    socket.on('chat message', function (data) {
        io.emit('chat message', data);
    });
    socket.on('disconnect', () => {
        console.log(players);
        players = players.filter(function (player) {
            return player.username != socket.username;
        });
        console.log(players);
        io.emit('players list', players);
        socket.broadcast.emit('player left', socket.username);
    });
    socket.on('game setting', function (data) {
        numRounds = data.numberOfRound;
        run = true;
    });
    socket.on('run', function (data) {
        if (run) {
            if (turn == numRounds * players.length - 1) {
                run = false;
            }
            io.to(players[turn++ % players.length].id).emit('draw', { words: WORDS[0][0] });
            console.log(data);
        }
        //socket.broadcast.emit('guess', {});
    })
});

http.listen(port, () => {
    console.log(`Listening on port ${port}`);
});