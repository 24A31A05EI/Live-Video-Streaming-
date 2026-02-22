let peerConnections = {}; // store multiple connections
let localStream;
let ws;
let streamId = null;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// DOM elements
const localVideo = document.getElementById('localVideo');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDiv = document.getElementById('status');
const liveOverlay = document.getElementById('liveOverlay');
const viewerCountDisplay = document.getElementById('viewerCountDisplay');
const streamStatus = document.getElementById('streamStatus');
const shareSection = document.getElementById('shareSection');
const streamLink = document.getElementById('streamLink');
const viewersList = document.getElementById('viewersList');

async function startStream() {
    try {
        updateStatus('📷 Accessing camera...', 'info');

        localStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, frameRate: 30 },
            audio: true
        });

        localVideo.srcObject = localStream;

        updateStatus('✅ Camera ready! Connecting to server...', 'success');

        connectToServer();

        startBtn.disabled = true;
        stopBtn.disabled = false;
    } catch (error) {
        updateStatus('❌ Error: ' + error.message, 'error');
        console.error(error);
    }
}

function connectToServer() {
    ws = new WebSocket(getServerUrl());

    ws.onopen = () => {
        updateStatus('🔌 Connected to server!', 'success');
        ws.send(JSON.stringify({ type: 'streamer-ready' }));
    };

    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        switch(data.type) {

            case 'stream-created':
                streamId = data.streamId;
                setupStream(data.streamId);
                break;

            case 'viewer-joined':
                updateViewerCount(data.count);
                await createPeerConnection(data.viewerId);
                break;

            case 'answer':
                await peerConnections[data.viewerId].setRemoteDescription(new RTCSessionDescription(data.answer));
                console.log('✅ Answer received and set for viewer', data.viewerId);
                break;

            case 'candidate':
                if (peerConnections[data.viewerId]) {
                    await peerConnections[data.viewerId].addIceCandidate(new RTCIceCandidate(data.candidate));
                }
                break;

            case 'viewer-left':
                updateViewerCount(data.count);
                delete peerConnections[data.viewerId];
                break;
        }
    };

    ws.onclose = () => {
        updateStatus('❌ Disconnected from server', 'error');
        stopStream();
    };
}

function getServerUrl() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'ws://localhost:3000';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
}

function setupStream(id) {
    streamId = id;

    const baseUrl = window.location.origin;
    const viewerUrl = `${baseUrl}/viewer.html?stream=${id}`;
    streamLink.value = viewerUrl;

    shareSection.style.display = 'block';
    liveOverlay.style.display = 'flex';
    streamStatus.textContent = 'LIVE';
    streamStatus.style.color = '#4CAF50';

    updateStatus('🎥 You are LIVE! Share the link with viewers.', 'success');
}

async function createPeerConnection(viewerId) {
    const pc = new RTCPeerConnection(configuration);
    peerConnections[viewerId] = pc;

    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: 'candidate',
                viewerId: viewerId,
                candidate: event.candidate
            }));
        }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    ws.send(JSON.stringify({
        type: 'offer',
        viewerId: viewerId,
        offer: offer
    }));
}

function updateViewerCount(count) {
    viewerCountDisplay.textContent = count;
    if (count > 0) viewersList.style.display = 'block';
    else viewersList.style.display = 'none';
}

function stopStream() {
    if (localStream) localStream.getTracks().forEach(track => track.stop());
    Object.values(peerConnections).forEach(pc => pc.close());
    if (ws) ws.close();

    peerConnections = {};
    startBtn.disabled = false;
    stopBtn.disabled = true;
    liveOverlay.style.display = 'none';
    shareSection.style.display = 'none';
    viewersList.style.display = 'none';
    streamStatus.textContent = 'Offline';
    streamStatus.style.color = '#ff4444';
    updateStatus('Stream ended', 'info');
}

function updateStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    console.log(`[${type}] ${message}`);
}

window.addEventListener('beforeunload', () => stopStream());