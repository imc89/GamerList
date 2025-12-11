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

  // Prevent context menu (right click)
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleDragStart = (e) => e.preventDefault();

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

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

  const [initialPlatforms, setInitialPlatforms] = useState([]);

  // ... (existing code)

  const handleGameAdd = (game, onSuccess) => {
    setSelectedGame(game);
    setSearchClearCallback(() => onSuccess);

    // Determine which platforms this game is already added to
    const currentPlatforms = [];
    Object.keys(collection).forEach(platform => {
      if (collection[platform].some(g => g.id === game.id)) {
        currentPlatforms.push(platform);
      }
    });
    setInitialPlatforms(currentPlatforms);

    setShowPlatformSelector(true);
  };

  const handlePlatformConfirm = (game, selectedPlatforms) => {
    // Diffing logic
    // 1. New platforms to add
    const platformsToAdd = selectedPlatforms.filter(p => !initialPlatforms.includes(p));
    // 2. Platforms to remove
    const platformsToRemove = initialPlatforms.filter(p => !selectedPlatforms.includes(p));

    let successCount = 0;

    // Add to new platforms
    platformsToAdd.forEach(platform => {
      const result = saveGame(game, platform);
      if (result.success) successCount++;
    });

    // Remove from deselected platforms
    platformsToRemove.forEach(platform => {
      removeGame(game.id, platform);
    });

    // Determine functionality outcome
    if (successCount > 0 || platformsToRemove.length > 0) {
      loadCollection();
      setShowPlatformSelector(false);
      setSelectedGame(null);
      setInitialPlatforms([]); // Reset

      // If we came from search and added successfully, we might want to allow callback
      if (searchClearCallback) {
        // If we added at least one, we can consider it "success" for search clearing purposes
        // But maybe we don't want to clear search if they just edited?
        // The requirement was: "guardando el juego en varias categorias".
        // If it was a new add, we clear search usually.
        if (initialPlatforms.length === 0) {
          handleSearchClear();
        }
      }
    } else {
      // No changes made or error
      setShowPlatformSelector(false);
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
    const platformsToRemove = [];
    Object.keys(collection).forEach(platform => {
      if (collection[platform].some(g => g.id === gameId)) {
        platformsToRemove.push(platform);
      }
    });

    if (platformsToRemove.length === 0) return;

    platformsToRemove.forEach(p => {
      removeGame(gameId, p);
    });

    loadCollection();
  };

  const handlePlatformCancel = () => {
    setShowPlatformSelector(false);
    setSelectedGame(null);
    setInitialPlatforms([]);
    setSearchClearCallback(null);
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
          initialSelection={initialPlatforms}
          onConfirm={handlePlatformConfirm}
          onCancel={handlePlatformCancel}
        />
      )}
    </div>
  );
}

export default App;
