// Netlify Serverless Function to proxy IGDB API requests
// This function handles OAuth token management and proxies game search requests

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const IGDB_API_URL = 'https://api.igdb.com/v4';
const TWITCH_OAUTH_URL = 'https://id.twitch.tv/oauth2/token';

// In-memory token cache (persists during function warm starts)
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get a valid OAuth access token from Twitch
 * Caches the token to minimize OAuth requests
 */
async function getAccessToken() {
    // Return cached token if still valid (with 5 minute buffer)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
        return cachedToken;
    }

    console.log('Fetching new OAuth token from Twitch...');

    try {
        const response = await fetch(
            `${TWITCH_OAUTH_URL}?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`OAuth request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Cache the token
        cachedToken = data.access_token;
        // Token expires in seconds, convert to milliseconds and store expiry time
        tokenExpiry = Date.now() + (data.expires_in * 1000);

        console.log('OAuth token obtained successfully');
        return cachedToken;
    } catch (error) {
        console.error('Error getting OAuth token:', error);
        throw error;
    }
}

/**
 * Search for games using the IGDB API
 */
async function searchGames(query) {
    if (!query || query.trim().length < 2) {
        return [];
    }

    const token = await getAccessToken();

    // IGDB API requires POST requests with Apicalypse query language
    const response = await fetch(`${IGDB_API_URL}/games`, {
        method: 'POST',
        headers: {
            'Client-ID': TWITCH_CLIENT_ID,
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'text/plain',
        },
        body: `
      search "${query}";
      fields name, cover.url, platforms.name, platforms.abbreviation, first_release_date, summary, rating;
      limit 20;
      where cover != null;
    `
    });

    if (!response.ok) {
        throw new Error(`IGDB API error: ${response.status} ${response.statusText}`);
    }

    const games = await response.json();

    // Transform the data to a more usable format
    return games.map(game => ({
        id: game.id,
        name: game.name,
        coverUrl: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null,
        platforms: game.platforms?.map(p => p.abbreviation || p.name) || [],
        releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
        summary: game.summary || '',
        rating: game.rating ? Math.round(game.rating) : null
    }));
}

/**
 * Netlify Function Handler
 */
exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
            body: '',
        };
    }

    try {
        // Validate environment variables
        if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
            console.error('Missing required environment variables');
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    error: 'Server configuration error',
                    message: 'Missing Twitch API credentials. Please configure TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET in Netlify environment variables.'
                }),
            };
        }

        // Parse request body
        const { query } = JSON.parse(event.body);

        if (!query) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({ error: 'Missing query parameter' }),
            };
        }

        // Search for games
        const games = await searchGames(query);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ games }),
        };
    } catch (error) {
        console.error('Function error:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }),
        };
    }
};
