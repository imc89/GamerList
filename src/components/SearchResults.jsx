import GameCard from './GameCard';

function SearchResults({ results, loading, onGameAdd }) {
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
                    />
                ))}
            </div>
        </div>
    );
}

export default SearchResults;
