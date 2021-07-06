const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/game', (req, res) => {
    var username = req.body.username;
    var role = req.body.role;
    if (role == 'admin') {
        res.sendFile(path.join(__dirname, 'public/admin.html'));
    } else if (role == 'player') {
        res.sendFile(path.join(__dirname, 'public/player.html'));
    }
})

io.on('connection', (socket) => {
    console.log('A user connected');
})

http.listen(port, () => {
    console.log(`Listening on port ${port}`);
})