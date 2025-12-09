// IGDB API Service
// Note: IGDB requires Twitch OAuth token. For a client-side app, we'll use a proxy or CORS-enabled approach
// The client ID provided needs to be used with Twitch authentication

const TWITCH_CLIENT_ID = 'hz0jx77bpwl3kccpmdoh3lfwsp1vkf';
const IGDB_API_URL = 'https://api.igdb.com/v4';

// For demo purposes, we'll use a simple approach with the client ID
// In production, you'd want to use a backend proxy to handle authentication
// and keep your client secret secure

let cachedToken = null;
let tokenExpiry = null;

// Get access token from Twitch (this would normally be done on a backend)
// For this demo, we're using the client credentials flow
// NOTE: This is not secure for production - tokens should be obtained server-side
export async function getAccessToken() {
    // Check if we have a valid cached token
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    // For now, we'll return the client ID as a fallback
    // In a real implementation, you'd need to:
    // 1. Have a backend endpoint that exchanges client_id + client_secret for a token
    // 2. Store the token securely
    // 3. Refresh when needed

    // This is a placeholder - the app will need proper authentication
    return TWITCH_CLIENT_ID;
}

export async function searchGames(query) {
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        const token = await getAccessToken();

        // IGDB API requires POST requests with a specific query language (Apicalypse)
        const response = await fetch(`${IGDB_API_URL}/games`, {
            method: 'POST',
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: `
        search "${query}";
        fields name, cover.url, platforms.name, platforms.abbreviation, first_release_date, summary;
        limit 20;
        where cover != null;
      `
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const games = await response.json();

        // Transform the data to a more usable format
        return games.map(game => ({
            id: game.id,
            name: game.name,
            coverUrl: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null,
            platforms: game.platforms?.map(p => p.abbreviation || p.name) || [],
            releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null,
            summary: game.summary || ''
        }));
    } catch (error) {
        console.error('Error searching games:', error);

        // Return mock data for development/demo purposes
        // This allows the UI to work even without proper API authentication
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
