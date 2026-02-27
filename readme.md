🚀 Live Video Streaming Website
A real-time WebRTC-based Live Streaming Platform built using Node.js, Socket.io, and WebRTC.
This project allows one streamer to broadcast live video & audio to multiple viewers with real-time chat support.
📌 Features
🎥 One Streamer → Multiple Viewers (Up to 10 viewers)
🔊 Live Audio & Video using WebRTC
💬 Real-time Chat System (Socket.io)
👀 Live Viewer Count
🔴 LIVE Badge Indicator
🖥 Clean & Responsive UI
⚡ Fast Real-Time Signaling Server
🏗 Tech Stack
Frontend
Backend
Real-Time
HTML
Node.js
WebRTC
CSS
Express.js
Socket.io
JavaScript


📂 Project Structure
Copy code

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
├── readme.md
└── server.js


⚙ Installation & Setup
1️⃣ Clone Repository
Bash
Copy code
git clone https://github.com/24A31A05EI/Live-Video-Streaming.git
cd Live-Video-Streaming
2️⃣ Install Dependencies
Bash
Copy code
npm install
3️⃣ Run Server
Bash
Copy code
node server.js
Server will run on:
Copy code

http://localhost:3000
🔄 How It Works
🔹 Streamer Flow
Access camera using getUserMedia
Create RTCPeerConnection
Generate Offer
Send Offer via Socket.io
Receive Answer from viewer
Connection established 🎉
🔹 Viewer Flow
Receive Offer
Create Answer
Send Answer back
WebRTC connection becomes connected


👥 Team Roles

🔵 WebRTC Engineer
Implement PeerConnection
Handle Offer/Answer
ICE Candidates
Media Streaming Logic

🌐 Backend Developer
Setup Node.js server
Implement Socket.io signaling
Manage live room
Handle viewer count

🎨 Frontend Developer
Design UI (Home, Live, Viewer pages)
Responsive layout
Video + Chat sections

💬 Feature Developer
Real-time Chat
LIVE Badge
Username display
Viewer counter


✅ Final Deliverables
✔ Streamer can go live
✔ Viewers can watch live
✔ Audio working
✔ Chat working
✔ Viewer count updating
✔ No major console errors


🚀 Future Improvements
Authentication System
Multi-room support
Recording & Playback
Screen sharing
Deployment on AWS / Render
Scalable SFU (Mediasoup)


📜 License
This project is for educational purposes.
