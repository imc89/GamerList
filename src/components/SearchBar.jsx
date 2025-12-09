import { useState, useEffect, useRef } from 'react';
import { searchGames as apiSearchGames } from '../services/igdbService';
import SearchResults from './SearchResults';

function SearchBar({ onGameAdd }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchBarRef = useRef(null);

    // Debounce search
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setSearched(false);
            setShowSuggestions(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const games = await apiSearchGames(query);
                setResults(games);
                setSearched(true);
                setShowSuggestions(true); // Show dropdown with suggestions
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300); // Faster response for autocomplete

        return () => clearTimeout(timer);
    }, [query]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Clear search input after adding a game
    const handleGameAdd = (game) => {
        onGameAdd(game);
        setQuery(''); // Clear input
        setResults([]); // Clear results
        setSearched(false); // Reset searched state
        setShowSuggestions(false);
    };

    // Handle suggestion click
    const handleSuggestionClick = (game) => {
        setQuery(game.name);
        setShowSuggestions(false);
        setSelectedIndex(-1);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!showSuggestions || results.length === 0) return;

        const suggestedGames = results.slice(0, 6); // Show top 6 suggestions

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev =>
                prev < suggestedGames.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0) {
                const selectedGame = suggestedGames[selectedIndex];
                setQuery(selectedGame.name);
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setSelectedIndex(-1);
        }
    };

    return (
        <>
            <div className="search-section">
                <div className="container">
                    <h1 style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                        🎮 GamerList
                    </h1>
                    <div className="search-bar" ref={searchBarRef}>
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Buscar juegos..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => results.length > 0 && setShowSuggestions(true)}
                        />
                        {loading && <div className="search-loading"></div>}

                        {/* Autocomplete dropdown */}
                        {showSuggestions && results.length > 0 && (
                            <div className="autocomplete-dropdown">
                                {results.slice(0, 6).map((game, index) => (
                                    <div
                                        key={game.id}
                                        className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
                                        onClick={() => handleSuggestionClick(game)}
                                    >
                                        {game.coverUrl && (
                                            <img
                                                src={game.coverUrl}
                                                alt={game.name}
                                                className="autocomplete-image"
                                            />
                                        )}
                                        <div className="autocomplete-info">
                                            <div className="autocomplete-name">{game.name}</div>
                                            <div className="autocomplete-meta">
                                                {game.releaseDate && `${game.releaseDate}`}
                                                {game.platforms && game.platforms.length > 0 &&
                                                    ` • ${game.platforms.slice(0, 2).join(', ')}`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
