// IGDB API Service
// Uses Vite proxy in development (local) and Vercel proxy in production

const TWITCH_CLIENT_ID = 'hz0jx77bpwl3kccpmdoh3lfwsp1vkf';
const TWITCH_CLIENT_SECRET = 'zpbvke1c0riov3ogijrzyqm38kwi7n';

// Environment detection
const isDev = import.meta.env.DEV;

// Vercel proxy URL for production
const VERCEL_PROXY_URL = 'https://gamer-list-proxy.vercel.app';

// URLs based on environment
const AUTH_URL = isDev
    ? '/api/twitch/token'
    : `${VERCEL_PROXY_URL}/api/twitch-token`;

const API_URL = isDev
    ? '/api/igdb/games'
    : `${VERCEL_PROXY_URL}/api/igdb-games`;

// Token cache
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get OAuth access token from Twitch
 */
async function getAccessToken() {
    // Return cached token if still valid (with 5 minute buffer)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
        return cachedToken;
    }

    try {
        console.log('🔑 Fetching OAuth token...');

        const url = `${AUTH_URL}?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OAuth failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        cachedToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000);

        console.log('✅ OAuth token obtained');
        return cachedToken;
    } catch (error) {
        console.error('❌ Error getting OAuth token:', error);
        throw new Error('No se pudo obtener el token de autenticación. Por favor, intenta más tarde.');
    }
}

/**
 * Search for games using IGDB API
 */
export async function searchGames(query) {
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        const token = await getAccessToken();

        console.log(`🔍 Searching for: ${query}`);

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
            },
            body: `
                search "${query}";
                fields name, cover.url, platforms.name, platforms.abbreviation, first_release_date, summary, rating, screenshots.url, videos.video_id;
                limit 20;
                where cover != null;
            `
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`IGDB API error: ${response.status} - ${errorText}`);
        }

        const games = await response.json();
        console.log(`✅ Found ${games.length} games`);

        return games.map(game => ({
            id: game.id,
            name: game.name,
            coverUrl: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null,
            platforms: game.platforms?.map(p => p.abbreviation || p.name) || [],
            releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
            summary: game.summary || '',
            rating: game.rating ? Math.round(game.rating) : null,
            screenshots: game.screenshots?.map(s => `https:${s.url.replace('t_thumb', 't_screenshot_big')}`) || [],
            videos: game.videos?.map(v => v.video_id) || []
        }));
    } catch (error) {
        console.error('❌ Error searching games:', error);
        throw error;
    }
}

export default {
    searchGames
};