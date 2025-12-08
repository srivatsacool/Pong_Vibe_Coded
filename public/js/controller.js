// Controller page JavaScript - Touch input and Socket.IO client

const socket = io();

// DOM Elements
const joinScreen = document.getElementById('joinScreen');
const controllerScreen = document.getElementById('controllerScreen');
const pinInput = document.getElementById('pinInput');
const nameInput = document.getElementById('nameInput');
const joinBtn = document.getElementById('joinBtn');
const errorMessage = document.getElementById('errorMessage');
const playerBadge = document.getElementById('playerBadge');
const playerNameDisplay = document.getElementById('playerNameDisplay');
const touchPad = document.getElementById('touchPad');
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const pauseBtn = document.getElementById('pauseBtn');
const waitingMessage = document.getElementById('waitingMessage');
const disconnectOverlay = document.getElementById('disconnectOverlay');
const miniScoreLeft = document.getElementById('miniScoreLeft');
const miniScoreRight = document.getElementById('miniScoreRight');

// Game constants (will be updated from server)
let GAME_HEIGHT = 600;
let PADDLE_HEIGHT = 100;

// Controller state
let playerSide = null;
let playerName = '';
let isPlaying = false;
let paddleY = 0;
let lastTouchY = null;
let touchStartY = null;
let paddleStartY = null;

// Haptic feedback helper
function vibrate(pattern) {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
}

// Join room with PIN
joinBtn.addEventListener('click', joinRoom);
pinInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (nameInput) nameInput.focus();
        else joinRoom();
    }
});
if (nameInput) {
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') joinRoom();
    });
}

// Only allow numbers in PIN input
pinInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    // Haptic feedback on each number
    vibrate(10);
});

function joinRoom() {
    const pin = pinInput.value.trim();
    playerName = nameInput ? nameInput.value.trim() : '';
    
    if (pin.length !== 4) {
        showError('Please enter a 4-digit PIN');
        vibrate([50, 30, 50]); // Error haptic
        return;
    }
    
    if (!playerName) {
        playerName = 'Player';
    }
    
    socket.emit('joinRoom', pin, playerName);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Shake animation
    pinInput.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        pinInput.style.animation = '';
    }, 500);
}

// Socket event handlers
socket.on('joinError', (message) => {
    showError(message);
    vibrate([50, 30, 50, 30, 50]); // Error haptic pattern
});

socket.on('joinSuccess', (data) => {
    playerSide = data.side;
    
    // Update constants from server
    if (data.constants) {
        GAME_HEIGHT = data.constants.GAME_HEIGHT;
        PADDLE_HEIGHT = data.constants.PADDLE_HEIGHT;
    }
    
    // Update UI
    playerBadge.textContent = `Player ${data.playerNumber}`;
    playerBadge.className = `player-badge ${playerSide}`;
    
    if (playerNameDisplay) {
        playerNameDisplay.textContent = playerName;
    }
    
    // Initialize paddle position
    paddleY = (GAME_HEIGHT - PADDLE_HEIGHT) / 2;
    
    // Switch to controller screen
    joinScreen.classList.add('hidden');
    controllerScreen.classList.add('active');
    
    // Success haptic - strong pulse
    vibrate([100, 30, 100]);
});

socket.on('gameState', (state) => {
    // Update constants
    if (state.constants) {
        GAME_HEIGHT = state.constants.GAME_HEIGHT;
        PADDLE_HEIGHT = state.constants.PADDLE_HEIGHT;
    }
    
    // Update scores
    miniScoreLeft.textContent = state.scores.left;
    miniScoreRight.textContent = state.scores.right;
    
    // Update paddle position from server (for sync)
    if (playerSide && state.paddles[playerSide] !== undefined) {
        paddleY = state.paddles[playerSide];
        updatePaddleIndicator();
    }
});

socket.on('gameStarted', () => {
    isPlaying = true;
    waitingMessage.classList.add('hidden');
    touchHint.classList.remove('hidden');
    
    // Game start haptic - exciting pattern
    vibrate([50, 50, 50, 50, 100]);
});

socket.on('gamePaused', (isPaused) => {
    isPlaying = !isPaused;
    if (isPaused) {
        waitingMessage.classList.remove('hidden');
        waitingMessage.querySelector('div:last-child').textContent = 'Game Paused';
        vibrate(100);
    } else {
        waitingMessage.classList.add('hidden');
        vibrate([50, 30, 50]);
    }
});

socket.on('gameRestarted', () => {
    isPlaying = false;
    waitingMessage.classList.remove('hidden');
    waitingMessage.querySelector('div:last-child').textContent = 'Waiting for game to start...';
    vibrate([100, 50, 100]);
});

// Haptic feedback for game events
socket.on('haptic', (type) => {
    switch (type) {
        case 'hit':
            vibrate(30); // Quick tap for paddle hit
            break;
        case 'wall':
            vibrate(15); // Light tap for wall bounce
            break;
        case 'score':
            vibrate([100, 50, 100]); // Strong pulse for scoring
            break;
        case 'scored_against':
            vibrate([50, 30, 50, 30, 50]); // Multiple short for losing point
            break;
        case 'win':
            vibrate([100, 50, 100, 50, 200]); // Victory pattern
            break;
        case 'lose':
            vibrate([200, 100, 200]); // Defeat pattern
            break;
    }
});

socket.on('roomClosed', () => {
    disconnectOverlay.classList.remove('hidden');
    disconnectOverlay.querySelector('.disconnect-text').textContent = 'Game room closed';
    vibrate([100, 50, 100, 50, 100]);
});

socket.on('disconnect', () => {
    disconnectOverlay.classList.remove('hidden');
    vibrate([200, 100, 200]);
});

socket.on('connect', () => {
    if (!disconnectOverlay.classList.contains('hidden')) {
        location.reload();
    }
});

// Button controls
let moveInterval = null;
const MOVE_SPEED = 12; // Pixels per frame

function startMovingUp() {
    if (!isPlaying || moveInterval) return;
    vibrate(10);
    moveInterval = setInterval(() => {
        paddleY = Math.max(0, paddleY - MOVE_SPEED);
        socket.emit('paddleMove', { position: paddleY });
    }, 16); // 60 FPS
}

function startMovingDown() {
    if (!isPlaying || moveInterval) return;
    vibrate(10);
    moveInterval = setInterval(() => {
        paddleY = Math.min(GAME_HEIGHT - PADDLE_HEIGHT, paddleY + MOVE_SPEED);
        socket.emit('paddleMove', { position: paddleY });
    }, 16); // 60 FPS
}

function stopMoving() {
    if (moveInterval) {
        clearInterval(moveInterval);
        moveInterval = null;
    }
}

// Button event listeners
if (upBtn) {
    upBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startMovingUp(); });
    upBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopMoving(); });
    upBtn.addEventListener('touchcancel', (e) => { e.preventDefault(); stopMoving(); });
    upBtn.addEventListener('mousedown', startMovingUp);
    upBtn.addEventListener('mouseup', stopMoving);
    upBtn.addEventListener('mouseleave', stopMoving);
}

if (downBtn) {
    downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startMovingDown(); });
    downBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopMoving(); });
    downBtn.addEventListener('touchcancel', (e) => { e.preventDefault(); stopMoving(); });
    downBtn.addEventListener('mousedown', startMovingDown);
    downBtn.addEventListener('mouseup', stopMoving);
    downBtn.addEventListener('mouseleave', stopMoving);
}

// Pause button
if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        socket.emit('pauseGame');
        vibrate(50);
    });
}

// Prevent scrolling on touch
document.body.addEventListener('touchmove', (e) => {
    if (controllerScreen.classList.contains('active')) {
        e.preventDefault();
    }
}, { passive: false });

// Add shake animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Focus PIN input on load
pinInput.focus();
