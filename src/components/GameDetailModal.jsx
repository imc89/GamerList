import { useEffect } from 'react';

function GameDetailModal({ game, onClose }) {
    // Close on ESC key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!game) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="game-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                <div className="game-detail-content">
                    <div className="game-detail-image">
                        {game.coverUrl ? (
                            <img src={game.coverUrl} alt={game.name} />
                        ) : (
                            <div className="game-detail-placeholder">🎮</div>
                        )}
                    </div>

                    <div className="game-detail-info">
                        <h2 className="game-detail-title">{game.name}</h2>

                        {game.releaseDate && (
                            <div className="game-detail-meta">
                                <span className="meta-label">📅 Fecha de lanzamiento:</span>
                                <span className="meta-value">{game.releaseDate}</span>
                            </div>
                        )}

                        {game.rating && (
                            <div className="game-detail-meta">
                                <span className="meta-label">⭐ Valoración:</span>
                                <span className="meta-value">{Math.round(game.rating)}/100</span>
                            </div>
                        )}

                        {game.platforms && game.platforms.length > 0 && (
                            <div className="game-detail-meta">
                                <span className="meta-label">🎮 Plataformas:</span>
                                <div className="game-detail-platforms">
                                    {game.platforms.map((platform, idx) => (
                                        <span key={idx} className="platform-badge-large">
                                            {platform}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {game.genres && game.genres.length > 0 && (
                            <div className="game-detail-meta">
                                <span className="meta-label">🎯 Géneros:</span>
                                <div className="game-detail-genres">
                                    {game.genres.map((genre, idx) => (
                                        <span key={idx} className="genre-badge">
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {game.summary && (
                            <div className="game-detail-summary">
                                <h3>Descripción</h3>
                                <p>{game.summary}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GameDetailModal;
