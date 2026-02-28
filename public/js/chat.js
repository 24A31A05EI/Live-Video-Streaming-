console.log("💬 chat.js loading...");

function setupChat() {
    const socket = window.socket;
    
    socket.on("chat-message", (data) => {
        console.log("💬 Chat message received");
        
        const chatMessages = document.getElementById("chatMessages");
        if (!chatMessages) return;
        
        const messageEl = document.createElement("div");
        messageEl.className = "message";
        
        const username = localStorage.getItem('username') || 'User';
        const shortId = data.from.substring(0, 6);
        
        const usernameEl = document.createElement("span");
        usernameEl.className = "username";
        usernameEl.textContent = username + " (" + shortId + ")";
        
        const textEl = document.createElement("span");
        textEl.className = "text";
        textEl.textContent = data.message;
        
        messageEl.appendChild(usernameEl);
        messageEl.appendChild(document.createElement("br"));
        messageEl.appendChild(textEl);
        
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

setTimeout(() => {
    if (typeof window.socket !== 'undefined') {
        setupChat();
        console.log("✅ Chat setup complete");
    }
}, 1000);

console.log("✅ chat.js loaded");