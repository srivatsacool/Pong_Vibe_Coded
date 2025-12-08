# 🎮 PONG by Build.Srivatsa

<div align="center">

![Pong Game](./pong_screenshot.png)

### **CLASSIC ARCADE REIMAGINED**

*The timeless game of Pong with modern mobile controller support*

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)](https://nodejs.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?logo=socket.io)](https://socket.io)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Built by](https://img.shields.io/badge/Built%20by-Build.Srivatsa-orange)](https://github.com/srivatsacool)

**🎮 [Play Now](https://pong.buildsrivatsa.qzz.io)** | **📱 [Controller](https://pong.buildsrivatsa.qzz.io/controller)**

</div>

---

## 🤖 Semi Vibe-Coded

> **This project was semi vibe-coded** - built collaboratively with AI assistance (Claude/Gemini) using natural language prompts and iterative development. The core game mechanics, visual design, and real-time multiplayer architecture were developed through human-AI pair programming, combining creative vision with AI-powered code generation.

---

## 📖 Table of Contents

- [About the Game](#-about-the-game)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Quick Start](#-quick-start)
- [How to Play](#-how-to-play)
- [Game Modes](#-game-modes)
- [Architecture](#-architecture)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Credits](#-credits)

---

## 🏓 About the Game

**PONG by Build.Srivatsa** is a modern reimagining of the classic arcade game. Use your phone as a controller and your laptop/TV as the display for an authentic arcade experience!

| Aspect | Description |
|--------|-------------|
| **Genre** | Classic arcade sports |
| **Style** | Modern minimalist with neon accents |
| **Theme** | Retro arcade |
| **Objective** | Score 11 points to win |
| **Input** | Laptop/TV as display + Phone as controller |
| **Modes** | Single Player (AI) & Two Player |

---

## ✨ Features

### 🎮 Core Gameplay
- 🏓 **Classic Pong mechanics** - faithful to the original
- 🤖 **Smart AI opponent** - challenging single player mode
- 👥 **Two player mode** - challenge a friend
- 📱 **Phone controller** - intuitive touch controls
- 🔊 **Sound effects** - satisfying arcade sounds
- 📳 **Haptic feedback** - feel every hit
- 🏆 **Score tracking** - first to 11 wins

### 📱 Controller Features
- 🕹️ **Touch-optimized** - swipe or use buttons
- 📳 **Vibration feedback** - on ball contact
- 🎨 **Beautiful UI** - neon gradient design
- 📊 **Live score display** - always know the score
- 🔄 **Auto-reconnection** - seamless experience

### 🖥️ Display Features
- 🎨 **Modern design** - clean minimalist aesthetic
- ✨ **Neon effects** - glowing paddles and ball
- 📺 **Fullscreen support** - immersive gameplay
- 📊 **Real-time scores** - prominent display
- 🎵 **Background music** - optional retro beats

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Runtime** | Node.js 18+ | Server runtime |
| **Framework** | Express.js | HTTP server & static files |
| **Real-time** | Socket.IO 4.x | WebSocket communication |
| **Frontend** | Vanilla JS + Canvas | Game rendering |
| **Styling** | Pure CSS | Modern UI with gradients |
| **Audio** | Web Audio API | Sound effects & music |
| **Haptics** | Vibration API | Mobile feedback |
| **Process Manager** | PM2 | Production deployment |
| **Reverse Proxy** | Nginx | Traffic routing + SSL |
| **SSL** | Let's Encrypt (Certbot) | HTTPS certificates |
| **CDN/DNS** | Cloudflare | DNS, caching, SSL |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Local Development

```bash
# Clone the repository
git clone https://github.com/srivatsacool/pong-game.git
cd pong-game

# Install dependencies
npm install

# Start development server
npm start
# or
node server.js
```

Server runs at: `http://localhost:3000`

### Production with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name pong

# Save PM2 list
pm2 save

# Setup auto-restart
pm2 startup
```

---

## 🎯 How to Play

### Step 1: Open Display
Navigate to the game URL on your laptop/TV:
- **Local:** `http://localhost:3000`
- **Live:** `https://pong.buildsrivatsa.qzz.io`

### Step 2: Choose Mode
- **Single Player** - Play against AI
- **Two Players** - Challenge a friend
- **Join with PIN** - Enter room code

### Step 3: Connect Controller
On your phone, scan the QR code or:
- **Local:** `http://YOUR_IP:3000/controller`
- **Live:** `https://pong.buildsrivatsa.qzz.io/controller`

Enter the 4-digit PIN shown on display.

### Step 4: Play!
Move your paddle to hit the ball. First to 11 points wins!

### 📱 Controller Options

**Touch Movement:**
- Swipe up/down anywhere on screen
- Or use the on-screen paddle slider

**Button Mode:**
- UP button - move paddle up
- DOWN button - move paddle down

---

## 🎯 Game Modes

### 🤖 Single Player
Play against a computer opponent with smart AI:
- AI adapts to ball speed
- Progressive difficulty
- Perfect for practice

### 👥 Two Players
Challenge a friend:
- Each player uses their phone as controller
- Real-time synchronized gameplay
- First to 11 wins

### 🔗 Join with PIN
Join an existing game:
- Enter 4-digit room code
- Instantly connect to host
- Works across networks

---

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   📱 Player 1   │     │   📱 Player 2   │
│   Controller    │     │   Controller    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │    WebSocket/WSS      │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │  ☁️ Cloudflare │
              │  DNS + SSL    │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │  🔀 Nginx    │
              │  Reverse Proxy│
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │  📦 PM2      │
              │  Node.js App │
              │ (Socket.IO)  │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │  🖥️ Display  │
              │  Game Canvas │
              └─────────────┘
```

### Data Flow

1. **Display** creates room → generates 4-digit PIN
2. **Controller(s)** join with PIN
3. **Controllers** send paddle position via WebSocket
4. **Server** runs game physics, broadcasts state
5. **Display** renders game at 60 FPS

---

## 🌐 Deployment

### Production Setup (PM2 + Nginx + Cloudflare)

#### 1. Server Setup

```bash
# Clone to server
git clone https://github.com/srivatsacool/pong-game.git
cd pong-game
npm install

# Start with PM2
pm2 start server.js --name pong
pm2 save
pm2 startup
```

#### 2. Nginx Configuration

```nginx
server {
    listen 80;
    server_name pong.buildsrivatsa.qzz.io;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name pong.buildsrivatsa.qzz.io;

    ssl_certificate /etc/letsencrypt/live/pong.buildsrivatsa.qzz.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pong.buildsrivatsa.qzz.io/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }
}
```

#### 3. SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d pong.buildsrivatsa.qzz.io
```

#### 4. Cloudflare DNS

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `pong` | YOUR_VM_IP | ✅ Proxied |

Set SSL mode to: **Full**

---

## 📁 Project Structure

```
pong-game/
├── 📄 server.js              # Express + Socket.IO server
├── 📄 package.json           # Dependencies
├── 📄 ecosystem.config.js    # PM2 configuration
├── 📄 ARCHITECTURE.md        # Detailed architecture docs
├── 📄 README.md              # This file
│
├── 📂 public/
│   ├── 📄 index.html         # Home/Display page
│   ├── 📄 game.js            # Game engine
│   ├── 📄 style.css          # Display styles
│   │
│   └── 📂 controller/        # Mobile controller
│       ├── 📄 index.html     # Controller HTML
│       ├── 📄 controller.js  # Input handling
│       └── 📄 style.css      # Controller styles
│
└── 📂 assets/                # Game assets
    ├── 🔊 sounds/            # Sound effects
    └── 🖼️ images/            # Graphics
```

---

## 🎨 Visual Design

### Color Palette

| Element | Color | Hex |
|---------|-------|-----|
| Background | Dark Purple | `#1a1a2e` |
| Primary | Cyan | `#4ecdc4` |
| Secondary | Purple | `#667eea` |
| Accent | Pink | `#f093fb` |
| Ball | White | `#ffffff` |
| Player 1 Paddle | Cyan | `#4ecdc4` |
| Player 2 Paddle | Pink | `#f093fb` |

### Visual Effects
- Neon glow on paddles
- Ball trail effect
- Score pop animation
- Smooth paddle movement
- Gradient backgrounds

---

## 📊 Technical Specs

| Aspect | Specification |
|--------|---------------|
| **Rendering** | HTML5 Canvas 2D |
| **Physics** | Custom collision detection |
| **Frame Rate** | 60 FPS |
| **Network** | WebSocket (Socket.IO) |
| **Latency** | <50ms typical |
| **Font** | System fonts + Google Fonts |
| **Browser Support** | Chrome 80+, Firefox 75+, Safari 13+ |

---

## 🔧 Configuration

### Game Settings

```javascript
const CONFIG = {
  PADDLE_SPEED: 8,
  BALL_SPEED: 5,
  BALL_ACCELERATION: 1.05,
  WINNING_SCORE: 11,
  PADDLE_HEIGHT: 100,
  PADDLE_WIDTH: 15,
  BALL_SIZE: 15
};
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment |

---

## 🎮 Controls Summary

### Display (Keyboard - for testing)
| Key | Action |
|-----|--------|
| **W** | Player 1 Up |
| **S** | Player 1 Down |
| **↑** | Player 2 Up |
| **↓** | Player 2 Down |

### Controller (Touch)
| Gesture | Action |
|---------|--------|
| **Swipe Up** | Move paddle up |
| **Swipe Down** | Move paddle down |
| **Touch & Drag** | Direct control |

---

## 🤝 Credits

<div align="center">

### Built with ❤️ by **Build.Srivatsa**

🤖 **Semi Vibe-Coded** with AI assistance

Part of the arcade game collection featuring the innovative  
**laptop-display + phone-controller** architecture.

---

### 🎮 Arcade Collection

| Game | Description | Link |
|------|-------------|------|
| **PONG** | Classic arcade reimagined | [pong.buildsrivatsa.qzz.io](https://pong.buildsrivatsa.qzz.io) |
| **Just Drift** | 8-bit police chase | [jdrift.buildsrivatsa.qzz.io](https://jdrift.buildsrivatsa.qzz.io) |

---

**🏓 PONG 🏓**

*The game that started it all.*

**[Play Now →](https://pong.buildsrivatsa.qzz.io)**

</div>
