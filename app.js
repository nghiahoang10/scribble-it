const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

const COLOR = ['#FF0000', '#00FF00', '#0000FF', '#800080', '#964B00', '#00b3ff', '#ff00c8', '#ff6600'];
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
    color = COLOR[colorTrack++ % 8];
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
    console.log(`${socket.username} connected`);
    io.emit('players list', players);
    io.emit('player joined', socket.username);
    socket.on('mouse', (data) => {
        socket.broadcast.emit('mouse', data);
    });
    socket.on('chat message', data => {
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
    })
});

http.listen(port, () => {
    console.log(`Listening on port ${port}`);
});