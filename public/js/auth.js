console.log("✅ auth.js loaded");

document.addEventListener('DOMContentLoaded', function() {
    let username = localStorage.getItem('username');
    
    if (!username) {
        username = 'User_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('username', username);
        console.log("✅ Default username set:", username);
    }
    
    console.log("👤 Current user:", username);
});