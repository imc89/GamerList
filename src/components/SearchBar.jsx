import { useState, useEffect } from 'react';
import { searchGames as apiSearchGames } from '../services/igdbService';
import SearchResults from './SearchResults';

function SearchBar({ onGameAdd }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    // Debounce search
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setSearched(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const games = await apiSearchGames(query);
                setResults(games);
                setSearched(true);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <>
            <div className="search-section">
                <div className="container">
                    <h1 style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        🎮 GamerList
                    </h1>
                    <p style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
                        Busca y gestiona tu colección de videojuegos
                    </p>
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar juegos..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {loading && <div className="search-loading"></div>}
                    </div>
                </div>
            </div>

            {(searched || loading) && (
                <div className="container">
                    <SearchResults
                        results={results}
                        loading={loading}
                        onGameAdd={onGameAdd}
                    />
                </div>
            )}
        </>
    );
}

export default SearchBar;
