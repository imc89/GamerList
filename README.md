# 🎮 GamerList

A modern web application to search, organize, and track your favorite video games. Built with React and powered by the IGDB API.

## Features

- 🔍 Search games from the comprehensive IGDB database
- 📋 Create custom game lists (Playing, Completed, Wishlist)
- 🎨 Beautiful, modern UI with smooth animations
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: React + Vite
- **API**: IGDB (Internet Game Database)
- **Deployment**: GitHub Pages

## Prerequisites

**Twitch Developer Account** (free):
- Visit https://dev.twitch.tv/console
- Enable Two-Factor Authentication (2FA)
- Create a new application
- Set OAuth Redirect URL to your GitHub Pages URL (e.g., `https://yourusername.github.io/`)
- Generate a Client Secret
- Note your `Client ID` and `Client Secret`

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Credentials

Edit `src/services/igdbService.js` and add your Twitch Client Secret on line 10:

```javascript
const TWITCH_CLIENT_SECRET = 'your_client_secret_here';
```

⚠️ **Security Warning**: This exposes your Client Secret in the frontend code. For production apps, use a backend proxy instead.

### 3. Run Development Server

```bash
npm start
```

Open http://localhost:5173

## Deployment to GitHub Pages

```bash
npm run deploy
```

This will build your app and deploy it to GitHub Pages.

## Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Deploy to GitHub Pages
- `npm run lint` - Run ESLint

## How It Works

1. **Frontend** obtains an OAuth token from Twitch
2. **API calls** are made directly to IGDB with authentication headers
3. **Results** are displayed in the UI

## License

MIT

## Credits

- Game data provided by [IGDB](https://www.igdb.com/)
- Built with [React](https://react.dev/) and [Vite](https://vite.dev/)
