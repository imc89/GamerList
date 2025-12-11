import { useState } from 'react';
import { PLATFORMS } from '../services/storageService';

function PlatformSelector({ game, onConfirm, onCancel, initialSelection = [] }) {
    // Initial selection can be passed if we are editing
    const [selectedPlatforms, setSelectedPlatforms] = useState(new Set(initialSelection));

    // Show game's original platforms if they exist (and we're not editing/overriding), 
    // but here we likely want to show ALL platforms to allow adding to new ones.
    // However, the original code had a check `availablePlatforms`. 
    // If we are "adding" a game found via search, it might come with `game.platforms` from the API.
    // If we are "editing", we want to be able to select ANY platform.
    // Let's assume we always want to show ALL PLATFORMS to allow the user to categorize freely, 
    // unless there is a specific reason to limit it (like maybe exclusive games?).
    // The previous logic was: if game has platforms, show them, else show all. 
    // But for a "save to collection" feature, we usually want to map to OUR platforms.
    // Let's stick to showing ALL system platforms to give maximum flexibility.
    // Logic for available platforms:
    // 1. Start with game's native platforms (or ALL if unknown).
    // 2. Add any platforms currently selected (initialSelection) to ensure they can be unchecked 
    //    if they are not in the native list.
    const nativePlatforms = game.platforms && game.platforms.length > 0 ? game.platforms : PLATFORMS;

    const platformsToShow = new Set(nativePlatforms);
    if (initialSelection) {
        initialSelection.forEach(p => platformsToShow.add(p));
    }

    // Convert to array and sort for display
    const availablePlatforms = Array.from(platformsToShow).sort();

    const togglePlatform = (platform) => {
        setSelectedPlatforms(prev => {
            const newSet = new Set(prev);
            if (newSet.has(platform)) {
                newSet.delete(platform);
            } else {
                newSet.add(platform);
            }
            return newSet;
        });
    };

    const handleConfirm = () => {
        if (selectedPlatforms.size > 0) {
            onConfirm(game, Array.from(selectedPlatforms));
        }
    };

    return (
        <div className="modal-overlay" style={{ zIndex: 2100 }} onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Selecciona plataformas</h2>
                    <p className="modal-subtitle">{game.name}</p>
                    <p className="modal-hint">
                        Selecciona todas las categorías donde quieres guardar este juego
                    </p>
                </div>

                <div className="platform-grid">
                    {availablePlatforms.map(platform => (
                        <div
                            key={platform}
                            className={`platform-option ${selectedPlatforms.has(platform) ? 'selected' : ''}`}
                            onClick={() => togglePlatform(platform)}
                        >
                            {platform}
                        </div>
                    ))}
                </div>

                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onCancel}>
                        Cancelar
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleConfirm}
                        disabled={selectedPlatforms.size === 0}
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PlatformSelector;
