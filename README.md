# 🎮 GamerList

A modern web application to search, organize, and track your favorite video games. Built with React and powered by the IGDB API.

## Features

- 🔍 Search games from the comprehensive IGDB database
- 📋 Create custom game lists (Playing, Completed, Wishlist)
- 🎨 Beautiful, modern UI with smooth animations
- 📱 Responsive design for all devices

## Tech Stack

- **Frontend**: React + Vite
- **API**: IGDB (Internet Game Database) via CORS proxy
- **Deployment**: GitHub Pages

## Deployment

### Deploy to GitHub Pages

```bash
npm run deploy
```

Your app will be live at: `https://yourusername.github.io/GamerList/`

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm start
```

Open http://localhost:5173

## How It Works

1. App uses a CORS proxy (`corsproxy.io`) to bypass browser restrictions
2. Gets OAuth token from Twitch
3. Calls IGDB API with authentication
4. Displays game results

⚠️ **Note**: This solution uses a public CORS proxy and exposes API credentials in the frontend. It's suitable for personal projects but not recommended for production apps. For production, use a backend proxy (e.g., Netlify Functions, Vercel, or your own server).

## License

MIT

## Credits

- Game data provided by [IGDB](https://www.igdb.com/)
- Built with [React](https://react.dev/) and [Vite](https://vite.dev/)
