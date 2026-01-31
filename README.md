# 🎮 GamerList

A modern web application to search, organize, and track your favorite video games. Built with React and powered by the IGDB API.

## ✨ Features

- 🔍 **Real-time Search**: Search games from the comprehensive IGDB database
- 📋 **Multi-Platform Organization**: Organize games by platform (PC, PS5, Xbox, Switch, etc.)
- 💾 **Local Storage**: All data saved locally in your browser
- 📊 **Statistics**: View detailed stats about your collection
- 📤 **Import/Export**: Backup and restore your collection as JSON
- 🎨 **Modern UI**: Beautiful, responsive design with smooth animations
- 🔒 **Privacy-First**: No accounts, no tracking, all data stays on your device

## 🏗️ Architecture

### Frontend
- **React 19** + **Vite** for blazing-fast development
- **React Icons** for beautiful UI elements
- Deployed on **GitHub Pages**

### Backend (CORS Proxy)
- **Vercel Serverless Functions** to handle CORS and API proxying
- Two endpoints:
  - `/api/twitch-token` - Proxies Twitch OAuth authentication
  - `/api/igdb-games` - Proxies IGDB API game search requests
- **100% Free** - Vercel free tier (100GB bandwidth/month)
- **No expiration** - Unlike public CORS proxies

### Why Vercel Proxy?

The IGDB API doesn't support CORS for browser requests. Instead of using unreliable public proxies that expire or have rate limits, we created a custom serverless proxy on Vercel that:
- ✅ Never expires
- ✅ Has generous free tier limits
- ✅ Provides fast global CDN
- ✅ Handles authentication securely

## 🚀 Deployment

### Prerequisites

1. **GitHub Account** (for hosting the frontend)
2. **Vercel Account** (for the CORS proxy - sign in with GitHub, no separate account needed)

### Step 1: Deploy the CORS Proxy

The proxy backend is in a separate repository: [`GamerList-proxy`](https://github.com/imc89/GamerList-proxy)

1. Go to [Vercel](https://vercel.com)
2. Click "Continue with GitHub"
3. Import the `GamerList-proxy` repository
4. Click "Deploy"
5. Copy your deployment URL (e.g., `https://gamer-list-proxy.vercel.app`)

### Step 2: Configure Frontend

Update the proxy URL in `src/services/igdbService.js`:

```javascript
const VERCEL_PROXY_URL = 'https://your-deployment.vercel.app';
```

### Step 3: Deploy Frontend to GitHub Pages

```bash
npm run deploy
```

Your app will be live at: `https://yourusername.github.io/GamerList/`

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm start
```

Open http://localhost:5173

**Note**: In development, Vite's proxy handles CORS automatically. The Vercel proxy is only used in production.

## 📁 Project Structure

```
GamerList/
├── src/
│   ├── components/          # React components
│   │   ├── GameCard.jsx
│   │   ├── GameList.jsx
│   │   ├── SearchBar.jsx
│   │   └── ...
│   ├── services/            # API and storage services
│   │   ├── igdbService.js   # IGDB API integration
│   │   └── storageService.js # LocalStorage management
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── vite.config.js           # Vite configuration (dev proxy)
└── package.json

GamerList-proxy/             # Separate repository
├── api/
│   ├── twitch-token.js      # OAuth proxy endpoint
│   └── igdb-games.js        # IGDB API proxy endpoint
└── vercel.json              # Vercel configuration
```

## 🔧 How It Works

### Authentication Flow

1. Frontend requests OAuth token from `/api/twitch-token`
2. Vercel proxy forwards request to Twitch OAuth
3. Token is cached in frontend (valid for ~60 days)
4. Token is used for all IGDB API requests

### Search Flow

1. User types in search bar (debounced 500ms)
2. Frontend sends POST request to `/api/igdb-games` with:
   - IGDB query (game search)
   - Client-ID and Authorization headers
3. Vercel proxy forwards to IGDB API
4. Results are returned and displayed

### Data Storage

All game collection data is stored in browser's `localStorage`:
- No backend database needed
- Works offline (after initial load)
- Export/import functionality for backups

## 🛠️ Configuration

### Environment Variables (Proxy)

The proxy doesn't need environment variables - credentials are passed from the frontend. However, for better security in production, you could move them to Vercel environment variables.

### Vite Proxy (Development)

`vite.config.js` configures local proxies for development:

```javascript
server: {
  proxy: {
    '/api/twitch': 'https://id.twitch.tv',
    '/api/igdb': 'https://api.igdb.com'
  }
}
```

## 📊 Vercel Free Tier Limits

- **Bandwidth**: 100GB/month
- **Compute**: 100GB-hours
- **Deployments**: Unlimited
- **Functions**: 100,000 invocations/day

More than enough for personal use! 🎉

## 🔒 Security Note

⚠️ **API credentials are exposed in the frontend code**. This is acceptable for this project because:
- IGDB API keys are free and easy to obtain
- Rate limits are per-key, not per-user
- No sensitive user data is involved
- It's a personal project, not a commercial application

For production apps with sensitive data, implement proper backend authentication.

## 📝 License

MIT

## 🙏 Credits

- Game data provided by [IGDB](https://www.igdb.com/)
- Built with [React](https://react.dev/) and [Vite](https://vite.dev/)
- Deployed on [GitHub Pages](https://pages.github.com/) + [Vercel](https://vercel.com/)
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
