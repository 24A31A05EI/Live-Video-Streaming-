let peerConnection;
let ws;

const configuration = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

const remoteVideo = document.getElementById('remoteVideo');

function getServerUrl() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'ws://localhost:3000';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
}

function connect() {
    const serverUrl = getServerUrl();
    ws = new WebSocket(serverUrl);

    ws.onopen = () => {
        console.log("Connected to server");

        ws.send(JSON.stringify({
            type: 'viewer-join'
        }));
    };

    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        switch(data.type) {

            case 'offer':
                await createPeerConnection();
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                ws.send(JSON.stringify({
                    type: 'answer',
                    answer: answer,
                    viewerId: data.viewerId
                }));
                break;

            case 'candidate':
                if (peerConnection) {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
                }
                break;
        }
    };
}

async function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.ontrack = (event) => {
        remoteVideo.srcObject = event.streams[0]; // show stream
    };

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({
                type: 'candidate',
                candidate: event.candidate
            }));
        }
    };
}

connect();