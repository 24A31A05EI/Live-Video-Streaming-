const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

let streamer = null;
let viewers = [];

wss.on('connection', (ws) => {

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch(data.type) {

            case 'streamer-ready':
                streamer = ws;
                ws.send(JSON.stringify({
                    type: 'stream-created',
                    streamId: 'live-stream'
                }));
                break;

            case 'viewer-join':
                if (streamer) {
                    const viewerId = Date.now() + Math.random(); // unique ID per viewer
                    ws.viewerId = viewerId;
                    viewers.push(ws);

                    // Notify streamer
                    streamer.send(JSON.stringify({
                        type: 'viewer-joined',
                        viewerId: viewerId,
                        count: viewers.length
                    }));
                }
                break;

            case 'offer':
                // Send offer to the correct viewer
                const targetViewer = viewers.find(v => v.viewerId === data.viewerId);
                if (targetViewer) {
                    console.log("📡 Offer received from streamer, sending to viewer", data.viewerId);
                    targetViewer.send(JSON.stringify({
                        type: 'offer',
                        offer: data.offer,
                        viewerId: data.viewerId
                    }));
                }
                break;

            case 'answer':
                console.log("📩 Answer received from viewer");
                if (streamer) {
                    streamer.send(JSON.stringify({
                        type: 'answer',
                        answer: data.answer,
                        viewerId: data.viewerId
                    }));
                }
                break;

            case 'candidate':
                if (ws === streamer) {
                    // Send ICE to the correct viewer
                    const targetViewerCandidate = viewers.find(v => v.viewerId === data.viewerId);
                    if (targetViewerCandidate) {
                        targetViewerCandidate.send(JSON.stringify({
                            type: 'candidate',
                            candidate: data.candidate,
                            viewerId: data.viewerId
                        }));
                    }
                } else {
                    if (streamer) {
                        streamer.send(JSON.stringify({
                            type: 'candidate',
                            candidate: data.candidate,
                            viewerId: ws.viewerId
                        }));
                    }
                }
                break;
        }
    });

    ws.on('close', () => {
        viewers = viewers.filter(v => v !== ws);
        if (ws === streamer) {
            streamer = null;
        } else {
            // Update viewer count for streamer
            if (streamer) {
                streamer.send(JSON.stringify({
                    type: 'viewer-left',
                    count: viewers.length
                }));
            }
        }
    });
});

server.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});