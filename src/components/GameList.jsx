import { useState } from 'react';
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

function GameList({ groupedGames, onRemove }) {
    const [selectedGame, setSelectedGame] = useState(null);
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

    return (
        <>
            <div className="collection-section">
                {platforms.map(platform => {
                    const games = groupedGames[platform];
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
                                {games.map(game => (
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
