// IGDB API Service - Using Netlify Functions Proxy
// Resolves CORS issues by using serverless backend

const API_BASE_URL = '/.netlify/functions';

export async function searchGames(query) {
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        // Call the Netlify Function proxy
        const response = await fetch(`${API_BASE_URL}/igdb-search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        return data.games || [];
    } catch (error) {
        console.error('Error searching games:', error);

        // Return mock data as fallback
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
    searchGames
};
