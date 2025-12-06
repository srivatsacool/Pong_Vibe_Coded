Here is an **updated + extended version of your `ARCHITECTURE.md`**, with the important details from our conversation added:

* **Cloudflare DNS requirements**
* **Nginx reverse-proxy HTTPS setup**
* **Certbot SSL steps**
* **Final production architecture for Pong**
* **Verified working Nginx HTTPS config**

I kept your original structure and inserted a new section:

> **“🔐 HTTPS + SSL Deployment (Cloudflare → Nginx → Node.js)”**

at the bottom of the Deployment Architecture.

---

# ✅ UPDATED `ARCHITECTURE.md` (copy–paste into your repo)

````md
# 🎮 PONG by Build.Srivatsa - Technical Architecture

## 📋 Project Overview

A real-time multiplayer Pong game where your **phone becomes the controller** and your **laptop/TV is the display**. Players connect using a simple 4-digit PIN code for seamless gameplay.

**Live URL:** https://pong.buildsrivatsa.qzz.io

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Node.js | Server runtime |
| **Framework** | Express.js | HTTP server & static files |
| **Real-time** | Socket.IO | WebSocket communication |
| **Frontend** | HTML5 + Vanilla JS | Game UI & rendering |
| **Graphics** | Canvas API | Game rendering |
| **Audio** | Web Audio API | Sound effects & music |
| **Haptics** | Vibration API | Phone haptic feedback |
| **Hosting** | Google Cloud VM | Production server |
| **Reverse Proxy** | Nginx | Traffic routing |
| **Process Manager** | PM2 | Node process management |
| **CDN/SSL** | Cloudflare | DNS, caching, HTTPS |

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Client Devices"
        Phone["📱 Phone<br/>(Controller)"]
        Laptop["💻 Laptop/TV<br/>(Display)"]
    end
    
    subgraph "Cloudflare"
        CF["☁️ Cloudflare<br/>DNS + SSL + CDN"]
    end
    
    subgraph "Google Cloud VM"
        Nginx["🔀 Nginx<br/>(Reverse Proxy + HTTPS)"]
        Node["⚙️ Node.js + Socket.IO<br/>(Game Server)"]
        PM2["📦 PM2<br/>(Process Manager)"]
    end
    
    Phone -->|HTTPS/WSS| CF
    Laptop -->|HTTPS/WSS| CF
    CF -->|HTTP/HTTPS| Nginx
    Nginx -->|proxy_pass| Node
    PM2 -->|manages| Node
````

---

## 📁 Project Structure

*(same as your original – unchanged)*

---

## 🚀 Deployment Architecture

```mermaid
graph LR
    subgraph "DNS"
        A[pong.buildsrivatsa.qzz.io]
    end
    
    subgraph "Cloudflare"
        B[Cloudflare Proxy + SSL Termination]
    end
    
    subgraph "GCP VM"
        C[Nginx :80/:443]
        D[Node.js :3000]
        E[PM2]
    end
    
    A --> B
    B -->|HTTPS (Full)| C
    C -->|proxy_pass| D
    E -->|manages| D
```

### Nginx (HTTP → Node) — BEFORE SSL

```nginx
server {
    listen 80;
    server_name pong.buildsrivatsa.qzz.io;

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

---

# 🔐 **HTTPS + SSL Deployment (Cloudflare → Nginx → Node.js)**

*(Added from our conversation)*

Your Pong app originally worked on **HTTP** but not **HTTPS** because:

1. Nginx was only listening on port **80**
2. No SSL certificate was installed
3. Cloudflare (Full mode) requires your origin to support HTTPS

This section documents the **final working SSL setup**.

---

## 1️⃣ Cloudflare DNS Configuration

| Type | Name   | Value        | Proxy                |
| ---- | ------ | ------------ | -------------------- |
| A    | `pong` | VM public IP | **Proxied (orange)** |

Cloudflare SSL Mode:

```
SSL/TLS → Mode → Full
```

---

## 2️⃣ Install Certbot & Enable HTTPS on VM

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

Then issue certificate:

```bash
sudo certbot --nginx -d pong.buildsrivatsa.qzz.io
```

Choose:

```
Redirect HTTP → HTTPS: YES
```

Certbot:

* Creates `/etc/letsencrypt/live/...` certs
* Adds an HTTPS server block to Nginx
* Enables auto-renewal

---

## 3️⃣ Final Nginx Configuration (HTTP + HTTPS)

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

This fully enables:

* 🔒 HTTPS
* 🔒 WSS (WebSockets over SSL)
* ↪ Automatic redirection from http → https

---

## 4️⃣ Nginx Reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5️⃣ Final Production Flow

```text
Browser → Cloudflare (SSL) → Nginx (HTTPS reverse proxy) → Node.js (Socket.IO)
```

Everything now works on:

### 🔗 [https://pong.buildsrivatsa.qzz.io](https://pong.buildsrivatsa.qzz.io)

with secure **HTTPS + WSS**.

---

# ✅ END OF FILE

