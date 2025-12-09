# 🎮 GamerList

A modern web application to search, organize, and track your favorite video games. Built with React and powered by the IGDB API.

## Features

- 🔍 Search games from the comprehensive IGDB database
- 📋 Create custom game lists (Playing, Completed, Wishlist)
- 🎨 Beautiful, modern UI with smooth animations
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Netlify Serverless Functions
- **API**: IGDB (Internet Game Database)
- **Deployment**: Netlify

## Prerequisites

1. **Twitch Developer Account** (free):
   - Visit https://dev.twitch.tv/console
   - Enable Two-Factor Authentication (2FA)
   - Create a new application
   - Generate a Client Secret
   - Note your `Client ID` and `Client Secret`

2. **Netlify Account** (free):
   - Visit https://www.netlify.com

## Deployment to Netlify

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for Netlify deployment"
git push
```

### Step 2: Deploy on Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your **GitHub** account
4. Select your **GamerList** repository
5. Build settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **"Show advanced"** → **"New variable"**
7. Add environment variables:
   - `TWITCH_CLIENT_ID` = `hz0jx77bpwl3kccpmdoh3lfwsp1vkf`
   - `TWITCH_CLIENT_SECRET` = `zpbvke1c0riov3ogijrzyqm38kwi7n`
8. Click **"Deploy site"**

Your site will be live at: `https://your-site-name.netlify.app`

## Local Development

```bash
# Install dependencies
npm install

# Run with Netlify Dev (includes serverless functions)
npx netlify dev
```

## How It Works

1. Frontend calls `/.netlify/functions/igdb-search`
2. Netlify Function authenticates with Twitch OAuth (server-side)
3. Function proxies request to IGDB API
4. Results returned to frontend

This architecture:
- ✅ Resolves CORS issues (required by IGDB)
- ✅ Keeps credentials secure (server-side only)
- ✅ Caches OAuth tokens for performance

## License

MIT

## Credits

- Game data provided by [IGDB](https://www.igdb.com/)
- Built with [React](https://react.dev/) and [Vite](https://vite.dev/)
