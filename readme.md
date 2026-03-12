🚀 Live Video Streaming Platform
� � � � �
A real-time WebRTC-based Live Streaming Platform built using Node.js, Express.js, Socket.io, and WebRTC.
This platform allows one streamer to broadcast live video and audio to multiple viewers with real-time chat support.
🌐 Live Demo
🔗 Try the Application Here
https://live-video-streaming-8.onrender.com⁠�
📸 Project Screenshots
🏠 Home Page
(Add screenshot here)
🔴 Live Streaming Page
(Add screenshot here)
👀 Viewer Page
(Add screenshot here)
(You can upload screenshots to GitHub and paste the image link here)
Example:
Md
Copy code
![Home Page](images/home.png)
✨ Features
🎥 One Streamer → Multiple Viewers
🔊 Live Audio & Video using WebRTC
💬 Real-time Chat System
👀 Live Viewer Count
🔴 LIVE Badge Indicator
🖥 Clean & Responsive UI
⚡ Fast WebSocket Signaling
🏗 Tech Stack
🎨 Frontend
HTML
CSS
JavaScript
⚙ Backend
Node.js
Express.js
🔗 Real-Time Communication
WebRTC
Socket.io
📂 Project Structure
Id="28gzhv"
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
1️⃣ Clone the Repository
Bash id="5aq5hc"
Copy code
git clone https://github.com/24A31A05EI/Live-Video-Streaming.git
cd Live-Video-Streaming
2️⃣ Install Dependencies
Bash id="9wbgkn"
Copy code
npm install
3️⃣ Run the Server
Bash id="04f29n"
Copy code
node server.js
Server will start at:
Id="sv3h9l"
Copy code
http://localhost:3000
🔄 How It Works
🎥 Streamer Workflow
Access camera using getUserMedia
Create RTCPeerConnection
Generate WebRTC Offer
Send offer using Socket.io
Receive Answer from viewer
Peer connection established 🎉
👀 Viewer Workflow
Receive Offer
Create Answer
Send Answer via Socket.io
WebRTC connection becomes active
👥 Team Roles
🔵 WebRTC Engineer
Implement RTCPeerConnection
Manage Offer/Answer exchange
Handle ICE Candidates
Media streaming logic
🌐 Backend Developer
Node.js server setup
Socket.io signaling server
Manage live rooms
Viewer count management
🎨 Frontend Developer
UI design
Responsive layout
Video player integration
Chat interface
💬 Feature Developer
Real-time chat
LIVE badge
Username display
Viewer counter
🚀 Future Improvements
🔐 Authentication system
🏠 Multi-room streaming
📹 Recording & playback
🖥 Screen sharing
☁ Cloud deployment
📡 Scalable SFU (Mediasoup)
⭐ Support
If you like this project, please give it a star ⭐ on GitHub.
📜 License
This project is developed for educational purposes.
