import { useState } from 'react';
import { PLATFORMS } from '../services/storageService';

function PlatformSelector({ game, onConfirm, onCancel }) {
    const [selectedPlatform, setSelectedPlatform] = useState('');

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
                </div>

                <div className="platform-grid">
                    {PLATFORMS.map(platform => (
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
