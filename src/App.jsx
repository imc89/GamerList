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
    const result = removeGame(gameId, platform);

    if (result.success) {
      loadCollection();
    } else {
      alert(result.message);
    }
  };

  const handlePlatformCancel = () => {
    setShowPlatformSelector(false);
    setSelectedGame(null);
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

