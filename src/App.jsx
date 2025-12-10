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
import { searchGames as apiSearchGames } from './services/igdbService';

function App() {
  const [collection, setCollection] = useState({});
  const [gameCount, setGameCount] = useState(0);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showPlatformSelector, setShowPlatformSelector] = useState(false);
  const [searchClearCallback, setSearchClearCallback] = useState(null);

  // Search State Lifted
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load collection on mount
  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = () => {
    const grouped = getGamesByPlatform();
    setCollection(grouped);
    setGameCount(getGameCount());
  };

  // Debounce search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const games = await apiSearchGames(query);
        setResults(games);
        setSearched(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchChange = (val) => setQuery(val);
  const handleSearchClear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
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

  // Remove game from all platforms (Toggle removal)
  const handleRemoveAnyPlatform = (gameId) => {
    // Find all platforms containing this game
    const platformsToRemove = [];
    Object.keys(collection).forEach(platform => {
      if (collection[platform].some(g => g.id === gameId)) {
        platformsToRemove.push(platform);
      }
    });

    if (platformsToRemove.length === 0) return;

    // Remove from each
    let success = true;
    platformsToRemove.forEach(p => {
      removeGame(gameId, p);
    });

    loadCollection();
  };

  const handlePlatformCancel = () => {
    setShowPlatformSelector(false);
    setSelectedGame(null);
    setSearchClearCallback(null); // Clear callback without calling it
  };

  // Compute all added game IDs for checking status
  const addedGameIds = new Set(
    Object.values(collection).flat().map(g => g.id)
  );

  return (
    <div className="app">
      <SearchBar
        query={query}
        onSearchChange={handleSearchChange}
        onClear={handleSearchClear}
        loading={loading}
      />

      <div className="container">
        <GameList
          groupedGames={collection}
          gameCount={gameCount}
          onRemove={handleGameRemove}

          // Search Props passed to GameList
          searchResults={results}
          searchLoading={loading}
          searchSearched={searched}
          onGameAdd={handleGameAdd}
          onGameRemoveFromSearch={handleRemoveAnyPlatform}
          addedGameIds={addedGameIds}
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
