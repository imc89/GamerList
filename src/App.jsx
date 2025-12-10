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
  const [searchClearCallback, setSearchClearCallback] = useState(null);

  // Load collection on mount
  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = () => {
    const grouped = getGamesByPlatform();
    setCollection(grouped);
    setGameCount(getGameCount());
  };

  const handleGameAdd = (game, onSuccess) => {
    setSelectedGame(game);
    setSearchClearCallback(() => onSuccess);
    setShowPlatformSelector(true);
  };

  const handlePlatformConfirm = (game, platform) => {
    const result = saveGame(game, platform);

    if (result.success) {
      loadCollection();
      setShowPlatformSelector(false);
      setSelectedGame(null);

      // Clear search results only on success
      if (searchClearCallback) {
        searchClearCallback();
        setSearchClearCallback(null);
      }
    } else {
      alert(result.message);
      // Do not clear search (keep callback for potential retry or just user cancels)
      // Actually if it fails, we usually stay in modal or close it? 
      // PlatformSelector stays open? 
      // If alert happens, usually imply we stay? 
      // But currently PlatformSelector handles confirm.
      // If I want to close selector on error?
      // "Este juego ya está en tu colección". User says "Ok". 
      // Selector should probably close or let user choose another platform?
      // Logic from before: alert and... stay?
      // The previous code had: if(success) ... else alert.
      // So on error, it does nothing else. Modal stays open or closes?
      // PlatformSelector calls onConfirm. It doesn't close itself.
      // So UI stays open.
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
    setSearchClearCallback(null); // Clear callback without calling it
  };

  return (
    <div className="app">
      <SearchBar onGameAdd={handleGameAdd} />

      <div className="container">
        <GameList
          groupedGames={collection}
          gameCount={gameCount}
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

