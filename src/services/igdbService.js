/**
 * IGDB API Service / Servicio de API IGDB
 * 
 * This service handles all communication with the IGDB (Internet Game Database) API.
 * Este servicio maneja toda la comunicación con la API de IGDB (Internet Game Database).
 * 
 * ARCHITECTURE / ARQUITECTURA:
 * - Development: Uses Vite proxy (configured in vite.config.js)
 * - Desarrollo: Usa proxy de Vite (configurado en vite.config.js)
 * - Production: Uses Vercel serverless functions as CORS proxy
 * - Producción: Usa funciones serverless de Vercel como proxy CORS
 * 
 * WHY PROXY? / ¿POR QUÉ PROXY?
 * IGDB API doesn't support CORS, so direct browser calls fail.
 * La API de IGDB no soporta CORS, por lo que las llamadas directas desde el navegador fallan.
 * The proxy acts as an intermediary that adds CORS headers.
 * El proxy actúa como intermediario que añade headers CORS.
 */

// Twitch API credentials (required for IGDB authentication)
// Credenciales de API de Twitch (requeridas para autenticación de IGDB)
const TWITCH_CLIENT_ID = 'hz0jx77bpwl3kccpmdoh3lfwsp1vkf';
const TWITCH_CLIENT_SECRET = 'zpbvke1c0riov3ogijrzyqm38kwi7n';

// Detect if running in development or production
// Detectar si se está ejecutando en desarrollo o producción
const isDev = import.meta.env.DEV;

// Vercel proxy URL for production
// URL del proxy de Vercel para producción
// This is the deployed Vercel serverless functions URL
// Esta es la URL de las funciones serverless desplegadas en Vercel
const VERCEL_PROXY_URL = 'https://gamer-list-proxy.vercel.app';

// API endpoints based on environment
// Endpoints de API según el entorno
const AUTH_URL = isDev
    ? '/api/twitch/token'      // Development: Vite proxy / Desarrollo: proxy de Vite
    : `${VERCEL_PROXY_URL}/api/twitch-token`; // Production: Vercel / Producción: Vercel

const API_URL = isDev
    ? '/api/igdb/games'        // Development: Vite proxy / Desarrollo: proxy de Vite
    : `${VERCEL_PROXY_URL}/api/igdb-games`;   // Production: Vercel / Producción: Vercel

// Token cache to avoid requesting a new token on every search
// Caché de token para evitar solicitar un nuevo token en cada búsqueda
let cachedToken = null;
let tokenExpiry = null;

/**
 * Get OAuth access token from Twitch
 * Obtener token de acceso OAuth de Twitch
 * 
 * IGDB requires Twitch OAuth for authentication.
 * IGDB requiere OAuth de Twitch para autenticación.
 * Tokens are valid for ~60 days and are cached.
 * Los tokens son válidos por ~60 días y se almacenan en caché.
 */
async function getAccessToken() {
    // Return cached token if still valid (with 5 minute buffer for safety)
    // Devolver token en caché si aún es válido (con margen de 5 minutos por seguridad)
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
        return cachedToken;
    }

    try {
        console.log('🔑 Fetching OAuth token...');

        // Build OAuth URL with credentials
        // Construir URL OAuth con credenciales
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

        // Cache the token and its expiry time
        // Almacenar en caché el token y su tiempo de expiración
        cachedToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000);

        console.log('✅ OAuth token obtained');
        return cachedToken;
    } catch (error) {
        console.error('❌ Error getting OAuth token:', error);

        // Provide user-friendly error message in Spanish
        // Proporcionar mensaje de error amigable en español
        throw new Error(getUserFriendlyError(error, 'auth'));
    }
}

/**
 * Convert technical errors to user-friendly Spanish messages
 * Convertir errores técnicos a mensajes amigables en español
 */
function getUserFriendlyError(error, context = 'general') {
    const errorMessage = error.message.toLowerCase();

    // Network/connection errors / Errores de red/conexión
    if (errorMessage.includes('failed to fetch') || errorMessage.includes('network')) {
        return '❌ No se pudo conectar al servidor. Verifica tu conexión a internet e intenta de nuevo.';
    }

    // Timeout errors / Errores de timeout
    if (errorMessage.includes('timeout')) {
        return '⏱️ La solicitud tardó demasiado. El servidor puede estar ocupado, intenta de nuevo en unos momentos.';
    }

    // CORS errors / Errores CORS
    if (errorMessage.includes('cors')) {
        return '🔒 Error de seguridad del navegador. Por favor, contacta al administrador.';
    }

    // Authentication specific errors / Errores específicos de autenticación
    if (context === 'auth') {
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
            return '🔑 Error de autenticación. Por favor, recarga la página e intenta de nuevo.';
        }
        return '🔑 No se pudo obtener el token de autenticación. Por favor, intenta más tarde.';
    }

    // Search specific errors / Errores específicos de búsqueda
    if (context === 'search') {
        if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
            return '⏸️ Demasiadas búsquedas. Por favor, espera un momento antes de intentar de nuevo.';
        }
        if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
            return '🔧 El servicio de búsqueda no está disponible temporalmente. Intenta de nuevo en unos minutos.';
        }
        return '🔍 Error al buscar juegos. Por favor, intenta de nuevo.';
    }

    // Generic fallback / Respaldo genérico
    return '❌ Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.';
}

/**
 * Search for games using IGDB API
 * Buscar juegos usando la API de IGDB
 * 
 * @param {string} query - Search term / Término de búsqueda
 * @returns {Promise<Array>} - Array of game objects / Array de objetos de juegos
 */
export async function searchGames(query) {
    // Validate query length
    // Validar longitud de consulta
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        // Get authentication token
        // Obtener token de autenticación
        const token = await getAccessToken();

        console.log(`🔍 Searching for: ${query}`);

        // Send search request to IGDB via proxy
        // Enviar petición de búsqueda a IGDB vía proxy
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Client-ID': TWITCH_CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'text/plain' // IGDB uses custom query language
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

        // Parse and transform game data
        // Parsear y transformar datos de juegos
        const games = await response.json();
        console.log(`✅ Found ${games.length} games`);

        // Transform IGDB response to our app's format
        // Transformar respuesta de IGDB al formato de nuestra app
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

        // Convert to user-friendly error and re-throw
        // Convertir a error amigable y relanzar
        const friendlyError = new Error(getUserFriendlyError(error, 'search'));
        throw friendlyError;
    }
}

export default {
    searchGames
};