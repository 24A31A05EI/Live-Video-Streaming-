console.log("🎬 streamer.js loading...");

let localStream = null;
let peers = {};
let timerInterval = null;

document.addEventListener("DOMContentLoaded", () => {
    // ✅ FIX SHARE LINK (Works for Local + Render)
    const shareInput = document.getElementById("shareLink");
    if (shareInput) {
        shareInput.value = window.location.origin + "/watch.html";
        console.log("🔗 Share link set to:", shareInput.value);
    }
});

async function startStream() {
    console.log("🎬 START clicked");

    if (!window.socket) {
        alert("❌ Socket not initialized!");
        return;
    }

    if (!window.socket.connected) {
        alert("❌ Not connected to server!");
        return;
    }

    if (localStream) {
        console.log("⚠️ Already streaming");
        return;
    }

    try {
        const constraints = { 
            video: {
                width: { ideal: window.innerWidth <= 768 ? 480 : 1280 },
                height: { ideal: window.innerWidth <= 768 ? 360 : 720 },
                facingMode: 'user'
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        };

        localStream = await navigator.mediaDevices.getUserMedia(constraints);

        const localVideo = document.getElementById("localVideo");
        if (!localVideo) {
            console.error("❌ Video element not found");
            return;
        }

        localVideo.srcObject = localStream;

        window.socket.emit("streamer-ready");
        localStorage.setItem('isStreaming','true');

        const liveBadge = document.getElementById("liveBadge");
        if (liveBadge) liveBadge.style.display = "inline-block";

        document.getElementById("startBtn").disabled = true;
        document.getElementById("stopBtn").disabled = false;

        updateStatus('connection', true);
        updateStatus('audio', true);
        updateStatus('video', true);

        startTimer();

        console.log("✅ STREAM STARTED!");

    } catch (error) {
        console.error("❌ Error:", error.message);
        alert("Error: " + error.message);
    }
}

function stopStream() {
    localStorage.removeItem('isStreaming');

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    Object.keys(peers).forEach(id => {
        peers[id].close();
    });
    peers = {};

    document.getElementById("localVideo").srcObject = null;

    const liveBadge = document.getElementById("liveBadge");
    if (liveBadge) liveBadge.style.display = "none";

    document.getElementById("startBtn").disabled = false;
    document.getElementById("stopBtn").disabled = true;

    updateStatus('connection', false);
    updateStatus('audio', false);
    updateStatus('video', false);

    document.getElementById("streamDuration").textContent = "00:00";
    document.getElementById("streamViewers").textContent = "0";

    console.log("✅ Stream stopped");
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    let seconds = 0;
    timerInterval = setInterval(() => {
        seconds++;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        document.getElementById("streamDuration").textContent = 
            String(m).padStart(2, '0') + ":" + String(s).padStart(2, '0');
    }, 1000);
}

function updateStatus(type, status) {
    const icon = document.getElementById(type + 'Status');
    const text = document.getElementById(type + 'StatusText');
    if (!icon || !text) return;

    if (status) {
        icon.classList.add('active');
        text.textContent = type + ' ✓';
    } else {
        icon.classList.remove('active');
        text.textContent = type;
    }
}

// ===== SOCKET EVENTS =====

if (window.socket) {

    window.socket.on("new-viewer", async (viewerId) => {

        if (!localStream) return;

        try {
            const peer = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" }
                ]
            });

            peers[viewerId] = peer;

            localStream.getTracks().forEach(track => {
                peer.addTrack(track, localStream);
            });

            peer.onicecandidate = (event) => {
                if (event.candidate) {
                    window.socket.emit("candidate", { 
                        target: viewerId, 
                        candidate: event.candidate 
                    });
                }
            };

            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);

            window.socket.emit("offer", { 
                target: viewerId, 
                offer: offer 
            });

        } catch (error) {
            console.error("❌ Peer error:", error);
        }
    });

    window.socket.on("answer", async (data) => {
        const peer = peers[data.from];
        if (peer) {
            await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
    });

    window.socket.on("candidate", async (data) => {
        const peer = peers[data.from];
        if (peer && data.candidate) {
            await peer.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    });

    window.socket.on("viewer-count", (count) => {
        document.getElementById("streamViewers").textContent = count;
    });

} else {
    console.error("❌ Socket not ready in streamer.js!");
}

console.log("✅ streamer.js loaded");
console.log("✅ streamer.js loaded");
