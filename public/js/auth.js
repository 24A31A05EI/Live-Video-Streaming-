console.log("✅ auth.js loaded");

// ============ Login Page ============
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // We're on the login page
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    console.log("✅ Login successful:", data.username);
                    localStorage.setItem('username', data.username);
                    // Redirect to home page
                    window.location.href = '/';
                } else {
                    alert('❌ Login failed: ' + data.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('❌ Error: ' + error.message);
            }
        });
    } else {
        // We're on a page that's already logged in
        checkAndDisplayUser();
    }
});

// ============ Dashboard Pages ============
async function checkAndDisplayUser() {
    try {
        const response = await fetch('/api/auth-status');
        const data = await response.json();
        
        if (data.authenticated) {
            console.log("👤 User logged in:", data.username);
            localStorage.setItem('username', data.username);
            
            const welcomeElement = document.getElementById('welcomeUser');
            if (welcomeElement) {
                welcomeElement.textContent = 'Welcome, ' + data.username;
            }
        } else {
            console.log("❌ Not authenticated, redirecting to login");
            window.location.href = '/login.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// Logout function
async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        const data = await response.json();
        console.log("✅ Logged out");
        localStorage.removeItem('username');
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}