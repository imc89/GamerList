import { useState, useEffect, useRef } from 'react';
import { searchGames as apiSearchGames } from '../services/igdbService';
import SearchResults from './SearchResults';
import logoImage from '/ios/Icon-iOS-Dark-60x60@3x.png';

function SearchBar({ onGameAdd }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const searchBarRef = useRef(null);
    const sortMenuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
                setShowSortMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    // Sort results
    const sortedResults = [...results].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
            case 'oldest':
                return new Date(a.releaseDate || 0) - new Date(b.releaseDate || 0);
            case 'rating-high':
                return (b.rating || 0) - (a.rating || 0);
            case 'rating-low':
                return (a.rating || 0) - (b.rating || 0);
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0; // relevance (original order)
        }
    });

    // Clear search input after adding a game
    const handleGameAdd = (game) => {
        onGameAdd(game);
        setQuery(''); // Clear input
        setResults([]); // Clear results
        setSearched(false); // Reset searched state
    };

    const sortOptions = [
        { value: 'relevance', label: '🎯 Relevancia', icon: '🎯' },
        { value: 'newest', label: '🆕 Más nuevos', icon: '🆕' },
        { value: 'oldest', label: '📅 Más antiguos', icon: '📅' },
        { value: 'rating-high', label: '⭐ Mayor valoración', icon: '⭐' },
        { value: 'rating-low', label: '📉 Menor valoración', icon: '📉' },
        { value: 'name', label: '🔤 A-Z', icon: '🔤' }
    ];

    const currentSort = sortOptions.find(opt => opt.value === sortBy);

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
                    <div className="search-controls">
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

                        <div className="sort-dropdown" ref={sortMenuRef}>
                            <button
                                className="sort-button"
                                onClick={() => setShowSortMenu(!showSortMenu)}
                            >
                                <span>{currentSort.icon}</span>
                                <span className="sort-label">Ordenar</span>
                            </button>

                            {showSortMenu && (
                                <div className="sort-menu">
                                    {sortOptions.map(option => (
                                        <button
                                            key={option.value}
                                            className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                                            onClick={() => {
                                                setSortBy(option.value);
                                                setShowSortMenu(false);
                                            }}
                                        >
                                            <span className="sort-option-icon">{option.icon}</span>
                                            <span>{option.label}</span>
                                            {sortBy === option.value && <span className="checkmark">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {(searched || loading) && (
                <div className="container">
                    <SearchResults
                        results={sortedResults}
                        loading={loading}
                        onGameAdd={handleGameAdd}
                    />
                </div>
            )}
        </>
    );
}

export default SearchBar;
