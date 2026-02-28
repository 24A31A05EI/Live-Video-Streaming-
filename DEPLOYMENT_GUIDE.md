# WebRTC Live Stream - Deployment Guide

## Overview
This is a Node.js WebRTC streaming application with authentication. Users must login before accessing any streaming features.

## Features Implemented
✅ **Login System** - Users must authenticate before accessing the platform
✅ **Session Management** - User sessions are tracked on the server
✅ **Protected Routes** - All streaming pages require authentication
✅ **Logout Functionality** - Users can logout from any page
✅ **Environment Configuration** - Support for environment variables

---

## Deployment Options

### Option 1: Heroku (Recommended for Beginners)
1. Create a Heroku account at https://heroku.com
2. Install Heroku CLI
3. In your project directory:
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   ```
4. Set environment variables:
   ```bash
   heroku config:set SESSION_SECRET="your-new-secret-key"
   heroku config:set NODE_ENV="production"
   ```
5. Your app will be live at: `https://your-app-name.herokuapp.com`

### Option 2: Railway.app (AWS-Powered, Free Tier)
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Connect your GitHub repo
4. Railway automatically detects Node.js and deploys
5. In Railway Dashboard → Environment → add:
   - `PORT` = 3000
   - `SESSION_SECRET` = your-secret-key
   - `NODE_ENV` = production
6. Your app will be live at: `https://your-project.railway.app`

### Option 3: Render (Simple & Free)
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables in "Environment"
7. Your app will be live at: `https://your-app.onrender.com`

### Option 4: DigitalOcean (Full Control - Paid ~$5/month)
1. Create a Droplet (OS: Ubuntu 22.04)
2. SSH into your server
3. Install Node.js:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
4. Clone your repo:
   ```bash
   git clone <your-repo-url>
   cd webrtc-live-stream
   npm install
   ```
5. Create `.env` file with your secrets
6. Use PM2 to keep app running:
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name "livestream"
   pm2 startup
   pm2 save
   ```
7. Setup Nginx as reverse proxy
8. Your app runs at your server's IP address

### Option 5: AWS Elastic Beanstalk
1. Create an AWS account
2. Install AWS CLI
3. In your project directory:
   ```bash
   eb init
   eb create my-app
   eb deploy
   ```
4. View your app: `eb open`

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] Change `SESSION_SECRET` in `.env` to a strong random key
- [ ] Set `NODE_ENV=production` in environment
- [ ] Test login/logout functionality locally
- [ ] Ensure all `.env` variables are set on the hosting platform
- [ ] Test with production database if using one
- [ ] Enable HTTPS on your hosting platform

---

## How to Use Once Deployed

1. **First Access**: Go to `https://your-app-domain.com`
2. **Redirected to Login**: You'll be automatically redirected to `/login.html`
3. **Login**: Enter any username/password (currently accepts any credentials for demo)
4. **Access Dashboard**: You'll see the home page with options to:
   - **Go Live** - Start broadcasting
   - **Watch** - Join someone's stream
   - **Logout** - Exit your session

---

## Customization

### Change Login Logic
Edit `/server.js` - Look for the `/api/login` route (line 28):
```javascript
// Currently accepts any username/password
// Replace with actual database verification:
if (username && password) {
    // Add real authentication here
    // Example: verify against hashed password in database
}
```

### Add Database
1. Install a database package: `npm install mysql2` or `npm install mongoose`
2. Update the login route to verify credentials against the database
3. Store user sessions with user IDs from database

### Enable HTTPS
Most hosting platforms (Heroku, Railway, Render) provide free HTTPS automatically.
For DigitalOcean, use Let's Encrypt with Certbot.

---

## Troubleshooting

### "Login page is not showing"
- **Cause**: Browser cache or old session
- **Solution**: Clear browser cookies or use incognito mode

### "Watch page not loading"
- **Cause**: Incomplete static file serving
- **Solution**: Ensure `watch.html` is in `/public` folder

### "Can't login after deployment"
- **Cause**: `SESSION_SECRET` not set or database connection failed
- **Solution**: 
  - Check environment variables on hosting platform
  - Test locally with `.env` file

### "CORS errors when streaming"
- **Cause**: Socket.io configuration
- **Solution**: Already configured in `server.js` with `cors: { origin: "*" }`

---

## Local Testing Before Deployment

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run locally
npm start
# Open http://localhost:3000
```

---

## File Structure
```
webrtc-live-stream/
├── server.js              # Main server with auth routes
├── package.json           # Dependencies
├── Procfile              # Deployment config
├── .env.example          # Environment template
├── public/
│   ├── index.html        # Home (protected)
│   ├── login.html        # Login page
│   ├── live.html         # Broadcasting (protected)
│   ├── watch.html        # Viewing (protected)
│   ├── js/
│   │   ├── auth.js       # Authentication logic
│   │   ├── socket.js     # WebSocket connection
│   │   ├── streamer.js   # Broadcasting logic
│   │   └── viewer.js     # Viewing logic
│   └── css/
│       └── style.css     # Styling
```

---

## Security Notes

⚠️ **Important**: The current demo implementation:
- Accepts any username/password for login
- Uses a simple session cookie
- Does NOT hash passwords

For production:
- ✅ Use `bcrypt` for password hashing
- ✅ Store user data in a real database (PostgreSQL, MongoDB)
- ✅ Use strong `SESSION_SECRET`
- ✅ Enable HTTPS
- ✅ Add CSRF protection

---

## Support
For issues or questions:
1. Check console logs: `heroku logs --tail` (Heroku)
2. Check environment variables
3. Verify all files are deployed
4. Test locally first

Happy streaming! 🎬
