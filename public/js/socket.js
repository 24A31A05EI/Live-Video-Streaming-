console.log("🔌 socket.js - STARTING");

// Direct initialization without timeout
console.log("📍 Checking for io...");
console.log("io available:", typeof io);

if (typeof io === 'undefined') {
    console.error("❌ FATAL: Socket.IO library not loaded!");
    console.error("Make sure /socket.io/socket.io.js is being loaded");
} else {
    console.log("✅ Socket.IO library available");
    
    // Create socket immediately
    window.socket = io();
    console.log("✅ Socket instance created:", typeof window.socket);
    
    // Set up basic events
    window.socket.on("connect", () => {
        console.log("✅✅✅ SOCKET CONNECTED ✅✅✅");
        console.log("🆔 Socket ID:", window.socket.id);
    });
    
    window.socket.on("disconnect", () => {
        console.log("❌ SOCKET DISCONNECTED");
    });
    
    window.socket.on("connect_error", (error) => {
        console.error("❌ Connection Error:", error);
    });
    
    window.socket.on("error", (error) => {
        console.error("❌ Socket Error:", error);
    });
}

console.log("🔌 socket.js - DONE");