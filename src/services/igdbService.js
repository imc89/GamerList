// IGDB API Service for GitHub Pages
// Uses CORS proxy to bypass browser restrictions

const TWITCH_CLIENT_ID = 'hz0jx77bpwl3kccpmdoh3lfwsp1vkf';
const TWITCH_CLIENT_SECRET = 'zpbvke1c0riov3ogijrzyqm38kwi7n';
const IGDB_API_URL = 'https://api.igdb.com/v4/games';
const TWITCH_OAUTH_URL = 'https://id.twitch.tv/oauth2/token';
const CORS_PROXY = 'https://corsproxy.io/?';

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

        // Use CORS proxy for the OAuth request
        const response = await fetch(
            `${CORS_PROXY}${TWITCH_OAUTH_URL}?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
            {
                method: 'POST'
            }
        );

        if (!response.ok) {
            throw new Error(`OAuth failed: ${response.status}`);
        }

        const data = await response.json();

        cachedToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000);

        console.log('✅ OAuth token obtained');
        return cachedToken;
    } catch (error) {
        console.error('❌ Error getting OAuth token:', error);
        return null;
    }
}

/**
 * Search for games using IGDB API through CORS proxy
 */
export async function searchGames(query) {
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        const token = await getAccessToken();

        if (!token) {
            console.warn('⚠️ No access token, using mock data');
            return getMockResults(query);
        }

        console.log(`🔍 Searching for: ${query}`);

        // Use CORS proxy to bypass browser restrictions
        const response = await fetch(`${CORS_PROXY}${IGDB_API_URL}`, {
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
            throw new Error(`IGDB API error: ${response.status}`);
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
        return getMockResults(query);
    }
}

// Mock data fallback
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

    const searchLower = query.toLowerCase();
    return mockGames.filter(game =>
        game.name.toLowerCase().includes(searchLower)
    ).slice(0, 10);
}

export default {
    searchGames
};
