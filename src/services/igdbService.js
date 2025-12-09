// IGDB API Service
// Direct implementation following https://api-docs.igdb.com/#requests

// ⚠️ SECURITY WARNING ⚠️
// In a production app, the Client Secret should NEVER be exposed in frontend code
// This implementation is for demonstration purposes only
// For production, use a backend proxy to keep credentials secure

const TWITCH_CLIENT_ID = 'hz0jx77bpwl3kccpmdoh3lfwsp1vkf';
const TWITCH_CLIENT_SECRET = 'zpbvke1c0riov3ogijrzyqm38kwi7n'; // ⚠️ Client Secret (visible in frontend code)
const IGDB_API_URL = 'https://api.igdb.com/v4';
const TWITCH_OAUTH_URL = 'https://id.twitch.tv/oauth2/token';

// Token cache
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get OAuth access token from Twitch
 * Following: https://api-docs.igdb.com/#account-creation
 */
export async function getAccessToken() {
    // Return cached token if still valid (with 5 minute buffer)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
        return cachedToken;
    }

    if (!TWITCH_CLIENT_SECRET) {
        console.warn('⚠️ TWITCH_CLIENT_SECRET not configured. Using mock data.');
        return null;
    }

    try {
        console.log('Fetching new OAuth token from Twitch...');

        // POST to Twitch OAuth endpoint
        const response = await fetch(
            `${TWITCH_OAUTH_URL}?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
            {
                method: 'POST'
            }
        );

        if (!response.ok) {
            throw new Error(`OAuth failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Cache the token
        cachedToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000);

        console.log('✅ OAuth token obtained successfully');
        return cachedToken;
    } catch (error) {
        console.error('❌ Error getting OAuth token:', error);
        return null;
    }
}

/**
 * Search for games using IGDB API
 * Following: https://api-docs.igdb.com/#requests
 */
export async function searchGames(query) {
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        const token = await getAccessToken();

        if (!token) {
            console.warn('No access token available, falling back to mock data');
            return getMockResults(query);
        }

        // Make POST request to IGDB API with required headers
        // As per documentation: Client-ID and Authorization headers are required
        const response = await fetch(`${IGDB_API_URL}/games`, {
            method: 'POST',
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
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
    } catch (error) {
        console.error('❌ Error searching games:', error);

        // Return mock data for development/demo purposes
        return getMockResults(query);
    }
}

// Mock data for development/testing
function getMockResults(query) {
    const mockGames = [
        {
            id: 1,
            name: 'The Legend of Zelda: Breath of the Wild',
            coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7f.jpg',
            platforms: ['Switch', 'Wii U'],
            releaseDate: 2017,
            summary: 'Step into a world of discovery, exploration and adventure in The Legend of Zelda: Breath of the Wild.'
        },
        {
            id: 2,
            name: 'Elden Ring',
            coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co4jni.jpg',
            platforms: ['PC', 'PS5', 'PS4', 'XSXS', 'XONE'],
            releaseDate: 2022,
            summary: 'A new fantasy action RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.'
        },
        {
            id: 3,
            name: 'God of War Ragnarök',
            coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5s5v.jpg',
            platforms: ['PS5', 'PS4'],
            releaseDate: 2022,
            summary: 'Kratos and Atreus embark on a mythic journey for answers before Ragnarök arrives.'
        },
        {
            id: 4,
            name: 'Hades',
            coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2i0u.jpg',
            platforms: ['PC', 'Switch', 'PS5', 'PS4', 'XSXS', 'XONE'],
            releaseDate: 2020,
            summary: 'Defy the god of the dead as you hack and slash out of the Underworld in this rogue-like dungeon crawler.'
        },
        {
            id: 5,
            name: 'Cyberpunk 2077',
            coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg',
            platforms: ['PC', 'PS5', 'PS4', 'XSXS', 'XONE'],
            releaseDate: 2020,
            summary: 'An open-world, action-adventure story set in Night City, a megalopolis obsessed with power, glamour and body modification.'
        },
        {
            id: 6,
            name: 'Minecraft',
            coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co5w3b.jpg',
            platforms: ['PC', 'Switch', 'PS5', 'PS4', 'XSXS', 'XONE'],
            releaseDate: 2011,
            summary: 'A game about placing blocks and going on adventures.'
        }
    ];

    // Filter by search query
    const searchLower = query.toLowerCase();
    return mockGames.filter(game =>
        game.name.toLowerCase().includes(searchLower)
    ).slice(0, 10);
}

export default {
    searchGames,
    getAccessToken
};
