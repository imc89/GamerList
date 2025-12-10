import { useState, useEffect, useRef } from 'react';
import GameCard from './GameCard';
import GameDetailModal from './GameDetailModal';
import SearchResults from './SearchResults';
import { exportData, importJsonData } from '../services/storageService';

import {
    SiPlaystation5,
    SiPlaystation4,
    SiWii,
    SiWiiu,
    SiNintendoswitch,
    SiApple,
    SiIos,
    SiRetroarch
} from "react-icons/si";

import { GiCardExchange, GiHamburgerMenu } from "react-icons/gi";
import { FaWindows, FaXbox, FaFileImport, FaFileExport, FaSortAlphaDown } from "react-icons/fa";
import { AiOutlineRise, AiOutlineFall } from "react-icons/ai";

import { MdClose, MdOutlineFiberNew, MdOutlineWatchLater } from "react-icons/md";

// Platform icons mapping
const PLATFORM_ICONS = {
    'PC': <FaWindows style={{ fontSize: '3rem', marginBottom: '1rem' }} />,
    "Mac": <SiApple style={{ fontSize: '3rem', marginBottom: '1rem' }} />,
    "iOS": <SiIos style={{ fontSize: '3rem', marginBottom: '1rem' }} />,
    "XONE": <FaXbox style={{ fontSize: '3rem', marginBottom: '1rem' }} />,
    'PS5': <SiPlaystation5 />,
    'PS4': <SiPlaystation4 />,
    'Linux': <FaWindows style={{ fontSize: '3rem', marginBottom: '1rem' }} />,
    'Series X|S': <FaXbox style={{ fontSize: '3rem', marginBottom: '1rem' }} />,
    'Xbox One': <FaXbox style={{ fontSize: '3rem', marginBottom: '1rem' }} />,
    'Wii': <SiWii style={{ fontSize: '3rem', marginBottom: '1rem' }} />,
    'WiiU': <SiWiiu style={{ fontSize: '3rem', marginBottom: '1rem' }} />,
    "Switch": <SiNintendoswitch style={{ fontSize: '3rem', marginBottom: '1rem' }} />,
    'Switch 2': <SiNintendoswitch style={{ fontSize: '3rem', marginBottom: '1rem' }} />,
    'DOS': <SiRetroarch style={{ fontSize: '3rem', marginBottom: '1rem' }} />,
};

function GameList({
    groupedGames,
    gameCount,
    onRemove,
    // Search props
    searchResults,
    searchLoading,
    searchSearched,
    onGameAdd,
    onGameRemoveFromSearch,
    addedGameIds
}) {
    const [selectedGame, setSelectedGame] = useState(null);
    const [sortBy, setSortBy] = useState('date-added');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showDataModal, setShowDataModal] = useState(false);
    const sortMenuRef = useRef(null);
    const fileInputRef = useRef(null);

    const [collapsedPlatforms, setCollapsedPlatforms] = useState(new Set());

    const togglePlatform = (platform) => {
        setCollapsedPlatforms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(platform)) {
                newSet.delete(platform);
            } else {
                newSet.add(platform);
            }
            return newSet;
        });
    };

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
        { value: 'date-added', label: 'fecha añadido', icon: <GiHamburgerMenu /> },
        { value: 'newest', label: 'Más nuevos', icon: <MdOutlineFiberNew style={{ fontSize: '1.5em' }} /> },
        { value: 'oldest', label: 'Más antiguos', icon: <MdOutlineWatchLater /> },
        { value: 'rating-high', label: 'Mayor valoración', icon: <AiOutlineRise /> },
        { value: 'rating-low', label: 'Menor valoración', icon: <AiOutlineFall /> },
        { value: 'name', label: 'A-Z', icon: <FaSortAlphaDown /> }
    ];

    const currentSort = sortOptions.find(opt => opt.value === sortBy);

    const handleModalRemove = () => {
        if (selectedGame) {
            if (selectedGame.platform) {
                onRemove(selectedGame.id, selectedGame.platform);
            } else {
                onGameRemoveFromSearch(selectedGame.id);
            }
            setSelectedGame(null);
        }
    };

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
                            <span className="action-icon"><GiCardExchange /></span>
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

                {/* Search Results inserted here */}
                {(searchSearched || searchLoading) && (
                    <div className="search-results-container" style={{ marginBottom: '2rem' }}>
                        <SearchResults
                            results={searchResults}
                            loading={searchLoading}
                            onGameAdd={onGameAdd}
                            onGameRemove={onGameRemoveFromSearch}
                            addedGameIds={addedGameIds}
                        />
                    </div>
                )}

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
                        const isCollapsed = collapsedPlatforms.has(platform);

                        return (
                            <div key={platform} className="platform-group">
                                <div className="platform-header">
                                    <span className="platform-icon">{icon}</span>
                                    {/* <h2 className="platform-title">{platform}</h2> */}
                                    <span
                                        className="platform-game-count"
                                        onClick={() => togglePlatform(platform)}
                                        title={isCollapsed ? "Mostrar juegos" : "Ocultar juegos"}
                                        style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        {games.length}
                                        <span style={{ fontSize: '0.9em', opacity: 0.8 }}>
                                            {isCollapsed ? '▼' : '▲'}
                                        </span>
                                    </span>
                                </div>

                                {!isCollapsed && (
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
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {selectedGame && (
                <GameDetailModal
                    game={selectedGame}
                    onClose={() => setSelectedGame(null)}
                    isAdded={addedGameIds.has(selectedGame.id)}
                    onRemove={handleModalRemove}
                    onAdd={onGameAdd}
                // If opening from collection, selectedGame has platform. 
                // But checking ID in addedGameIds is safe to see if it exists at all.
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
                            <button
                                className="data-action-btn export-action"
                                onClick={handleExport}
                                disabled={gameCount === 0}
                            >
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
