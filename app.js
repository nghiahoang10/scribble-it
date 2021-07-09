const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

var username;
var role;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/game', (req, res) => {
    username = req.body.username;
    role = req.body.role;
    if (role == 'admin') {
        res.sendFile(path.join(__dirname, 'public/admin.html'));
    } else if (role == 'player') {
        res.sendFile(path.join(__dirname, 'public/player.html'));
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.emit('set username', { username: username });
    socket.on('mouse', (data) => {
        socket.broadcast.emit('mouse', data);
    });
    socket.on('chat message', data => {
        io.emit('chat message', data);
    });
});

http.listen(port, () => {
    console.log(`Listening on port ${port}`);
});