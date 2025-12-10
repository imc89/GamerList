import { useState } from 'react';
import GameCard from './GameCard';
import GameDetailModal from './GameDetailModal';

function SearchResults({ results, loading, onGameAdd, onGameRemove, addedGameIds }) {
    const [selectedGame, setSelectedGame] = useState(null);

    if (loading) {
        return (
            <div className="search-results">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="search-results">
                <div className="empty-state">
                    <div className="empty-state-icon">🎯</div>
                    <p>No se encontraron resultados</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="search-results">
                <div className="results-header">
                    {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                </div>
                <div className="results-grid">
                    {results.map(game => (
                        <GameCard
                            key={game.id}
                            game={game}
                            onAdd={onGameAdd}
                            onCardClick={setSelectedGame}
                            isAdded={addedGameIds?.has(game.id)}
                            onRemove={() => onGameRemove(game.id)}
                        />
                    ))}
                </div>
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

export default SearchResults;
