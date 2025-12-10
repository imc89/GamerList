import { useEffect, useRef } from 'react';
import logoImage from '/ios/Icon-iOS-Dark-60x60@3x.png';

function SearchBar({ query, onSearchChange, onClear, loading }) {
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

    const handleClear = () => {
        onClear();
        inputRef.current?.focus();
    };

    return (
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
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder="Buscar juegos... (⌘K)"
                        value={query}
                        onChange={(e) => onSearchChange(e.target.value)}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
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
    );
}

export default SearchBar;
