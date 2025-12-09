import { useState, useEffect } from 'react';
import './App.css';
import './components.css';
import SearchBar from './components/SearchBar';
import GameList from './components/GameList';
import PlatformSelector from './components/PlatformSelector';
import {
  getGamesByPlatform,
  saveGame,
  removeGame,
  getGameCount
} from './services/storageService';
import { searchGames } from './services/igdbService';

function App() {
  const [collection, setCollection] = useState({});
  const [gameCount, setGameCount] = useState(0);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);

  // Load collection on mount
  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = () => {
    const grouped = getGamesByPlatform();
    setCollection(grouped);
    setGameCount(getGameCount());
  };

  const handleGameAdd = (game) => {
    setSelectedGame(game);
    setShowPlatformSelector(true);
  };

  const handlePlatformConfirm = (game, platform) => {
    const result = saveGame(game, platform);

    if (result.success) {
      loadCollection();
      setShowPlatformSelector(false);
      setSelectedGame(null);
    } else {
      alert(result.message);
    }
  };

  const handleGameRemove = (gameId, platform) => {
    if (confirm('¿Estás seguro de que quieres eliminar este juego de tu colección?')) {
      const result = removeGame(gameId, platform);

      if (result.success) {
        loadCollection();
      } else {
        alert(result.message);
      }
    }
  };

  const handlePlatformCancel = () => {
    setShowPlatformSelector(false);
    setSelectedGame(null);
  };

  // Test API button handler
  const handleTestAPI = async () => {
    console.log('🧪 Testing IGDB API with CYBERPUNK2077...');
    try {
      const results = await searchGames('CYBERPUNK2077');
      console.log('✅ API Response:', results);
      if (results && results.length > 0) {
        alert(`✅ API funciona! Se encontraron ${results.length} resultados para CYBERPUNK2077.\n\nVer consola para detalles.`);
      } else {
        alert('⚠️ API respondió pero no se encontraron resultados.');
      }
    } catch (error) {
      console.error('❌ Error calling API:', error);
      alert(`❌ Error en la API: ${error.message}`);
    }
  };

  return (
    <div className="app">
      <SearchBar onGameAdd={handleGameAdd} />

      <div className="container">
        <div className="collection-header">
          <h2 className="collection-title">Mi Colección</h2>
          {gameCount > 0 && (
            <p className="collection-count">
              {gameCount} juego{gameCount !== 1 ? 's' : ''} en total
            </p>
          )}
          <button
            onClick={handleTestAPI}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🧪 Test API (CYBERPUNK2077)
          </button>
        </div>

        <GameList
          groupedGames={collection}
          onRemove={handleGameRemove}
        />
      </div>

      {showPlatformSelector && selectedGame && (
        <PlatformSelector
          game={selectedGame}
          onConfirm={handlePlatformConfirm}
          onCancel={handlePlatformCancel}
        />
      )}
    </div>
  );
}

export default App;

