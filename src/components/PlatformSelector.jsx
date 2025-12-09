import { useState } from 'react';
import { PLATFORMS } from '../services/storageService';

function PlatformSelector({ game, onConfirm, onCancel }) {
    const [selectedPlatform, setSelectedPlatform] = useState('');

    // Platform mapping for better matching
    const platformMap = {
        'PC': ['pc', 'win', 'windows', 'linux', 'mac'],
        'PlayStation': ['ps', 'playstation', 'ps5', 'ps4', 'ps3', 'psx'],
        'Xbox': ['xbox', 'xb', 'xone', 'xsxs', 'x360', 'series'],
        'Nintendo Switch': ['switch', 'ns'],
        'Nintendo': ['nintendo', 'wii', 'nes', 'snes', '3ds', 'nds'],
        'Mobile': ['ios', 'android', 'mobile']
    };

    // Get available platforms for this game
    const availablePlatforms = game.platforms && game.platforms.length > 0
        ? PLATFORMS.filter(platform => {
            const platformTerms = platformMap[platform] || [platform.toLowerCase()];
            return game.platforms.some(gamePlatform => {
                const gamePlatformLower = gamePlatform.toLowerCase();
                return platformTerms.some(term =>
                    gamePlatformLower.includes(term) || term.includes(gamePlatformLower)
                );
            });
        })
        : PLATFORMS; // If no platforms data, show all

    const handleConfirm = () => {
        if (selectedPlatform) {
            onConfirm(game, selectedPlatform);
        }
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Selecciona la plataforma</h2>
                    <p className="modal-subtitle">{game.name}</p>
                    {availablePlatforms.length < PLATFORMS.length && (
                        <p className="modal-hint">
                            Mostrando solo plataformas disponibles para este juego
                        </p>
                    )}
                </div>

                <div className="platform-grid">
                    {availablePlatforms.map(platform => (
                        <div
                            key={platform}
                            className={`platform-option ${selectedPlatform === platform ? 'selected' : ''}`}
                            onClick={() => setSelectedPlatform(platform)}
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
                        disabled={!selectedPlatform}
                    >
                        Añadir
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PlatformSelector;
