# 🚀 Netflix Clone - Free Deployment Guide

Deploy your Netflix clone for **FREE** using Vercel (Frontend) and Render.com (Backend).

---

## 📋 Prerequisites

Before deploying, ensure you have:
- [ ] GitHub account
- [ ] MongoDB Atlas account (free tier)
- [ ] Firebase project (free tier)
- [ ] Vercel account (free)
- [ ] Render.com account (free)

---

## 🗄️ Step 1: Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 - Free Tier)
4. Click "Connect" → "Drivers" → "Node.js"
5. Copy your connection string
6. Replace `<password>` with your database password
7. **Save this for later** - you'll need it for backend deployment

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/netflix-clone?retryWrites=true&w=majority
```

---

## 🔥 Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract these values for backend deployment:
   - `project_id`
   - `private_key`
   - `client_email`

---

## 🖥️ Step 3: Backend Deployment (Render.com)

### 3.1 Push Backend to GitHub

```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
# Create a new GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/netflix-clone-backend.git
git push -u origin main
```

### 3.2 Deploy on Render.com

1. Go to [Render.com](https://render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `netflix-clone-backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   ```

6. Click "Create Web Service"
7. Wait for deployment to complete
8. **Copy your backend URL** (e.g., `https://netflix-clone-backend.onrender.com`)

---

## 🎨 Step 4: Frontend Deployment (Vercel)

### 4.1 Update Environment Variables

Create `.env` file in your frontend root:
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4.2 Push Frontend to GitHub

```bash
cd netflix-clone
git add .
git commit -m "Prepare for deployment"
# Push to your GitHub repository
git push origin main
```

### 4.3 Deploy on Vercel

1. Go to [Vercel](https://vercel.com/)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or your frontend folder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   - Click "Environment Variables"
   - Add all variables from your `.env` file

6. Click "Deploy"
7. Wait for deployment to complete
8. Your frontend is now live! 🎉

---

## 🔗 Step 5: Connect Frontend to Backend

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Update `VITE_API_URL` with your Render backend URL:
   ```
   https://your-backend-url.onrender.com/api
   ```
4. Redeploy the frontend

---

## 🌐 Step 6: CORS Configuration (Important!)

Update your backend CORS settings to allow your Vercel frontend:

Edit `backend/server.js`:
```javascript
// Replace the cors() line with:
app.use(cors({
  origin: [
    'http://localhost:5173',  // Local development
    'https://your-frontend-url.vercel.app'  // Production frontend
  ],
  credentials: true
}));
```

Push this change to GitHub and Render will auto-deploy.

---

## ✅ Verification Checklist

After deployment, verify:
- [ ] Frontend loads without errors
- [ ] Backend health check works: `https://your-backend.onrender.com/api/health`
- [ ] User registration/login works
- [ ] Database connections are working
- [ ] Firebase authentication works
- [ ] API calls from frontend to backend succeed

---

## 🔄 Auto-Deployment Setup

Both platforms support auto-deployment:

### Render.com (Backend)
- Already enabled by default
- Pushes to `main` branch trigger auto-deployment

### Vercel (Frontend)
- Already enabled by default
- Pushes to `main` branch trigger auto-deployment

---

## 🆓 Free Tier Limits

### Render.com (Backend)
- **RAM**: 512 MB
- **CPU**: Shared
- **Bandwidth**: 100 GB/month
- **Sleep**: After 15 minutes of inactivity (cold start ~30 seconds)

### Vercel (Frontend)
- **Bandwidth**: 100 GB/month
- **Builds**: 6000 minutes/month
- **Team Members**: 1
- **Functions**: Serverless functions included

### MongoDB Atlas
- **Storage**: 512 MB
- **Connections**: 500 max
- **Performance**: Shared RAM/vCPU

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: "Cannot connect to MongoDB"
- Check if IP whitelist includes `0.0.0.0/0` (all IPs)
- Verify connection string format

**Problem**: "Firebase initialization failed"
- Check if environment variables are set correctly
- Ensure private key is properly formatted (replace `\n` with actual newlines)

**Problem**: "CORS errors"
- Add your Vercel URL to CORS whitelist
- Check if credentials are enabled

### Frontend Issues

**Problem**: "API calls failing"
- Check browser console for CORS errors
- Verify `VITE_API_URL` is set correctly
- Ensure backend is awake (visit backend URL first)

**Problem**: "Build fails"
- Check if all dependencies are in `package.json`
- Verify `vite.config.js` is correct

---

## 📚 Useful Commands

```bash
# Test backend locally
cd backend
npm run dev

# Test frontend locally
cd netflix-clone
npm run dev

# Build frontend for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🎯 Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic on both platforms)
3. Set up monitoring and logging
4. Implement CI/CD pipelines
5. Add automated testing

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Firebase Docs**: https://firebase.google.com/docs

---

**🎉 Congratulations! Your Netflix clone is now live and accessible worldwide!**
