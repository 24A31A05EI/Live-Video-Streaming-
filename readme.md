# 🚀 Live Video Streaming Platform

---

## 📄 Project Description

A real-time **WebRTC-based Live Streaming Platform** built using **Node.js, Express.js, Socket.io, and WebRTC**.
This platform allows one streamer to broadcast live video and audio to multiple viewers simultaneously, with real-time chat support and a clean, responsive user interface.

---

## ❗ Problem Statement

In today's digital world, real-time communication and live broadcasting have become essential for education, entertainment, business, and healthcare. However, building a low-latency, peer-to-peer live streaming system that supports multiple viewers with real-time interaction remains a technical challenge. This project addresses that gap by developing a lightweight, browser-based live video streaming platform using WebRTC and WebSocket technologies — eliminating the need for expensive third-party streaming services.

---

## ✨ Features

- 🎥 One Streamer → Multiple Viewers (broadcast model)
- 🔊 Live Audio & Video streaming using WebRTC
- 💬 Real-time Chat System for viewer interaction
- 👀 Live Viewer Count display
- 🔴 LIVE Badge Indicator during active streams
- 🖥️ Clean & Responsive UI for all devices
- ⚡ Fast WebSocket-based signaling via Socket.io

---

## 🏗️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Real-Time Communication | WebRTC, Socket.io |
| Deployment | Render (Cloud Hosting) |

---

## 📂 Project Structure

```
WEBRTC-LIVE-STREAM/
│
├── node_modules/
├── public/
│   ├── assets/
│   ├── css/
│   ├── js/
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── socket.js
│   │   ├── streamer.js
│   │   └── viewer.js
│   ├── index.html
│   ├── live.html
│   ├── login.html
│   ├── test.html
│   └── watch.html
│
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

---

## ⚙️ Installation & Setup

**1️⃣ Clone the Repository**
```bash
git clone https://github.com/24A31A05EI/Live-Video-Streaming.git
cd Live-Video-Streaming
```

**2️⃣ Install Dependencies**
```bash
npm install
```

**3️⃣ Run the Server**
```bash
node server.js
```

**4️⃣ Open in Browser**
```
http://localhost:3000
```

---

## 🔄 Usage

### 🎥 As a Streamer:
1. Open the application and navigate to the **Streamer Page**
2. Allow camera and microphone access when prompted
3. Click **Start Streaming** — your live session begins
4. Share the viewer link with your audience

### 👀 As a Viewer:
1. Open the **Viewer Page** link shared by the streamer
2. The live stream will load automatically
3. Use the **Chat Box** to interact in real time
4. View the live viewer count on screen

---

## 📸 Sample Output

### 🏠 Home Page
> *(Add screenshot here — e.g., `![Home Page](images/home.png)`)*

### 🔴 Live Streaming Page
> *(Add screenshot here — e.g., `![Streaming Page](images/live.png)`)*

### 👀 Viewer Page
> *(Add screenshot here — e.g., `![Viewer Page](images/watch.png)`)*

🔗 **Live Demo:** [Try the Application Here](https://live-video-streaming-8.onrender.com)

---

## 🚀 Future Improvements

- 🔐 User Authentication System
- 🏠 Multi-room Streaming Support
- 📹 Stream Recording & Playback
- 🖥️ Screen Sharing Feature
- ☁️ Scalable Cloud Deployment
- 📡 SFU Integration (Mediasoup) for large audiences

---

## 👥 Authors

| Name | Role  | GitHub |
|---|---|---|
| M. Ratna Sahithi | Full Stack Developer  | [GitHub](https://github.com/24A31A05EI) |
| M. Veera Venkata Manikanta | WebRTC Engineer | [GitHub](#) |
| P. Mahesh | Backend Developer  | [GitHub](#) |
| K. Durga Prasad | Frontend Developer | [GitHub](#) |

---

## 📜 License

This project is developed for **educational purposes** only.

---

⭐ If you found this project helpful, please give it a **star** on GitHub!
