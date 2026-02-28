const express = require("express");
const session = require("express-session");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
    cors: { origin: "*" }
});

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication Middleware - Check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
};

// ============ Authentication Routes ============

// Login route
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    
    // Simple validation - accept any username/password
    // In production, use a real database and hash passwords
    if (username && password) {
        req.session.user = {
            username: username,
            id: 'user_' + Date.now()
        };
        console.log("✅ User logged in:", username);
        res.json({ success: true, message: "Login successful", username: username });
    } else {
        res.status(400).json({ success: false, message: "Invalid credentials" });
    }
});

// Check auth status
app.get("/api/auth-status", (req, res) => {
    if (req.session && req.session.user) {
        res.json({ authenticated: true, username: req.session.user.username });
    } else {
        res.json({ authenticated: false });
    }
});

// Logout route
app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true, message: "Logged out successfully" });
    });
});

// ============ Protected Routes ============

// Serve login page (always allowed)
app.get('/login.html', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Serve index.html (always allowed to redirect)
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        res.sendFile(__dirname + '/public/index.html');
    } else {
        res.redirect('/login.html');
    }
});

// Protected pages - require authentication
app.get('/index.html', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/live.html', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/live.html');
});

app.get('/watch.html', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/public/watch.html');
});

app.use(express.static("public"));

// Support multiple independent streams
let streamers = new Map(); // {streamerId: {isLive, viewers: Set}}
let viewers = new Map(); // {viewerId: streamerId watching}

function broadcastViewerCount(streamerId) {
    const streamerData = streamers.get(streamerId);
    if (streamerData && streamerData.isLive) {
        const viewerCount = streamerData.viewers.size;
        // Notify streamer
        io.to(streamerId).emit("viewer-count", viewerCount);
        // Notify all viewers watching this streamer
        for (let viewerId of streamerData.viewers) {
            io.to(viewerId).emit("viewer-count", viewerCount);
        }
    }
}

io.on("connection", (socket) => {
    console.log("✅ Connected:", socket.id);

    socket.on("streamer-ready", () => {
        console.log("🔴 Streamer ready:", socket.id);
        
        // Register this socket as a streamer
        if (!streamers.has(socket.id)) {
            streamers.set(socket.id, {
                isLive: true,
                viewers: new Set()
            });
        } else {
            streamers.get(socket.id).isLive = true;
        }
        
        // Broadcast to all that a stream is live
        io.emit("stream-live", { streamerId: socket.id });
        console.log("📡 Total active streamers:", streamers.size);
    });

    socket.on("viewer-join", () => {
        console.log("👁️ Viewer:", socket.id);
        
        // Check for available streamers
        let foundStreamer = null;
        for (let [streamerId, data] of streamers) {
            if (data.isLive) {
                foundStreamer = streamerId;
                break;
            }
        }
        
        if (foundStreamer) {
            // Always track the join for counting, even if it is the streamer
            streamers.get(foundStreamer).viewers.add(socket.id);
            viewers.set(socket.id, foundStreamer);

            // Notify viewer they can start watching (include current count)
            const currentCount = streamers.get(foundStreamer).viewers.size;
            socket.emit("stream-live", { streamerId: foundStreamer, viewerCount: currentCount });

            // If not the streamer, also inform the streamer about new viewer
            if (foundStreamer !== socket.id) {
                io.to(foundStreamer).emit("new-viewer", socket.id);
            }

            // Update viewer count for everyone
            broadcastViewerCount(foundStreamer);
            console.log("📊 Viewers on stream for", foundStreamer, ":", streamers.get(foundStreamer).viewers.size);
        } else {
            socket.emit("stream-offline");
        }
    });

    socket.on("offer", (data) => {
        io.to(data.target).emit("offer", { 
            offer: data.offer, 
            from: socket.id 
        });
    });

    socket.on("answer", (data) => {
        io.to(data.target).emit("answer", { 
            answer: data.answer, 
            from: socket.id 
        });
    });

    socket.on("candidate", (data) => {
        if (data.target) {
            io.to(data.target).emit("candidate", { 
                candidate: data.candidate, 
                from: socket.id 
            });
        }
    });

    socket.on("chat-message", (msg) => {
        io.emit("chat-message", { 
            from: socket.id, 
            message: msg,
            timestamp: new Date()
        });
    });

    socket.on("disconnect", () => {
        console.log("❌ Disconnected:", socket.id);
        
        // If this was a streamer
        if (streamers.has(socket.id)) {
            const data = streamers.get(socket.id);
            
            // Remove all viewers from this stream
            for (let viewerId of data.viewers) {
                viewers.delete(viewerId);
                io.to(viewerId).emit("stream-offline");
            }
            
            streamers.delete(socket.id);
            io.emit("stream-offline");
            console.log("🔴 Streamer disconnected, total active:", streamers.size);
        }
        
        // If this was a viewer
        if (viewers.has(socket.id)) {
            const streamerId = viewers.get(socket.id);
            viewers.delete(socket.id);
            
            if (streamers.has(streamerId)) {
                streamers.get(streamerId).viewers.delete(socket.id);
                broadcastViewerCount(streamerId);
            }
        }
    });

    // allow clients to ask if they're currently streaming
    socket.on("are-you-streamer", () => {
        const status = streamers.has(socket.id) && streamers.get(socket.id).isLive;
        socket.emit("streamer-status", {isStreamer: status});
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("🚀 Server running on port", process.env.PORT || 3000);
    console.log("🚀 http://localhost:" + (process.env.PORT || 3000));
});