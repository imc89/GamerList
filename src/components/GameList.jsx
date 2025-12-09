import { useState, useEffect, useRef } from 'react';
import GameCard from './GameCard';
import GameDetailModal from './GameDetailModal';

// Platform icons mapping
const PLATFORM_ICONS = {
    'PC': '💻',
    'PlayStation 5': '🎮',
    'PlayStation 4': '🎮',
    'Xbox Series X/S': '🎮',
    'Xbox One': '🎮',
    'Nintendo Switch': '🕹️',
    'Retro/Other': '👾'
};

function GameList({ groupedGames, gameCount, onRemove }) {
    const [selectedGame, setSelectedGame] = useState(null);
    const [sortBy, setSortBy] = useState('date-added');
    const [showSortMenu, setShowSortMenu] = useState(false);
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

    const platforms = Object.keys(groupedGames);

    if (platforms.length === 0) {
        return (
            <div className="empty-collection">
                <div className="empty-collection-icon">📚</div>
                <h3>Tu colección está vacía</h3>
                <p>Busca y añade juegos usando el buscador de arriba</p>
            </div>
        );
    }

    // Sort games within each platform
    const sortGames = (games) => {
        return [...games].sort((a, b) => {
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
                    return 0; // date-added (original order)
            }
        });
    };

    const sortOptions = [
        { value: 'date-added', label: '📅 Fecha añadido', icon: '📅' },
        { value: 'newest', label: '🆕 Más nuevos', icon: '🆕' },
        { value: 'oldest', label: '⏰ Más antiguos', icon: '⏰' },
        { value: 'rating-high', label: '⭐ Mayor valoración', icon: '⭐' },
        { value: 'rating-low', label: '📉 Menor valoración', icon: '📉' },
        { value: 'name', label: '🔤 A-Z', icon: '🔤' }
    ];

    const currentSort = sortOptions.find(opt => opt.value === sortBy);

    return (
        <>
            <div className="collection-section">
                <div className="collection-header-controls">
                    <div className="collection-title-area">
                        <h2 className="collection-title-main">Mi Colección</h2>
                        {gameCount > 0 && (
                            <p className="collection-count">
                                {gameCount} juego{gameCount !== 1 ? 's' : ''} en total
                            </p>
                        )}
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

                {platforms.map(platform => {
                    const games = groupedGames[platform];
                    const sortedGames = sortGames(games);
                    const icon = PLATFORM_ICONS[platform] || '🎮';

                    return (
                        <div key={platform} className="platform-group">
                            <div className="platform-header">
                                <span className="platform-icon">{icon}</span>
                                <h2 className="platform-title">{platform}</h2>
                                <span className="platform-game-count">
                                    {games.length}
                                </span>
                            </div>

                            <div className="collection-grid">
                                {sortedGames.map(game => (
                                    <GameCard
                                        key={`${game.id}-${platform}`}
                                        game={game}
                                        onRemove={onRemove}
                                        showRemove={true}
                                        onCardClick={setSelectedGame}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedGame && (
                <GameDetailModal
                    game={selectedGame}
                    onClose={() => setSelectedGame(null)}
                />
            )}
        </>
    );
}

export default GameList;
