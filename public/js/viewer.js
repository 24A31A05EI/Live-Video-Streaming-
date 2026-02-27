console.log("👁️ viewer.js loading...");

let peerConnection = null;
const remoteVideo = document.getElementById("remoteVideo");

console.log("📹 Video element:", remoteVideo ? "found" : "NOT FOUND");
console.log("🔌 Socket available:", typeof window.socket !== 'undefined');

// Configure remote video element
if (remoteVideo) {
    remoteVideo.autoplay = false;
    remoteVideo.playsInline = true;
    remoteVideo.muted = false;
    remoteVideo.controls = true;
    console.log("📹 Video configured: playsInline, controls enabled");
}

// Global play function accessible from HTML
window.playVideo = function() {
    console.log("🎬 playVideo called");
    
    if (!remoteVideo) {
        console.error("❌ Video element not found");
        return;
    }
    
    if (!remoteVideo.srcObject) {
        console.error("❌ No video stream");
        return;
    }
    
    console.log("📺 Attempting to play...");
    console.log("📺 Video readyState:", remoteVideo.readyState);
    console.log("📺 Video networkState:", remoteVideo.networkState);
    console.log("📺 Video paused:", remoteVideo.paused);
    
    remoteVideo.muted = false;
    
    const playPromise = remoteVideo.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log("▶️ ✅ VIDEO PLAYING!");
                window.hideLoading();
            })
            .catch(err => {
                console.error("❌ Play error:", err.name, err.message);
                
                // Try again with muted
                console.log("🔇 Trying with muted...");
                remoteVideo.muted = true;
                remoteVideo.play()
                    .then(() => console.log("▶️ Playing (muted)"))
                    .catch(e => console.error("❌ Still failed:", e.message));
            });
    } else {
        console.log("⚠️ play() returned undefined");
    }
};

// Global hide function
window.hideLoading = function() {
    const loadingMsg = document.getElementById("loadingMessage");
    if (loadingMsg) {
        loadingMsg.style.display = "none";
        console.log("✅ Loading message hidden");
    }
};

// Global show play button function
window.showPlayButton = function() {
    const loadingMsg = document.getElementById("loadingMessage");
    if (loadingMsg) {
        loadingMsg.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">▶️</div>
            <div>Click to Play</div>
            <div style="font-size: 0.85rem; margin-top: 0.8rem; opacity: 0.7;">or click the video</div>
        `;
        loadingMsg.style.display = "block";
        loadingMsg.style.cursor = "pointer";
        loadingMsg.onclick = () => window.playVideo();
        console.log("✅ Play button shown");
    }
};

function tryAutoPlay() {
    if (!remoteVideo || !remoteVideo.srcObject) {
        console.log("⚠️ No video stream to play");
        return;
    }

    console.log("🎬 Attempting auto-play...");
    const playPromise = remoteVideo.play();
    
    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                console.log("▶️ ✅ VIDEO AUTO-PLAYING!");
                window.hideLoading();
            })
            .catch(error => {
                console.log("⚠️ Autoplay blocked:", error.message);
                console.log("📢 Showing play button");
                window.showPlayButton();
            });
    }
}

function setupViewerSocket() {
    console.log("🔗 Setting up viewer socket events");
    
    const socket = window.socket;
    
    socket.on("connect", () => {
        console.log("⚡ Viewer socket connected to server");
        const loadingMsg = document.getElementById("loadingMessage");
        if (loadingMsg) {
            loadingMsg.innerHTML = `<div style="font-size:2rem;">🔌</div><div>Connected to server, waiting for stream...</div>`;
            loadingMsg.style.display = "block";
        }
    });
    
    console.log("📢 Emitting viewer-join");
    socket.emit("viewer-join");

    socket.on("stream-live", (data) => {
        console.log("✅ STREAM LIVE - Streamer:", data.streamerId);
        const liveBadge = document.getElementById("liveBadge");
        if (liveBadge) {
            liveBadge.style.display = "inline-block";
            console.log("✅ Live badge shown");
        }
        
        const loadingMsg = document.getElementById("loadingMessage");
        if (loadingMsg) {
            loadingMsg.innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div>
                <div>Connecting to stream...</div>
            `;
            loadingMsg.style.display = "block";
            loadingMsg.onclick = window.playVideo;
        }

        // help user start the video once offer arrives
        window.showPlayButton();
    });

    socket.on("stream-offline", () => {
        console.log("❌ Stream is offline");
        const liveBadge = document.getElementById("liveBadge");
        if (liveBadge) liveBadge.style.display = "none";
        
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
        if (remoteVideo) remoteVideo.srcObject = null;
        
        const loadingMsg = document.getElementById("loadingMessage");
        if (loadingMsg) {
            loadingMsg.innerHTML = '<div style="font-size: 2rem; margin-bottom: 0.5rem;">⏳</div><div>Waiting for streamer to go live...</div>';
            loadingMsg.style.display = "block";
            loadingMsg.onclick = null;
        }

        // hide any leftover play button
        loadingMsg.style.cursor = 'default';
    });

    socket.on("offer", async (data) => {
        console.log("📨 Got offer from streamer:", data.from);
        
        try {
            if (peerConnection) {
                console.log("🔄 Closing existing connection");
                peerConnection.close();
                peerConnection = null;
            }

            console.log("🤝 Creating new RTCPeerConnection");
            peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" },
                    { urls: "stun:stun2.l.google.com:19302" },
                    { urls: "stun:stun3.l.google.com:19302" },
                    { urls: "stun:stun4.l.google.com:19302" }
                ]
            });

            peerConnection.ontrack = (event) => {
                console.log("🎥 *** RECEIVED TRACK ***");
                console.log("🎥 Track kind:", event.track.kind);
                console.log("🎥 Streams count:", event.streams.length);
                
                if (!remoteVideo) {
                    console.error("❌ remoteVideo element not found!");
                    return;
                }

                console.log("📺 Setting remote video stream");
                remoteVideo.srcObject = event.streams[0];
                
                console.log("⏳ Video ready, waiting for user interaction");
                
                if (remoteVideo.readyState >= 2) {
                    console.log("📹 Metadata already available");
                    tryAutoPlay();
                } else {
                    remoteVideo.onloadedmetadata = () => {
                        console.log("📹 Metadata loaded - attempting auto-play");
                        tryAutoPlay();
                    };
                }
            };

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("candidate", { 
                        target: data.from, 
                        candidate: event.candidate 
                    });
                }
            };

            peerConnection.onconnectionstatechange = () => {
                console.log("🔗 Connection state:", peerConnection.connectionState);
            };

            peerConnection.onerror = (event) => {
                console.error("❌ Peer error:", event);
            };

            console.log("📥 Setting remote description");
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            console.log("✅ Remote description set");

            console.log("📝 Creating answer");
            const answer = await peerConnection.createAnswer();
            
            console.log("📤 Setting local description");
            await peerConnection.setLocalDescription(answer);
            
            console.log("📤 Sending answer to streamer");
            socket.emit("answer", { 
                target: data.from, 
                answer: answer 
            });
            console.log("✅ Answer sent");

        } catch (error) {
            console.error("❌ Error handling offer:", error);
            console.error("Stack:", error.stack);
        }
    });

    socket.on("candidate", async (data) => {
        console.log("🧊 Received ICE candidate");
        
        if (!peerConnection) {
            console.log("⚠️ No peer connection yet");
            return;
        }
        
        if (!data.candidate) {
            console.log("⚠️ Candidate is null");
            return;
        }
        
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
            console.log("✅ ICE candidate added");
        } catch (e) {
            console.log("⚠️ Error adding candidate:", e.message);
        }
    });

    socket.on("viewer-count", (count) => {
        console.log("👥 Viewer count received:", count);
        
        const viewerCount = document.getElementById("viewerCount");
        if (viewerCount) {
            viewerCount.textContent = count + " watching";
            console.log("✅ Updated viewerCount:", count);
        }
        
        const chatViewerCount = document.getElementById("chatViewerCount");
        if (chatViewerCount) {
            chatViewerCount.textContent = count + " watching";
            console.log("✅ Updated chatViewerCount:", count);
        }
    });

    socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
        if (peerConnection) {
            peerConnection.close();
            peerConnection = null;
        }
    });
}

// Setup socket when ready
setTimeout(() => {
    if (typeof window.socket !== 'undefined') {
        setupViewerSocket();
        console.log("✅ Viewer socket setup complete");
    } else {
        console.error("❌ Socket not available!");
    }
}, 1000);

// Video event listeners
if (remoteVideo) {
    remoteVideo.addEventListener('playing', () => {
        console.log("▶️ *** REMOTE VIDEO IS PLAYING NOW ***");
        window.hideLoading();
    });
    
    remoteVideo.addEventListener('pause', () => {
        console.log("⏸️ Video paused");
    });
    
    remoteVideo.addEventListener('loadstart', () => {
        console.log("📥 Video loading started");
    });
    
    remoteVideo.addEventListener('loadeddata', () => {
        console.log("✅ Video data loaded");
    });
    
    remoteVideo.addEventListener('loadedmetadata', () => {
        console.log("✅ Video metadata loaded");
    });
    
    remoteVideo.addEventListener('error', (e) => {
        console.error("❌ Video error:", e);
    });

    remoteVideo.addEventListener('click', () => {
        console.log("🖱️ User clicked on video");
        if (remoteVideo.paused) {
            window.playVideo();
        }
    });
}

console.log("✅ viewer.js loaded");