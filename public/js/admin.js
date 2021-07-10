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
var players = [];
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
    line(data.x * canvasWidth, data.y * canvasHeight, data.px * canvasWidth, data.py * canvasHeight);
}

function mouseDragged() {
    stroke(brushColor);
    strokeWeight(strokeWidth);
    line(mouseX, mouseY, pmouseX, pmouseY);
    sendMouse(mouseX / canvasWidth, mouseY / canvasHeight, pmouseX / canvasWidth, pmouseY / canvasHeight);
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
    for (var i = 0; i < data.length; i++) {
        if (!players.find(function (player) {
            return player.username == data[i].username && player.color == data[i].color && player.score == data[i].score;
        })) {
            var newPlayer = document.createElement('div');
            newPlayer.id = data[i].username;
            newPlayer.textContent = data[i].username + ': ' + data[i].score;
            newPlayer.classList.add('player');
            newPlayer.style.backgroundColor = data[i].color;
            scoreboard.appendChild(newPlayer);
        }
    }
    for (var i = 0; i < players.length; i++) {
        if (!data.find(function (player) {
            return player.username == players[i].username && player.color == players[i].color && player.score == players[i].score;
        })) {
            var remove = document.getElementById(players[i].username);
            remove.remove();
        }
    }
    players = data;
});

socket.on('player left', function (data) {
    console.log(data);
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

