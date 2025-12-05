// Display page JavaScript - Game rendering and Socket.IO client

const socket = io();

// ============== SOUND EFFECTS (Web Audio API) ==============
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

// Play a beep sound with custom frequency and duration
function playSound(type) {
    try {
        const ctx = initAudio();
        if (ctx.state === 'suspended') ctx.resume();
        
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        switch(type) {
            case 'hit':
                // Higher pitched blip for paddle hit
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(440, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.1);
                break;
                
            case 'wall':
                // Lower pitched thud for wall
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(220, ctx.currentTime);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.08);
                break;
                
            case 'score':
                // Triumphant ascending tone
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(330, ctx.currentTime);
                oscillator.frequency.setValueAtTime(440, ctx.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(550, ctx.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.4);
                break;
                
            case 'start':
                // Game start jingle
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(262, ctx.currentTime);
                oscillator.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(392, ctx.currentTime + 0.2);
                oscillator.frequency.setValueAtTime(523, ctx.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.5);
                break;
                
            case 'win':
                // Victory fanfare
                const osc1 = ctx.createOscillator();
                const gain1 = ctx.createGain();
                osc1.connect(gain1);
                gain1.connect(ctx.destination);
                osc1.type = 'square';
                osc1.frequency.setValueAtTime(523, ctx.currentTime);
                osc1.frequency.setValueAtTime(659, ctx.currentTime + 0.15);
                osc1.frequency.setValueAtTime(784, ctx.currentTime + 0.3);
                osc1.frequency.setValueAtTime(1047, ctx.currentTime + 0.45);
                gain1.gain.setValueAtTime(0.3, ctx.currentTime);
                gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
                osc1.start(ctx.currentTime);
                osc1.stop(ctx.currentTime + 0.8);
                return;
                
            case 'lose':
                // Sad descending tone
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(400, ctx.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + 0.5);
                break;
        }
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// Initialize audio on first user interaction
document.addEventListener('click', () => initAudio(), { once: true });
document.addEventListener('touchstart', () => initAudio(), { once: true });

// ============== BACKGROUND MUSIC ==============
let bgMusicPlaying = false;
let bgOscillators = [];
let bgGainNode = null;

function startBackgroundMusic() {
    if (bgMusicPlaying) return;
    
    try {
        const ctx = initAudio();
        if (ctx.state === 'suspended') ctx.resume();
        
        // Master gain for background music
        bgGainNode = ctx.createGain();
        bgGainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        bgGainNode.connect(ctx.destination);
        
        // Bass drone (low frequency hum)
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(55, ctx.currentTime); // A1
        bassGain.gain.setValueAtTime(0.4, ctx.currentTime);
        bassOsc.connect(bassGain);
        bassGain.connect(bgGainNode);
        bassOsc.start();
        bgOscillators.push({ osc: bassOsc, gain: bassGain });
        
        // Subtle pulsing pad
        const padOsc = ctx.createOscillator();
        const padGain = ctx.createGain();
        const padLfo = ctx.createOscillator();
        const padLfoGain = ctx.createGain();
        
        padOsc.type = 'triangle';
        padOsc.frequency.setValueAtTime(110, ctx.currentTime); // A2
        padLfo.type = 'sine';
        padLfo.frequency.setValueAtTime(0.5, ctx.currentTime); // Slow pulse
        padLfoGain.gain.setValueAtTime(0.15, ctx.currentTime);
        
        padLfo.connect(padLfoGain);
        padLfoGain.connect(padGain.gain);
        padGain.gain.setValueAtTime(0.2, ctx.currentTime);
        padOsc.connect(padGain);
        padGain.connect(bgGainNode);
        
        padOsc.start();
        padLfo.start();
        bgOscillators.push({ osc: padOsc, gain: padGain }, { osc: padLfo, gain: padLfoGain });
        
        // High ambient shimmer
        const shimmerOsc = ctx.createOscillator();
        const shimmerGain = ctx.createGain();
        const shimmerLfo = ctx.createOscillator();
        const shimmerLfoGain = ctx.createGain();
        
        shimmerOsc.type = 'sine';
        shimmerOsc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        shimmerLfo.type = 'sine';
        shimmerLfo.frequency.setValueAtTime(0.2, ctx.currentTime);
        shimmerLfoGain.gain.setValueAtTime(0.05, ctx.currentTime);
        
        shimmerLfo.connect(shimmerLfoGain);
        shimmerLfoGain.connect(shimmerGain.gain);
        shimmerGain.gain.setValueAtTime(0.08, ctx.currentTime);
        shimmerOsc.connect(shimmerGain);
        shimmerGain.connect(bgGainNode);
        
        shimmerOsc.start();
        shimmerLfo.start();
        bgOscillators.push({ osc: shimmerOsc, gain: shimmerGain }, { osc: shimmerLfo, gain: shimmerLfoGain });
        
        bgMusicPlaying = true;
        console.log('🎵 Background music started');
    } catch (e) {
        console.log('Background music error:', e);
    }
}

function stopBackgroundMusic() {
    if (!bgMusicPlaying) return;
    
    try {
        // Fade out
        if (bgGainNode) {
            const ctx = initAudio();
            bgGainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        }
        
        // Stop and disconnect oscillators after fade
        setTimeout(() => {
            bgOscillators.forEach(({ osc }) => {
                try { osc.stop(); } catch (e) {}
            });
            bgOscillators = [];
            bgGainNode = null;
            bgMusicPlaying = false;
            console.log('🔇 Background music stopped');
        }, 600);
    } catch (e) {
        console.log('Stop music error:', e);
    }
}

// ============== DOM Elements ==============
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const pinCodeEl = document.getElementById('pinCode');
const overlayPinEl = document.getElementById('overlayPin');
const controllerUrlEl = document.getElementById('controllerUrl');
const scoreLeftEl = document.getElementById('scoreLeft');
const scoreRightEl = document.getElementById('scoreRight');
const player1Label = document.getElementById('player1Label');
const player2Label = document.getElementById('player2Label');
const player1Dot = document.getElementById('player1Dot');
const player2Dot = document.getElementById('player2Dot');
const player1Name = document.getElementById('player1Name');
const player2Name = document.getElementById('player2Name');
const player1Status = document.getElementById('player1Status');
const player2Status = document.getElementById('player2Status');
const status1Dot = document.getElementById('status1Dot');
const status2Dot = document.getElementById('status2Dot');
const status1Text = document.getElementById('status1Text');
const status2Text = document.getElementById('status2Text');
const gameModeEl = document.getElementById('gameMode');
const waitingOverlay = document.getElementById('waitingOverlay');
const winnerOverlay = document.getElementById('winnerOverlay');
const pauseOverlay = document.getElementById('pauseOverlay');
const waitingText = document.getElementById('waitingText');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const winnerTitle = document.getElementById('winnerTitle');
const finalScore = document.getElementById('finalScore');
const connectionStatus = document.getElementById('connectionStatus');
const connectionText = document.getElementById('connectionText');

// ============== Game Constants ==============
let GAME_WIDTH = 800;
let GAME_HEIGHT = 600;
let PADDLE_HEIGHT = 100;
let PADDLE_WIDTH = 15;
let BALL_SIZE = 15;

// ============== Game State ==============
let gameState = null;
let roomPin = null;
let gameMode = 'single';
let playersConnected = 0;
let playerNames = { left: 'Player 1', right: 'Player 2' };
let scale = 1;

// Get game mode from URL
const urlParams = new URLSearchParams(window.location.search);
gameMode = urlParams.get('mode') || 'single';

// Set controller URL
const baseUrl = window.location.origin;
controllerUrlEl.textContent = `${baseUrl}/controller`;

// Update mode display
gameModeEl.textContent = gameMode === 'multi' ? 'Two Players' : 'Single Player';

// ============== Responsive Canvas ==============
function resizeCanvas() {
    const wrapper = document.querySelector('.canvas-wrapper');
    const maxWidth = wrapper.clientWidth - 20;
    const maxHeight = wrapper.clientHeight - 20;
    
    const scaleX = maxWidth / GAME_WIDTH;
    const scaleY = maxHeight / GAME_HEIGHT;
    scale = Math.min(scaleX, scaleY, 1);
    
    canvas.width = GAME_WIDTH * scale;
    canvas.height = GAME_HEIGHT * scale;
    
    if (gameState) render();
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => setTimeout(resizeCanvas, 100));

// ============== Socket Events ==============
socket.emit('createRoom', gameMode);

socket.on('roomCreated', (data) => {
    roomPin = data.pin;
    pinCodeEl.textContent = data.pin;
    overlayPinEl.textContent = data.pin;
    
    connectionStatus.classList.add('connected');
    connectionText.textContent = 'Online';
    
    if (data.constants) {
        GAME_WIDTH = data.constants.GAME_WIDTH;
        GAME_HEIGHT = data.constants.GAME_HEIGHT;
        PADDLE_HEIGHT = data.constants.PADDLE_HEIGHT;
        PADDLE_WIDTH = data.constants.PADDLE_WIDTH;
        BALL_SIZE = data.constants.BALL_SIZE;
    }
    
    gameState = data.gameState;
    resizeCanvas();
    updateUI();
    render();
});

socket.on('playerJoined', (data) => {
    playersConnected = data.playerNumber;
    playSound('hit'); // Beep when player joins
    
    if (data.playerName) {
        playerNames[data.side] = data.playerName;
    }
    
    if (data.side === 'left') {
        player1Dot.classList.add('connected');
        status1Dot.classList.add('connected');
        player1Status.classList.add('connected');
        player1Name.textContent = playerNames.left;
        status1Text.textContent = `${playerNames.left}: Ready`;
    } else {
        player2Dot.classList.add('connected');
        status2Dot.classList.add('connected');
        player2Status.classList.add('connected');
        player2Name.textContent = playerNames.right;
        status2Text.textContent = `${playerNames.right}: Ready`;
    }
    
    updateWaitingText();
    checkStartCondition();
});

socket.on('playerNameUpdate', (data) => {
    playerNames[data.side] = data.name;
    if (data.side === 'left') {
        player1Name.textContent = data.name;
        status1Text.textContent = `${data.name}: Ready`;
    } else {
        player2Name.textContent = data.name;
        status2Text.textContent = `${data.name}: Ready`;
    }
});

socket.on('playerLeft', (data) => {
    playersConnected = data.playersRemaining;
    updateWaitingText();
});

socket.on('gameState', (state) => {
    if (state.constants) {
        GAME_WIDTH = state.constants.GAME_WIDTH;
        GAME_HEIGHT = state.constants.GAME_HEIGHT;
        PADDLE_HEIGHT = state.constants.PADDLE_HEIGHT;
        PADDLE_WIDTH = state.constants.PADDLE_WIDTH;
        BALL_SIZE = state.constants.BALL_SIZE;
    }
    gameState = state;
    updateUI();
    render();
    
    if (state.winner) {
        showWinner(state.winner);
    }
});

socket.on('gameStarted', () => {
    waitingOverlay.classList.add('hidden');
    playSound('start');
    startBackgroundMusic();
});

socket.on('gamePaused', (isPaused) => {
    pauseOverlay.classList.toggle('hidden', !isPaused);
    if (isPaused) {
        stopBackgroundMusic();
    } else {
        startBackgroundMusic();
    }
});

socket.on('gameRestarted', () => {
    winnerOverlay.classList.add('hidden');
    waitingOverlay.classList.remove('hidden');
    pauseOverlay.classList.add('hidden');
    stopBackgroundMusic();
    checkStartCondition();
});

// Sound events from server
socket.on('playSound', (type) => {
    playSound(type);
});

socket.on('disconnect', () => {
    connectionStatus.classList.remove('connected');
    connectionText.textContent = 'Offline';
});

socket.on('connect', () => {
    connectionStatus.classList.add('connected');
    connectionText.textContent = 'Online';
});

// ============== UI Functions ==============
function updateUI() {
    if (!gameState) return;
    scoreLeftEl.textContent = gameState.scores.left;
    scoreRightEl.textContent = gameState.scores.right;
}

function updateWaitingText() {
    const requiredPlayers = gameMode === 'multi' ? 2 : 1;
    if (playersConnected >= requiredPlayers) {
        waitingText.textContent = `${playersConnected} player(s) ready!`;
    } else {
        waitingText.textContent = `Waiting for ${requiredPlayers - playersConnected} more player(s)...`;
    }
}

function checkStartCondition() {
    const requiredPlayers = gameMode === 'multi' ? 2 : 1;
    startBtn.disabled = playersConnected < requiredPlayers;
}

function showWinner(side) {
    const isLeftWinner = side === 'left';
    const winnerName = isLeftWinner ? playerNames.left : (gameMode === 'single' ? 'AI' : playerNames.right);
    winnerTitle.textContent = `${winnerName} Wins!`;
    winnerTitle.className = 'winner-title ' + side;
    finalScore.textContent = `Final Score: ${gameState.scores.left} - ${gameState.scores.right}`;
    winnerOverlay.classList.remove('hidden');
    
    // Stop background music and play win sound
    stopBackgroundMusic();
    playSound('win');
}

// ============== Button Handlers ==============
startBtn.addEventListener('click', () => socket.emit('startGame'));
restartBtn.addEventListener('click', () => socket.emit('restartGame'));

// ============== Keyboard Support ==============
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !startBtn.disabled && !waitingOverlay.classList.contains('hidden')) {
        socket.emit('startGame');
    }
    if (e.code === 'Escape') {
        socket.emit('pauseGame');
    }
});

// ============== Rendering ==============
function render() {
    if (!gameState) return;
    
    ctx.save();
    ctx.scale(scale, scale);
    
    // Clear with gradient
    const gradient = ctx.createLinearGradient(0, 0, GAME_WIDTH, GAME_HEIGHT);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Center line
    ctx.setLineDash([15, 10]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(GAME_WIDTH / 2, 0);
    ctx.lineTo(GAME_WIDTH / 2, GAME_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Left paddle with gradient and glow
    const leftGradient = ctx.createLinearGradient(0, gameState.paddles.left, 0, gameState.paddles.left + PADDLE_HEIGHT);
    leftGradient.addColorStop(0, '#00f5ff');
    leftGradient.addColorStop(1, '#0088aa');
    
    ctx.shadowColor = '#00f5ff';
    ctx.shadowBlur = 20;
    ctx.fillStyle = leftGradient;
    ctx.beginPath();
    ctx.roundRect(5, gameState.paddles.left, PADDLE_WIDTH, PADDLE_HEIGHT, 8);
    ctx.fill();
    
    // Right paddle with gradient and glow
    const rightGradient = ctx.createLinearGradient(0, gameState.paddles.right, 0, gameState.paddles.right + PADDLE_HEIGHT);
    rightGradient.addColorStop(0, '#ff00ff');
    rightGradient.addColorStop(1, '#aa0088');
    
    ctx.shadowColor = '#ff00ff';
    ctx.fillStyle = rightGradient;
    ctx.beginPath();
    ctx.roundRect(GAME_WIDTH - PADDLE_WIDTH - 5, gameState.paddles.right, PADDLE_WIDTH, PADDLE_HEIGHT, 8);
    ctx.fill();
    
    // Ball with glow
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball trail
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.2;
    for (let i = 1; i <= 4; i++) {
        const trailX = gameState.ball.x - gameState.ball.vx * i * 0.6;
        const trailY = gameState.ball.y - gameState.ball.vy * i * 0.6;
        ctx.fillStyle = '#00f5ff';
        ctx.beginPath();
        ctx.arc(trailX, trailY, (BALL_SIZE / 2) * (1 - i * 0.2), 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    ctx.restore();
}

resizeCanvas();
