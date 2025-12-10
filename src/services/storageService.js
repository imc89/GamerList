// Local Storage Service for managing game collection

const STORAGE_KEY = 'gamerlist_collection';

// Available platforms
export const PLATFORMS = [
    'PC',
    "Mac",
    "iOS",
    "XONE",
    'PS5',
    'PS4',
    'Linux',
    'Series X|S',
    'Xbox One',
    'Wii',
    'WiiU',
    "Switch",
    'Switch 2',
    'DOS'
];

// Get all games from localStorage
export function getGames() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading games from localStorage:', error);
        return [];
    }
}

// Save a game to the collection
export function saveGame(game, platform) {
    try {
        const games = getGames();

        // Check if game already exists in this platform
        const existingIndex = games.findIndex(
            g => g.id === game.id && g.platform === platform
        );

        if (existingIndex !== -1) {
            // Game already exists in this platform
            return { success: false, message: 'Este juego ya está en tu colección para esta plataforma' };
        }

        // Add the game with platform information
        const newGame = {
            ...game,
            platform,
            addedDate: new Date().toISOString()
        };

        games.push(newGame);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(games));

        return { success: true, message: 'Juego añadido a tu colección' };
    } catch (error) {
        console.error('Error saving game:', error);
        return { success: false, message: 'Error al guardar el juego' };
    }
}

// Remove a game from the collection
export function removeGame(gameId, platform) {
    try {
        const games = getGames();
        const filtered = games.filter(g => !(g.id === gameId && g.platform === platform));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return { success: true, message: 'Juego eliminado de tu colección' };
    } catch (error) {
        console.error('Error removing game:', error);
        return { success: false, message: 'Error al eliminar el juego' };
    }
}

// Get games grouped by platform and sorted alphabetically
export function getGamesByPlatform() {
    const games = getGames();
    const grouped = {};

    // Group by platform
    games.forEach(game => {
        if (!grouped[game.platform]) {
            grouped[game.platform] = [];
        }
        grouped[game.platform].push(game);
    });

    // Sort each platform's games alphabetically
    Object.keys(grouped).forEach(platform => {
        grouped[platform].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    });

    // Sort platforms in the predefined order
    const sortedGrouped = {};
    PLATFORMS.forEach(platform => {
        if (grouped[platform] && grouped[platform].length > 0) {
            sortedGrouped[platform] = grouped[platform];
        }
    });

    // Add any platforms not in the predefined list
    Object.keys(grouped).forEach(platform => {
        if (!PLATFORMS.includes(platform)) {
            sortedGrouped[platform] = grouped[platform];
        }
    });

    return sortedGrouped;
}

// Check if a game exists in a specific platform
export function hasGame(gameId, platform) {
    const games = getGames();
    return games.some(g => g.id === gameId && g.platform === platform);
}

// Get count of games
export function getGameCount() {
    return getGames().length;
}

// Clear all games (optional utility)
export function clearAllGames() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return { success: true, message: 'Colección eliminada' };
    } catch (error) {
        console.error('Error clearing games:', error);
        return { success: false, message: 'Error al limpiar la colección' };
    }
}

// Export data to JSON
export function exportData() {
    try {
        const games = getGames();
        const dataStr = JSON.stringify(games, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = `gamerlist-backup-${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        return { success: true, message: 'Datos exportados correctamente' };
    } catch (error) {
        console.error('Error exporting data:', error);
        return { success: false, message: 'Error al exportar los datos' };
    }
}

// Import data from JSON
export function importJsonData(jsonData) {
    try {
        let parsedData;
        if (typeof jsonData === 'string') {
            parsedData = JSON.parse(jsonData);
        } else {
            parsedData = jsonData;
        }

        // Simple validation: check if it's an array
        if (!Array.isArray(parsedData)) {
            return { success: false, message: 'Archivo inválido: debe ser una lista de juegos' };
        }

        // Optional: Check if items have basic required props like 'id' and 'name'
        const validGames = parsedData.every(g => g.id && g.name && g.platform);
        if (!validGames) {
            return { success: false, message: 'Archivo inválido: formato de juego incorrecto' };
        }

        // Save to local storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));

        return { success: true, message: 'Datos importados correctamente' };
    } catch (error) {
        console.error('Error importing data:', error);
        return { success: false, message: 'Error al procesar el archivo de importación' };
    }
}

export default {
    PLATFORMS,
    getGames,
    saveGame,
    removeGame,
    getGamesByPlatform,
    hasGame,
    getGameCount,
    clearAllGames,
    exportData,
    importJsonData
};
