const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Track active streams and viewers
let streamers = {}; // { streamerId: { socketId, username } }
let viewers = {}; // { viewerId: { socketId, username, streamerId } }

console.log("🚀 Server starting...");

io.on('connection', (socket) => {
    console.log(`\n✅ NEW CONNECTION: ${socket.id}`);
    
    socket.on('streamer-ready', () => {
        console.log(`📡 STREAMER READY: ${socket.id}`);
        
        streamers[socket.id] = {
            socketId: socket.id,
            username: socket.username || 'Streamer'
        };
        
        console.log(`🎬 Active streamers: ${Object.keys(streamers).length}`);
        
        // Notify all viewers that stream is live
        io.emit('stream-live', {
            streamerId: socket.id
        });
        
        // Broadcast viewer count
        broadcastViewerCount(socket.id);
    });

    socket.on('viewer-join', () => {
        console.log(`👁️ VIEWER JOINED: ${socket.id}`);
        
        // Find active streamer
        const streamerId = Object.keys(streamers)[0];
        
        if (streamerId) {
            console.log(`👁️ Viewer ${socket.id} joining stream ${streamerId}`);
            
            viewers[socket.id] = {
                socketId: socket.id,
                username: socket.username || 'Viewer',
                streamerId: streamerId
            };
            
            // Notify streamer about new viewer
            io.to(streamerId).emit('new-viewer', socket.id);
            
            // Notify this viewer that stream is live
            socket.emit('stream-live', {
                streamerId: streamerId
            });
            
            console.log(`👥 Current viewers for ${streamerId}: ${getViewerCount(streamerId)}`);
            
            // Broadcast updated viewer count
            broadcastViewerCount(streamerId);
        } else {
            console.log(`⚠️ No active streamer`);
            socket.emit('stream-offline');
        }
    });

    socket.on('offer', (data) => {
        console.log(`📨 OFFER from ${socket.id} to ${data.target}`);
        io.to(data.target).emit('offer', {
            from: socket.id,
            offer: data.offer
        });
    });

    socket.on('answer', (data) => {
        console.log(`📥 ANSWER from ${socket.id} to ${data.target}`);
        io.to(data.target).emit('answer', {
            from: socket.id,
            answer: data.answer
        });
    });

    socket.on('candidate', (data) => {
        io.to(data.target).emit('candidate', {
            from: socket.id,
            candidate: data.candidate
        });
    });

    socket.on('chat-message', (message) => {
        console.log(`💬 CHAT from ${socket.id}: ${message}`);
        
        // Broadcast to all connected clients
        io.emit('chat-message', {
            from: socket.id,
            message: message,
            username: socket.username || 'User'
        });
    });

    socket.on('disconnect', () => {
        console.log(`\n❌ DISCONNECTED: ${socket.id}`);
        
        // Check if streamer disconnected
        if (streamers[socket.id]) {
            const streamerId = socket.id;
            console.log(`🎬 Streamer ${streamerId} disconnected`);
            delete streamers[streamerId];
            
            // Notify all viewers
            io.emit('stream-offline');
            
            // Remove all viewers for this streamer
            Object.keys(viewers).forEach(viewerId => {
                if (viewers[viewerId].streamerId === streamerId) {
                    delete viewers[viewerId];
                }
            });
            
            console.log(`👥 Active viewers: ${Object.keys(viewers).length}`);
        }
        
        // Check if viewer disconnected
        if (viewers[socket.id]) {
            const streamerId = viewers[socket.id].streamerId;
            console.log(`👁️ Viewer ${socket.id} disconnected from ${streamerId}`);
            delete viewers[socket.id];
            
            // Broadcast updated viewer count
            broadcastViewerCount(streamerId);
            
            console.log(`👥 Current viewers for ${streamerId}: ${getViewerCount(streamerId)}`);
        }
    });
});

// Helper function to get viewer count for a streamer
function getViewerCount(streamerId) {
    return Object.values(viewers).filter(v => v.streamerId === streamerId).length;
}

// Helper function to broadcast viewer count
function broadcastViewerCount(streamerId) {
    const count = getViewerCount(streamerId);
    console.log(`📢 Broadcasting viewer count: ${count}`);
    
    // Send to streamer
    io.to(streamerId).emit('viewer-count', count);
    
    // Send to all viewers
    Object.values(viewers).forEach(viewer => {
        if (viewer.streamerId === streamerId) {
            io.to(viewer.socketId).emit('viewer-count', count);
        }
    });
}

server.listen(3000, () => {
    console.log('\n🎥 LiveStream Server running on http://localhost:3000');
    console.log('Press Ctrl+C to stop\n');
});