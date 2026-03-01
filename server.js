const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, {
    cors: { origin: "*" }
});

// Trust proxy for Render (IMPORTANT for sessions)
app.set('trust proxy', 1);

// ================= STATIC FILES (MOVE THIS TO TOP) =================
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= SESSION =================
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // IMPORTANT: keep false for Render free plan
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// ================= AUTH MIDDLEWARE =================
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
};

// ================= AUTH ROUTES =================

// Login
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        req.session.user = {
            username: username,
            id: 'user_' + Date.now()
        };

        req.session.save((err) => {
            if (err) {
                res.status(500).json({ success: false });
            } else {
                res.json({ success: true, username });
            }
        });
    } else {
        res.status(400).json({ success: false });
    }
});

// Auth status
app.get("/api/auth-status", (req, res) => {
    if (req.session && req.session.user) {
        res.json({ authenticated: true, username: req.session.user.username });
    } else {
        res.json({ authenticated: false });
    }
});

// Logout
app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// ================= PAGE ROUTES =================

// Home
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        res.sendFile(path.join(__dirname, "public", "index.html"));
    } else {
        res.redirect('/login.html');
    }
});

// Protected pages
app.get('/index.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get('/live.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "live.html"));
});

app.get('/watch.html', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "watch.html"));
});

// ================= STREAM LOGIC =================

let streamers = new Map();
let viewers = new Map();

function broadcastViewerCount(streamerId) {
    const streamerData = streamers.get(streamerId);
    if (streamerData && streamerData.isLive) {
        const viewerCount = streamerData.viewers.size;
        io.to(streamerId).emit("viewer-count", viewerCount);
        for (let viewerId of streamerData.viewers) {
            io.to(viewerId).emit("viewer-count", viewerCount);
        }
    }
}

io.on("connection", (socket) => {

    socket.on("streamer-ready", () => {
        if (!streamers.has(socket.id)) {
            streamers.set(socket.id, {
                isLive: true,
                viewers: new Set()
            });
        } else {
            streamers.get(socket.id).isLive = true;
        }
        io.emit("stream-live", { streamerId: socket.id });
    });

    socket.on("viewer-join", () => {
        let foundStreamer = null;
        for (let [streamerId, data] of streamers) {
            if (data.isLive) {
                foundStreamer = streamerId;
                break;
            }
        }

        if (foundStreamer) {
            streamers.get(foundStreamer).viewers.add(socket.id);
            viewers.set(socket.id, foundStreamer);

            const currentCount = streamers.get(foundStreamer).viewers.size;
            socket.emit("stream-live", { streamerId: foundStreamer, viewerCount: currentCount });

            if (foundStreamer !== socket.id) {
                io.to(foundStreamer).emit("new-viewer", socket.id);
            }

            broadcastViewerCount(foundStreamer);
        } else {
            socket.emit("stream-offline");
        }
    });

    socket.on("offer", (data) => {
        io.to(data.target).emit("offer", { offer: data.offer, from: socket.id });
    });

    socket.on("answer", (data) => {
        io.to(data.target).emit("answer", { answer: data.answer, from: socket.id });
    });

    socket.on("candidate", (data) => {
        if (data.target) {
            io.to(data.target).emit("candidate", { candidate: data.candidate, from: socket.id });
        }
    });

    socket.on("chat-message", (msg) => {
        io.emit("chat-message", { from: socket.id, message: msg });
    });

    socket.on("disconnect", () => {
        if (streamers.has(socket.id)) {
            const data = streamers.get(socket.id);
            for (let viewerId of data.viewers) {
                viewers.delete(viewerId);
                io.to(viewerId).emit("stream-offline");
            }
            streamers.delete(socket.id);
            io.emit("stream-offline");
        }

        if (viewers.has(socket.id)) {
            const streamerId = viewers.get(socket.id);
            viewers.delete(socket.id);
            if (streamers.has(streamerId)) {
                streamers.get(streamerId).viewers.delete(socket.id);
                broadcastViewerCount(streamerId);
            }
        }
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("🚀 Server running on port", process.env.PORT || 3000);
});
