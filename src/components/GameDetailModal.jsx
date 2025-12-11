import { useState, useEffect } from 'react';
import { FaPhotoVideo, FaArrowLeft, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaRankingStar } from "react-icons/fa6";
import { HiCalendarDateRange } from "react-icons/hi2";
import { IoLogoGameControllerB } from "react-icons/io";
import { GiConsoleController } from "react-icons/gi";

function GameDetailModal({ game, onClose, isAdded, onRemove, onAdd }) {
    const [view, setView] = useState('details'); // 'details' or 'media'
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);

    // Close on ESC key or Navigate Lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedImageIndex !== null) {
                if (e.key === 'ArrowLeft') {
                    setSelectedImageIndex((prev) => (prev - 1 + game.screenshots.length) % game.screenshots.length);
                } else if (e.key === 'ArrowRight') {
                    setSelectedImageIndex((prev) => (prev + 1) % game.screenshots.length);
                } else if (e.key === 'Escape') {
                    setSelectedImageIndex(null);
                    e.stopPropagation(); // Try to prevent modal close
                }
            } else {
                if (e.key === 'Escape') onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, selectedImageIndex, game]);

    if (!game) return null;

    const hasMedia = (game.videos && game.videos.length > 0) || (game.screenshots && game.screenshots.length > 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="game-detail-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>

                {view === 'media' ? (
                    <div className="game-media-content">
                        <button className="back-button" onClick={() => setView('details')}>
                            <FaArrowLeft /> Volver a detalles
                        </button>

                        <h2 className="game-detail-title">Galería Multimedia</h2>

                        <div className="media-scroll-container">
                            {game.videos && game.videos.length > 0 && (
                                <div className="media-section">
                                    <h3>Trailers</h3>
                                    <div className="video-grid">
                                        {game.videos.map(videoId => (
                                            <div key={videoId} className="video-container">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${videoId}`}
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {game.screenshots && game.screenshots.length > 0 && (
                                <div className="media-section">
                                    <h3>Imágenes</h3>
                                    <div className="screenshot-grid">
                                        {game.screenshots.map((url, idx) => (
                                            <img
                                                key={idx}
                                                src={url}
                                                alt={`Screenshot ${idx + 1}`}
                                                className="game-screenshot"
                                                loading="lazy"
                                                onClick={() => setSelectedImageIndex(idx)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!hasMedia && (
                                <p className="no-media-message">No hay contenido multimedia disponible para este juego.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="game-detail-content">
                        <div className="game-detail-image-section">
                            <div className="game-detail-image">
                                {game.coverUrl ? (
                                    <img src={game.coverUrl} alt={game.name} />
                                ) : (
                                    <div className="game-detail-placeholder">🎮</div>
                                )}
                            </div>

                            <div className="modal-actions-col">
                                {isAdded ? (
                                    <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                                        <button className="btn-remove-list" onClick={onRemove} style={{ flex: 1 }}>
                                            ELIMINAR DEL LISTADO
                                        </button>
                                        <button
                                            className="btn-edit-platforms"
                                            onClick={() => onAdd(game)}
                                            style={{
                                                padding: '0 16px',
                                                background: 'rgba(157, 78, 221, 0.15)',
                                                border: '1px solid rgba(157, 78, 221, 0.4)',
                                                borderRadius: '12px',
                                                fontSize: '1.5rem',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s ease',
                                                boxShadow: '0 2px 8px rgba(157, 78, 221, 0.2)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = 'rgba(157, 78, 221, 0.3)';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'rgba(157, 78, 221, 0.15)';
                                                e.target.style.transform = 'translateY(0)';
                                            }}
                                            title="Editar plataformas/categorías"
                                        >
                                            <GiConsoleController />
                                        </button>
                                    </div>
                                ) : (
                                    <button className="btn-add" onClick={() => onAdd(game)}>
                                        ➕ Añadir a colección
                                    </button>
                                )}

                                {hasMedia && (
                                    <button className="media-button" onClick={() => setView('media')}>
                                        <FaPhotoVideo />
                                        TRAILER E IMAGENES
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="game-detail-info">
                            <h2 className="game-detail-title">{game.name}</h2>

                            {game.releaseDate && (
                                <div className="game-detail-meta">
                                    <span className="meta-label"><HiCalendarDateRange /> Fecha de lanzamiento:</span>
                                    <span className="meta-value">{game.releaseDate}</span>
                                </div>
                            )}

                            {game.rating && (
                                <div className="game-detail-meta">
                                    <span className="meta-label"><FaRankingStar /> Valoración:</span>
                                    <span className="meta-value">{Math.round(game.rating)}/100</span>
                                </div>
                            )}

                            {game.platforms && game.platforms.length > 0 && (
                                <div className="game-detail-meta">
                                    <span className="meta-label"><IoLogoGameControllerB /> Plataformas:</span>
                                    <div className="game-detail-platforms">
                                        {game.platforms.map((platform, idx) => (
                                            <span key={idx} className="platform-badge-large">
                                                {platform}
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
                )}
            </div>

            {/* Lightbox Overlay */}
            {selectedImageIndex !== null && (
                <div className="lightbox-overlay" onClick={() => setSelectedImageIndex(null)}>
                    <button className="lightbox-close" onClick={() => setSelectedImageIndex(null)}>✕</button>

                    <button
                        className="lightbox-nav-btn prev"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev - 1 + game.screenshots.length) % game.screenshots.length);
                        }}
                    >
                        <FaChevronLeft />
                    </button>

                    <img
                        src={game.screenshots[selectedImageIndex]}
                        alt={`Screenshot ${selectedImageIndex + 1}`}
                        className="lightbox-image"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button
                        className="lightbox-nav-btn next"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev + 1) % game.screenshots.length);
                        }}
                    >
                        <FaChevronRight />
                    </button>

                    <div className="lightbox-counter">
                        {selectedImageIndex + 1} / {game.screenshots.length}
                    </div>
                </div>
            )}
        </div>
    );
}

export default GameDetailModal;
