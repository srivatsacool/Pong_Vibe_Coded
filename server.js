const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 15;
const BALL_SIZE = 15;
const BALL_SPEED = 6;
const PADDLE_SPEED = 8;
const WIN_SCORE = 10;

// Store active game rooms
const rooms = new Map();

// Generate unique 4-digit PIN
function generatePin() {
    let pin;
    do {
        pin = Math.floor(1000 + Math.random() * 9000).toString();
    } while (rooms.has(pin));
    return pin;
}

// Create initial game state
function createGameState() {
    return {
        ball: {
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT / 2,
            vx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
            vy: BALL_SPEED * (Math.random() - 0.5)
        },
        paddles: {
            left: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            right: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2
        },
        scores: { left: 0, right: 0 },
        isPlaying: false,
        isPaused: false,
        winner: null
    };
}

// Reset ball to center
function resetBall(gameState) {
    gameState.ball.x = GAME_WIDTH / 2;
    gameState.ball.y = GAME_HEIGHT / 2;
    gameState.ball.vx = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
    gameState.ball.vy = BALL_SPEED * (Math.random() - 0.5);
}

// Update game physics
function updateGame(room) {
    const state = room.gameState;
    if (!state.isPlaying || state.isPaused) return;

    const ball = state.ball;
    const paddles = state.paddles;

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall collision (top/bottom)
    if (ball.y <= BALL_SIZE / 2) {
        ball.y = BALL_SIZE / 2;
        ball.vy = Math.abs(ball.vy);
        emitSound(room, 'wall');
        emitHaptic(room, 'wall');
    } else if (ball.y >= GAME_HEIGHT - BALL_SIZE / 2) {
        ball.y = GAME_HEIGHT - BALL_SIZE / 2;
        ball.vy = -Math.abs(ball.vy);
        emitSound(room, 'wall');
        emitHaptic(room, 'wall');
    }

    // Left paddle collision
    if (ball.x <= PADDLE_WIDTH + BALL_SIZE / 2 && 
        ball.y >= paddles.left && 
        ball.y <= paddles.left + PADDLE_HEIGHT) {
        ball.x = PADDLE_WIDTH + BALL_SIZE / 2;
        ball.vx = Math.abs(ball.vx) * 1.02;
        
        const hitPos = (ball.y - paddles.left) / PADDLE_HEIGHT;
        ball.vy = (hitPos - 0.5) * BALL_SPEED * 2;
        
        emitSound(room, 'hit');
        emitHapticToPlayer(room, 'left', 'hit');
    }

    // Right paddle collision
    if (ball.x >= GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE / 2 && 
        ball.y >= paddles.right && 
        ball.y <= paddles.right + PADDLE_HEIGHT) {
        ball.x = GAME_WIDTH - PADDLE_WIDTH - BALL_SIZE / 2;
        ball.vx = -Math.abs(ball.vx) * 1.02;
        
        const hitPos = (ball.y - paddles.right) / PADDLE_HEIGHT;
        ball.vy = (hitPos - 0.5) * BALL_SPEED * 2;
        
        emitSound(room, 'hit');
        emitHapticToPlayer(room, 'right', 'hit');
    }

    // Score detection
    if (ball.x <= 0) {
        state.scores.right++;
        emitSound(room, 'score');
        emitHapticToPlayer(room, 'right', 'score');
        emitHapticToPlayer(room, 'left', 'scored_against');
        
        if (state.scores.right >= WIN_SCORE) {
            state.isPlaying = false;
            state.winner = 'right';
            emitHapticToPlayer(room, 'right', 'win');
            emitHapticToPlayer(room, 'left', 'lose');
        } else {
            resetBall(state);
        }
    } else if (ball.x >= GAME_WIDTH) {
        state.scores.left++;
        emitSound(room, 'score');
        emitHapticToPlayer(room, 'left', 'score');
        emitHapticToPlayer(room, 'right', 'scored_against');
        
        if (state.scores.left >= WIN_SCORE) {
            state.isPlaying = false;
            state.winner = 'left';
            emitHapticToPlayer(room, 'left', 'win');
            emitHapticToPlayer(room, 'right', 'lose');
        } else {
            resetBall(state);
        }
    }

    // AI for single player mode
    if (room.mode === 'single' && room.players.length === 1) {
        updateAI(state);
    }

    // Cap ball speed
    const maxSpeed = 15;
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    if (speed > maxSpeed) {
        ball.vx = (ball.vx / speed) * maxSpeed;
        ball.vy = (ball.vy / speed) * maxSpeed;
    }
}

// Simple AI opponent
function updateAI(state) {
    const targetY = state.ball.y - PADDLE_HEIGHT / 2;
    const currentY = state.paddles.right;
    const diff = targetY - currentY;
    
    const aiSpeed = PADDLE_SPEED * 0.7;
    if (Math.abs(diff) > 10) {
        if (diff > 0) {
            state.paddles.right = Math.min(currentY + aiSpeed, GAME_HEIGHT - PADDLE_HEIGHT);
        } else {
            state.paddles.right = Math.max(currentY - aiSpeed, 0);
        }
    }
}

// Emit sound event to room
function emitSound(room, soundType) {
    if (room.displaySocket) {
        room.displaySocket.emit('playSound', soundType);
    }
}

// Emit haptic to all players
function emitHaptic(room, hapticType) {
    room.players.forEach(player => {
        if (player.socket) {
            player.socket.emit('haptic', hapticType);
        }
    });
}

// Emit haptic to specific player
function emitHapticToPlayer(room, side, hapticType) {
    const player = room.players.find(p => p.side === side);
    if (player && player.socket) {
        player.socket.emit('haptic', hapticType);
    }
}

// Broadcast game state to room
function broadcastGameState(room) {
    const state = {
        ...room.gameState,
        constants: {
            GAME_WIDTH,
            GAME_HEIGHT,
            PADDLE_HEIGHT,
            PADDLE_WIDTH,
            BALL_SIZE
        }
    };
    
    if (room.displaySocket) {
        room.displaySocket.emit('gameState', state);
    }
    
    room.players.forEach(player => {
        if (player.socket) {
            player.socket.emit('gameState', state);
        }
    });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Display creates a new room
    socket.on('createRoom', (mode) => {
        const pin = generatePin();
        const room = {
            pin,
            mode: mode || 'single',
            displaySocket: socket,
            players: [],
            playerNames: { left: 'P1', right: 'P2' },
            gameState: createGameState(),
            gameLoop: null
        };
        
        rooms.set(pin, room);
        socket.roomPin = pin;
        socket.isDisplay = true;
        
        socket.emit('roomCreated', { 
            pin, 
            mode: room.mode,
            gameState: room.gameState,
            constants: {
                GAME_WIDTH,
                GAME_HEIGHT,
                PADDLE_HEIGHT,
                PADDLE_WIDTH,
                BALL_SIZE
            }
        });
        
        console.log(`Room created: ${pin} (${mode} mode)`);
    });

    // Controller joins a room with optional name
    socket.on('joinRoom', (pin, playerName) => {
        const room = rooms.get(pin);
        
        if (!room) {
            socket.emit('joinError', 'INVALID PIN');
            return;
        }
        
        const maxPlayers = room.mode === 'multi' ? 2 : 1;
        if (room.players.length >= maxPlayers) {
            socket.emit('joinError', 'ROOM FULL');
            return;
        }
        
        const playerIndex = room.players.length;
        const playerSide = playerIndex === 0 ? 'left' : 'right';
        const name = playerName || `P${playerIndex + 1}`;
        
        room.players.push({
            socket,
            side: playerSide,
            name: name
        });
        
        room.playerNames[playerSide] = name;
        
        socket.roomPin = pin;
        socket.playerSide = playerSide;
        socket.isController = true;
        socket.playerName = name;
        
        socket.emit('joinSuccess', { 
            side: playerSide, 
            playerNumber: playerIndex + 1,
            mode: room.mode,
            gameState: room.gameState,
            constants: {
                GAME_WIDTH,
                GAME_HEIGHT,
                PADDLE_HEIGHT,
                PADDLE_WIDTH,
                BALL_SIZE
            }
        });
        
        // Notify display with player name
        if (room.displaySocket) {
            room.displaySocket.emit('playerJoined', {
                playerNumber: room.players.length,
                side: playerSide,
                playerName: name,
                mode: room.mode
            });
        }
        
        console.log(`Player "${name}" joined room ${pin} as ${playerSide}`);
    });

    // Start game
    socket.on('startGame', () => {
        const room = rooms.get(socket.roomPin);
        if (!room) return;
        
        if (room.mode === 'single' && room.players.length < 1) {
            socket.emit('error', 'WAITING FOR PLAYER');
            return;
        }
        if (room.mode === 'multi' && room.players.length < 2) {
            socket.emit('error', 'WAITING FOR P2');
            return;
        }
        
        room.gameState.isPlaying = true;
        room.gameState.isPaused = false;
        room.gameState.winner = null;
        
        if (room.gameLoop) clearInterval(room.gameLoop);
        room.gameLoop = setInterval(() => {
            updateGame(room);
            broadcastGameState(room);
        }, 1000 / 60);
        
        if (room.displaySocket) {
            room.displaySocket.emit('gameStarted');
        }
        room.players.forEach(player => {
            player.socket.emit('gameStarted');
        });
        
        console.log(`Game started in room ${socket.roomPin}`);
    });

    // Paddle movement from controller
    socket.on('paddleMove', (data) => {
        const room = rooms.get(socket.roomPin);
        if (!room || !socket.playerSide) return;
        
        let newY = data.position;
        newY = Math.max(0, Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newY));
        room.gameState.paddles[socket.playerSide] = newY;
    });

    // Pause game
    socket.on('pauseGame', () => {
        const room = rooms.get(socket.roomPin);
        if (!room) return;
        
        room.gameState.isPaused = !room.gameState.isPaused;
        
        if (room.displaySocket) {
            room.displaySocket.emit('gamePaused', room.gameState.isPaused);
        }
        room.players.forEach(player => {
            player.socket.emit('gamePaused', room.gameState.isPaused);
        });
    });

    // Restart game
    socket.on('restartGame', () => {
        const room = rooms.get(socket.roomPin);
        if (!room) return;
        
        room.gameState = createGameState();
        broadcastGameState(room);
        
        if (room.displaySocket) {
            room.displaySocket.emit('gameRestarted');
        }
        room.players.forEach(player => {
            player.socket.emit('gameRestarted');
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        
        const room = rooms.get(socket.roomPin);
        if (!room) return;
        
        if (socket.isDisplay) {
            if (room.gameLoop) clearInterval(room.gameLoop);
            room.players.forEach(player => {
                player.socket.emit('roomClosed');
            });
            rooms.delete(socket.roomPin);
            console.log(`Room ${socket.roomPin} closed`);
        } else if (socket.isController) {
            room.players = room.players.filter(p => p.socket.id !== socket.id);
            
            if (room.displaySocket) {
                room.displaySocket.emit('playerLeft', {
                    playersRemaining: room.players.length,
                    side: socket.playerSide
                });
            }
            
            if (room.gameState.isPlaying) {
                room.gameState.isPaused = true;
                if (room.displaySocket) {
                    room.displaySocket.emit('gamePaused', true);
                }
            }
        }
    });
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/display', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

app.get('/controller', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'controller.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`🎮 Pong Server running on http://localhost:${PORT}`);
    console.log(`📺 Display: http://localhost:${PORT}/display`);
    console.log(`📱 Controller: http://localhost:${PORT}/controller`);
});
