# Quick Setup Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Create GitHub OAuth App
1. Visit: https://github.com/settings/applications/new
2. Fill in:
   - **Application name**: GitHub Manager
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:5000/api/auth/github/callback
3. Click "Register application"
4. Copy the **Client ID** and generate a **Client Secret**

## 3. Configure Environment
Edit the `.env` file and replace the placeholder values:

```env
GITHUB_CLIENT_ID=your_actual_client_id_here
GITHUB_CLIENT_SECRET=your_actual_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
JWT_SECRET=any_random_string_for_jwt_signing
PORT=5000
CLIENT_URL=http://localhost:3000
```

## 4. Start the Application
```bash
npm run dev
```

This will start both the backend (port 5000) and frontend (port 3000).

## 5. Open Your Browser
Navigate to: http://localhost:3000

## 6. Login with GitHub
Click "Login with GitHub" and authorize the application.

## Troubleshooting

### Port Issues
If ports 3000 or 5000 are in use, you can modify them in:
- Frontend port: `vite.config.ts` → `server.port`
- Backend port: `.env` → `PORT` variable

### OAuth Issues
- Ensure callback URL in GitHub OAuth app matches exactly: `http://localhost:5000/api/auth/github/callback`
- Check that CLIENT_ID and CLIENT_SECRET are correct in `.env`
- Make sure there are no extra spaces in the `.env` file

### Dependencies Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```