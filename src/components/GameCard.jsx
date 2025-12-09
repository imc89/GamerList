function GameCard({ game, onAdd, onRemove, showRemove = false }) {
    return (
        <div className={showRemove ? 'collection-game-card' : 'game-card'}>
            {showRemove && (
                <button
                    className="btn-remove"
                    onClick={() => onRemove(game.id, game.platform)}
                    title="Eliminar de la colección"
                >
                    ✕
                </button>
            )}

            <div className="game-card-image">
                {game.coverUrl ? (
                    <img src={game.coverUrl} alt={game.name} />
                ) : (
                    <span>🎮</span>
                )}
            </div>

            <div className="game-card-content">
                <h3 className="game-card-title">{game.name}</h3>

                {game.releaseDate && (
                    <div className="game-card-meta">
                        {game.releaseDate}
                    </div>
                )}

                {!showRemove && game.platforms && game.platforms.length > 0 && (
                    <div className="game-card-platforms">
                        {game.platforms.slice(0, 4).map((platform, idx) => (
                            <span key={idx} className="platform-badge">
                                {platform}
                            </span>
                        ))}
                        {game.platforms.length > 4 && (
                            <span className="platform-badge">+{game.platforms.length - 4}</span>
                        )}
                    </div>
                )}

                {!showRemove && (
                    <div className="game-card-actions">
                        <button
                            className="btn-add"
                            onClick={() => onAdd(game)}
                        >
                            ➕ Añadir a colección
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GameCard;
