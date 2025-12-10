import { useState, useEffect, useRef } from 'react';
import { searchGames as apiSearchGames } from '../services/igdbService';
import SearchResults from './SearchResults';
import logoImage from '/ios/Icon-iOS-Dark-60x60@3x.png';

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

    const inputRef = useRef(null);

    // Keyboard shortcut to focus search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Clear search
    const handleClear = () => {
        setQuery('');
        setResults([]);
        setSearched(false);
        inputRef.current?.focus();
    };

    return (
        <>
            <div className="search-section">
                <div className="container">
                    <div className="app-header">
                        <img
                            src={logoImage}
                            alt="GamerList"
                            className="app-logo"
                        />
                        <h1 className="app-title">GamerList</h1>
                    </div>
                    <div className="search-bar" ref={searchBarRef}>
                        <span className="search-icon">🔍</span>
                        <input
                            ref={inputRef}
                            type="text"
                            className="search-input"
                            placeholder="Buscar juegos... (⌘K)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && !loading && (
                            <button className="search-clear-btn" onClick={handleClear} title="Borrar búsqueda">
                                ✕
                            </button>
                        )}
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
