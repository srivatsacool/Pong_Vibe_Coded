# 🎮 PONG by Build.Srivatsa

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-black?logo=socket.io)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Play classic Pong using your phone as the controller!**

A real-time multiplayer Pong game where your **phone becomes the controller** and your **laptop/TV is the display**. Connect via a simple 4-digit PIN code.

---

## ✨ Features

- 🎮 **Phone Controller** - Use touch gestures to control your paddle
- 📺 **Big Screen Display** - Play on laptop, desktop, or TV
- 🔗 **Easy Connection** - Join games with a 4-digit PIN
- 👤 **Single Player** - Play against AI
- 👥 **Two Player** - Challenge a friend
- 📳 **Haptic Feedback** - Feel the game on your phone
- 🔊 **Sound Effects** - Retro-style sound FX
- 🎵 **Background Music** - Ambient synth soundtrack
- 🌈 **Modern Neon Design** - Sleek glassmorphism UI

---

## 🚀 Quick Start

### Prerequisites
- [Node.js 20+](https://nodejs.org/)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pong-game.git
cd pong-game

# Install dependencies
npm install

# Start the server
npm run dev
```

### Playing the Game

1. **Open the display** on your laptop: `http://localhost:3000`
2. **Choose game mode**: Single Player or Two Players
3. **Note the 4-digit PIN** displayed on screen
4. **Open the controller** on your phone: `http://YOUR_LAPTOP_IP:3000/controller`
5. **Enter your name and PIN**
6. **Start playing!** 🏓

> **Tip:** Find your laptop's IP with `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

---

## 📱 How It Works

```
┌─────────────┐      WebSocket      ┌─────────────┐
│   Phone     │◄──────────────────► │   Server    │
│ (Controller)│                     │  (Node.js)  │
└─────────────┘                     └──────┬──────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │   Laptop    │
                                    │  (Display)  │
                                    └─────────────┘
```

1. **Laptop** creates a game room and gets a PIN
2. **Phone** joins the room using the PIN
3. Touch movements on phone → Server → Display updates
4. All synchronized in real-time via Socket.IO

---

## 🎮 Controls

| Action | Phone | Keyboard (Display) |
|--------|-------|-------------------|
| Move paddle | Drag up/down | - |
| Start game | - | Space |
| Pause game | - | Escape |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Server runtime |
| **Express** | HTTP server |
| **Socket.IO** | Real-time WebSocket |
| **HTML5 Canvas** | Game rendering |
| **Web Audio API** | Sound effects |
| **Vibration API** | Haptic feedback |

---

## 📁 Project Structure

```
pong-game/
├── server.js           # Game server & Socket.IO logic
├── package.json        # Dependencies
└── public/
    ├── index.html      # Home page
    ├── display.html    # Game display
    ├── controller.html # Phone controller
    ├── Untitled.png    # Favicon
    └── js/
        ├── display.js    # Canvas rendering
        └── controller.js # Touch controls
```

---

## 🌐 Deployment

### Deploy to a VM (GCP/AWS/DigitalOcean)

```bash
# On your server
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Upload and start
cd /var/www/pong-game
npm install
pm2 start server.js --name pong
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name pong.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

### Cloudflare Setup
1. Add A record: `pong` → Your server IP
2. Enable proxy (orange cloud)
3. SSL mode: Full

---

## 🎨 Customization

### Change the theme colors
Edit the CSS in `display.html`:
```css
/* Cyan color */
#00f5ff

/* Magenta color */
#ff00ff
```

### Adjust game speed
Edit `server.js`:
```javascript
const BALL_SPEED = 7;      // Initial ball speed
const SPEED_INCREASE = 1.05; // Speed multiplier on hit
```

---

## 📄 License

MIT © Build.Srivatsa

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

<p align="center">
  Made with ❤️ by <strong>Build.Srivatsa</strong>
</p>
