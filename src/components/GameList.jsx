import { useState, useEffect, useRef } from 'react';
import GameCard from './GameCard';
import GameDetailModal from './GameDetailModal';
import { exportData, importJsonData } from '../services/storageService';

import {
    SiPlaystation5,
    SiPlaystation4,
    SiNintendo,
    SiNintendoswitch,
    SiApple,
    SiRetroarch
} from "react-icons/si";
import { FaWindows, FaXbox, FaFileImport, FaFileExport } from "react-icons/fa";
import { MdClose } from "react-icons/md";

// Platform icons mapping
const PLATFORM_ICONS = {
    'PC': <FaWindows />,
    "Mac": <SiApple />,
    "XONE": <FaXbox />,
    'PS5': <SiPlaystation5 />,
    'PS4': <SiPlaystation4 />,
    'Linux': <FaWindows />,
    'Series X|S': <FaXbox />,
    'Xbox One': <FaXbox />,
    "Switch": <SiNintendoswitch />,
    'Switch 2': <SiNintendoswitch />,
    'DOS': <SiRetroarch />
};

function GameList({ groupedGames, gameCount, onRemove }) {
    const [selectedGame, setSelectedGame] = useState(null);
    const [sortBy, setSortBy] = useState('date-added');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showDataModal, setShowDataModal] = useState(false);
    const sortMenuRef = useRef(null);
    const fileInputRef = useRef(null);

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

    const handleExport = () => {
        const result = exportData();
        if (result.success) {
            // Optional: User feedback could be better than alert, but alert works for now
            // alert(result.message);
        } else {
            alert(result.message);
        }
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const result = importJsonData(content);
            if (result.success) {
                alert('Colección importada con éxito. La página se recargará.');
                window.location.reload();
            } else {
                alert(result.message);
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
    };

    const platforms = Object.keys(groupedGames);

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
        { value: 'date-added', label: 'echa añadido', icon: '📅' },
        { value: 'newest', label: 'Más nuevos', icon: '🆕' },
        { value: 'oldest', label: 'Más antiguos', icon: '⏰' },
        { value: 'rating-high', label: 'Mayor valoración', icon: '⭐' },
        { value: 'rating-low', label: 'Menor valoración', icon: '📉' },
        { value: 'name', label: 'A-Z', icon: '🔤' }
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
                        {gameCount === 0 && (
                            <p className="collection-count">
                                Sin juegos guardados
                            </p>
                        )}
                    </div>

                    <div className="collection-actions">
                        <div className="sort-dropdown" ref={sortMenuRef}>
                            <button
                                className="sort-button"
                                onClick={() => setShowSortMenu(!showSortMenu)}
                                disabled={platforms.length === 0}
                                style={{ opacity: platforms.length === 0 ? 0.5 : 1 }}
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

                        <button className="action-button" onClick={() => setShowDataModal(true)} title="Opciones de datos">
                            <span className="action-icon">💾</span>
                            <span className="action-label">Datos</span>
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".json"
                            onChange={handleImport}
                        />
                    </div>
                </div>

                {platforms.length === 0 ? (
                    <div className="empty-collection">
                        <div className="empty-collection-icon">📚</div>
                        <h3>Tu colección está vacía</h3>
                        <p>Busca y añade juegos usando el buscador de arriba</p>
                        <p style={{ marginTop: '1rem', fontSize: '0.9em', opacity: 0.8 }}>
                            O importa una copia de seguridad usando el botón "Datos"
                        </p>
                    </div>
                ) : (
                    platforms.map(platform => {
                        const games = groupedGames[platform];
                        const sortedGames = sortGames(games);
                        const icon = PLATFORM_ICONS[platform] || '🎮';

                        return (
                            <div key={platform} className="platform-group">
                                <div className="platform-header">
                                    <span className="platform-icon">{icon}</span>
                                    {/* <h2 className="platform-title">{platform}</h2> */}
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
                    })
                )}
            </div>

            {selectedGame && (
                <GameDetailModal
                    game={selectedGame}
                    onClose={() => setSelectedGame(null)}
                />
            )}

            {showDataModal && (
                <div className="modal-overlay" onClick={() => setShowDataModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowDataModal(false)}>
                            <MdClose />
                        </button>

                        <div className="modal-header">
                            <h2 className="modal-title">Gestión de Datos</h2>
                            <p className="modal-subtitle">Haz una copia de seguridad o restaura tu colección</p>
                        </div>

                        <div className="data-actions-grid">
                            <button className="data-action-btn export-action" onClick={handleExport}>
                                <FaFileExport className="data-icon" />
                                <div className="data-btn-content">
                                    <h3>Exportar</h3>
                                    <p>Descarga un archivo JSON con toda tu colección.</p>
                                </div>
                            </button>

                            <button className="data-action-btn import-action" onClick={() => fileInputRef.current?.click()}>
                                <FaFileImport className="data-icon" />
                                <div className="data-btn-content">
                                    <h3>Importar</h3>
                                    <p>Sube un archivo de respaldo para restaurar tu colección.</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default GameList;
