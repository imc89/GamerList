import { useState, useEffect, useRef } from 'react';
import { searchGames as apiSearchGames } from '../services/igdbService';
import SearchResults from './SearchResults';

function SearchBar({ onGameAdd }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const searchBarRef = useRef(null);

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

    // Clear search input after adding a game
    const handleGameAdd = (game) => {
        onGameAdd(game);
        setQuery(''); // Clear input
        setResults([]); // Clear results
        setSearched(false); // Reset searched state
    };

    return (
        <>
            <div className="search-section">
                <div className="container">
                    <div className="app-header">
                        <img
                            src="/ios/Icon-iOS-Dark-60x60@3x.png"
                            alt="GamerList"
                            className="app-logo"
                        />
                        <h1 className="app-title">GamerList</h1>
                    </div>
                    <div className="search-bar" ref={searchBarRef}>
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
                        onGameAdd={handleGameAdd}
                    />
                </div>
            )}
        </>
    );
}

export default SearchBar;
