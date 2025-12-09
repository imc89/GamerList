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

Before you begin, you'll need:

1. **Twitch Developer Account** (free)
   - Visit https://dev.twitch.tv/console
   - Enable Two-Factor Authentication (2FA)
   - Create a new application
   - Note your `Client ID` and `Client Secret`

2. **Netlify Account** (free)
   - Visit https://www.netlify.com

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Twitch API credentials:

```
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

### 3. Install Netlify CLI

```bash
npm install -g netlify-cli
```

### 4. Run Development Server

```bash
netlify dev
```

This will:
- Start the Vite dev server
- Run Netlify Functions locally
- Open your browser at `http://localhost:8888`

## Deployment to Netlify

### Option 1: Netlify UI (Recommended)

1. Push your code to GitHub
2. Go to https://app.netlify.com
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Add environment variables:
   - Go to Site settings → Environment variables
   - Add `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`
7. Click "Deploy site"

### Option 2: Netlify CLI

```bash
# Login to Netlify
netlify login

# Initialize the project
netlify init

# Deploy
netlify deploy --prod
```

When prompted, set the environment variables in the Netlify dashboard.

## Project Structure

```
GamerList/
├── netlify/
│   └── functions/
│       └── igdb-search.js      # Serverless API proxy
├── src/
│   ├── components/             # React components
│   ├── services/
│   │   ├── igdbService.js      # API client
│   │   └── storageService.js   # Local storage
│   └── App.jsx                 # Main app component
├── netlify.toml                # Netlify configuration
├── .env.example                # Environment variables template
└── package.json
```

## How It Works

1. **Frontend** makes requests to `/.netlify/functions/igdb-search`
2. **Netlify Function** authenticates with Twitch OAuth
3. **Function** proxies the request to IGDB API
4. **Results** are returned to the frontend

This architecture keeps your API credentials secure (server-side only) and avoids CORS issues.

## Scripts

- `npm start` - Start Vite dev server (use `netlify dev` instead for full functionality)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT

## Credits

- Game data provided by [IGDB](https://www.igdb.com/)
- Built with [React](https://react.dev/) and [Vite](https://vite.dev/)
