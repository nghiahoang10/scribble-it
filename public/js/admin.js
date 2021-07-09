var socket = io();
var myUsername;
var brushColor = '#000';
var strokeWidth = 5;
var canvas;
var canvasWidth = document.getElementById('canvas').clientWidth;
var canvasHeight = document.getElementById('canvas').clientHeight;
var form = document.getElementById('form');
var input = document.getElementById('input');
var chatlist = document.getElementById('chatlist');
var scoreboard = document.getElementById('scoreboard');
var players;
var currentNumPlayers = 0;

function setup() {
    canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas');
    background('#FFF');
    socket.on('mouse', newDrawing);
}

function newDrawing(data) {
    stroke(data.color);
    strokeWeight(data.strokeWidth);
    line(data.x, data.y, data.px, data.py);
}

function mouseDragged() {
    stroke(brushColor);
    strokeWeight(strokeWidth);
    line(mouseX, mouseY, pmouseX, pmouseY);
    sendMouse(mouseX, mouseY, pmouseX, pmouseY);
}

function sendMouse(x, y, px, py, width, height) {
    const data = {
        x: x,
        y: y,
        px: px,
        py: py,
        width: width,
        height: height,
        color: brushColor,
        strokeWidth: strokeWidth,
    }
    socket.emit('mouse', data);
}

function changeColor(event) {
    var source = event.target;
    document.getElementById('red').classList.remove('clicked');
    document.getElementById('yellow').classList.remove('clicked');
    document.getElementById('blue').classList.remove('clicked');
    document.getElementById('green').classList.remove('clicked');
    document.getElementById('black').classList.remove('clicked');
    document.getElementById('orange').classList.remove('clicked');
    document.getElementById('brown').classList.remove('clicked');
    document.getElementById('purple').classList.remove('clicked');
    document.getElementById('white').classList.remove('clicked');
    if (source.id == 'red') {
        brushColor = '#FF0000';
    } else if (source.id == 'orange') {
        brushColor = '#FFA500';
    } else if (source.id == 'yellow') {
        brushColor = '#FFFF00';
    } else if (source.id == 'blue') {
        brushColor = '#0000FF';
    } else if (source.id == 'green') {
        brushColor = '#00FF00';
    } else if (source.id == 'brown') {
        brushColor = '#964B00';
    } else if (source.id == 'purple') {
        brushColor = '#800080';
    } else if (source.id == 'black') {
        brushColor = '#000';
    } else if (source.id == 'white') {
        brushColor = '#FFF';
    }
    source.classList.add('clicked');
}

function changeStrokeWidth(event) {
    var source = event.target;
    document.getElementById('small').classList.remove('clicked');
    document.getElementById('medium').classList.remove('clicked');
    document.getElementById('large').classList.remove('clicked');
    document.getElementById('xlarge').classList.remove('clicked');
    if (source.id == 'small') {
        strokeWidth = 5;
    } else if (source.id == 'medium') {
        strokeWidth = 10;
    } else if (source.id == 'large') {
        strokeWidth = 20;
    } else if (source.id == 'xlarge') {
        strokeWidth = 40;
    }
    source.classList.add('clicked');
    if (source.parentElement.classList.contains('strokeWidth'))
        source.parentElement.classList.add('clicked');
}

socket.on('chat message', function (data) {
    var newMsg = document.createElement('li');
    var sender = document.createElement('span');
    var msg = document.createElement('msg');
    sender.textContent = data.sender;
    sender.classList.add('sender');
    newMsg.appendChild(sender);
    msg.textContent = ': ' + data.msg;
    newMsg.appendChild(msg);
    newMsg.classList.add('message');
    chatlist.appendChild(newMsg);
});

socket.on('set username', function (username) {
    if (!myUsername) {
        myUsername = username.username;
    }
});

socket.on('players list', function (data) {
    players = data;
    for (var i = currentNumPlayers; i < players.length; i++) {
        var newPlayer = document.createElement('div');
        newPlayer.textContent = players[i].username + ': ' + players[i].score;
        newPlayer.classList.add('player');
        if (i % 4 == 0) {
            newPlayer.classList.add('red-player');
        } else if (i % 4 == 1) {
            newPlayer.classList.add('green-player');
        } else if (i % 4 == 2) {
            newPlayer.classList.add('blue-player');
        } else if (i % 4 == 3) {
            newPlayer.classList.add('purple-player');
        }
        scoreboard.appendChild(newPlayer);
    }
    currentNumPlayers = players.length;
})

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', { msg: input.value, sender: myUsername });
        input.value = '';
    }
});
document.getElementById('red').addEventListener('click', changeColor);
document.getElementById('yellow').addEventListener('click', changeColor);
document.getElementById('blue').addEventListener('click', changeColor);
document.getElementById('green').addEventListener('click', changeColor);
document.getElementById('black').addEventListener('click', changeColor);
document.getElementById('orange').addEventListener('click', changeColor);
document.getElementById('brown').addEventListener('click', changeColor);
document.getElementById('purple').addEventListener('click', changeColor);
document.getElementById('white').addEventListener('click', changeColor);
document.getElementById('small').addEventListener('click', changeStrokeWidth);
document.getElementById('medium').addEventListener('click', changeStrokeWidth);
document.getElementById('large').addEventListener('click', changeStrokeWidth);
document.getElementById('xlarge').addEventListener('click', changeStrokeWidth);

