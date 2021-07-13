var socket = io();
var brushColor = '#000';
var strokeWidth = 5;
var canvas;
//drawing canvas
var canvasWidth = document.getElementById('canvas').clientWidth;
var canvasHeight = document.getElementById('canvas').clientHeight;
//chat
var form = document.getElementById('form');
var input = document.getElementById('input');
var chatbox = document.getElementById('chatbox');
var chatlist = document.getElementById('chatlist');
//scoreboard
var scoreboard = document.getElementById('scoreboard');
//setting for admin
var roundSetting = document.getElementById('round-setting');
var roundNumber = document.getElementById('round-number');
var start = document.getElementById('start');
//topbar
var clock = document.getElementById('clock');

var players = [];
var myUsername;
var myColor;
var isDrawer = false;
var time = 60;
var score = time;

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
    if (isDrawer) {
        stroke(brushColor);
        strokeWeight(strokeWidth);
        line(mouseX, mouseY, pmouseX, pmouseY);
        sendMouse(mouseX / canvasWidth, mouseY / canvasHeight, pmouseX / canvasWidth, pmouseY / canvasHeight);
    }
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

/*data.sender: sender
  data.msg: message
  data.color: color of sender*/
socket.on('chat message', function (data) {
    var newMsg = document.createElement('li');
    var sender = document.createElement('span');
    var msg = document.createElement('span');
    sender.textContent = data.sender;
    sender.classList.add('sender');
    sender.style.color = data.color;
    newMsg.appendChild(sender);
    msg.textContent = ': ' + data.msg;
    newMsg.appendChild(msg);
    newMsg.classList.add('message');
    chatlist.appendChild(newMsg);
    chatbox.scrollTo(0, chatbox.scrollHeight);
});

/*data.username: username of player
  data.color: assigned color of player*/
socket.on('set username', function (data) {
    if (!myUsername) {
        myUsername = data.username;
    }
    if (!myColor) {
        myColor = data.color;
    }
});

/*data: array of objects
  data[i].username: username of player i
  data[i].color: assigned color of player i
  data[i].score: assigned score of player i*/
socket.on('players list', function (data) {
    for (let i = 0; i < data.length; i++) {
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
    for (let i = 0; i < players.length; i++) {
        if (!data.find(function (player) {
            return player.username == players[i].username && player.color == players[i].color && player.score == players[i].score;
        })) {
            var remove = document.getElementById(players[i].username);
            remove.remove();
        }
    }
    players = data;
});

/*data: username of joined player*/
socket.on('player joined', function (data) {
    var signal = document.createElement('li');
    signal.textContent = data + ' joined';
    signal.classList.add('joined')
    chatlist.appendChild(signal);
    chatbox.scrollTo(0, chatbox.scrollHeight);
});

/*data: username of left player*/
socket.on('player left', function (data) {
    var signal = document.createElement('li');
    signal.textContent = data + ' left';
    signal.classList.add('left')
    chatlist.appendChild(signal);
    chatbox.scrollTo(0, chatbox.scrollHeight);
});

//backend countdown
function countdown() {
    return new Promise(
        resolve => setTimeout(resolve, time * 1000)
    );
}

/*data.words: the chosen word that players need to guess
  data.currentRound: the current round to be displayed on the top bar
  data.maxRound: the current round to be displayed on the the topbar*/
socket.on('draw', async function (data) {
    isDrawer = true;
    document.getElementById('word').textContent = data.words;
    document.getElementById('panel').style.visibility = 'visible';
    document.getElementById('round').textContent = 'Round ' + data.currentRound + ' of ' + data.maxRound;
    canvas.clear();
    canvas.background('FFF');
    //frontend countdown
    for (let i = 1; i <= time; i++) {
        setTimeout(() => {
            clock.textContent = i;
            score--
        }, i * 1000)
    }
    await countdown();
    isDrawer = false;
    clock.textContent = '';
    score = time;
    socket.emit('running', 'next');
});

socket.on('guess', async function (data) {
    isDrawer = false;
    var hint = '';
    document.getElementById('panel').style.visibility = 'hidden';
    document.getElementById('round').textContent = 'Round ' + data.currentRound + ' of ' + data.maxRound;
    canvas.clear();
    canvas.background('FFF');
    for (let i = 0; i < data.words.length; i++) {
        if (data.words[i] != ' ') {
            hint += '_';
        } else {
            hint += ' ';
        }
    }
    document.getElementById('word').textContent = hint;
    for (let i = 1; i <= time; i++) {
        setTimeout(() => {
            clock.textContent = i;
            score--;
        }, i * 1000)
    }
    await countdown();
    clock.textContent = '';
    score = time;
});

/*data.word: the word will be displayed to the players if their guesses are correct*/
socket.on('correct', function (data) {
    document.getElementById('word').textContent = data.word;
    var newMsg = document.createElement('li');
    newMsg.textContent = 'You guessed the word!';
    newMsg.classList.add('message');
    newMsg.style.color = '#00ff00';
    chatlist.appendChild(newMsg);
    chatbox.scrollTo(0, chatbox.scrollHeight);
});

/*data.sender: the player that guessed the word correctly to be displayed in the chatbox*/
socket.on('announcement', function (data) {
    var newMsg = document.createElement('li');
    newMsg.textContent = `${data.sender} guessed the word!`;
    newMsg.classList.add('message');
    newMsg.style.color = '#00ff00';
    chatlist.appendChild(newMsg);
    chatbox.scrollTo(0, chatbox.scrollHeight);
});

/*data.newScore: new score of the player that has the correct guess
  data.id: id of the player that has the correct guess*/
socket.on('update score', function (data) {
    let player = players.find(player => player.id == data.id);
    document.getElementById(player.username).textContent = player.username + ': ' + data.newScore;
})

form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', { msg: input.value, sender: myUsername, color: myColor, isCurrentDrawer: isDrawer, score: score });
        input.value = '';
    }
});
roundSetting.addEventListener('submit', function (e) {
    e.preventDefault();
    if (roundNumber != 0) {
        socket.emit('game setting', { numberOfRound: roundNumber.value });
        roundNumber.disabled = true;
        start.disabled = true;
        socket.emit('running', '');
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

