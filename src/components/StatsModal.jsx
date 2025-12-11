import { MdClose, MdQueryStats } from "react-icons/md";
import { FaGamepad, FaTrophy } from "react-icons/fa";

function StatsModal({ groupedGames, onClose }) {
    if (!groupedGames) return null;

    // Calculate Stats
    const totalGames = Object.values(groupedGames).reduce((acc, games) => acc + (games?.length || 0), 0);

    // Sort platforms by count for chart/list
    const platformStats = Object.keys(groupedGames)
        .map(platform => ({
            name: platform,
            count: groupedGames[platform]?.length || 0
        }))
        .sort((a, b) => b.count - a.count);

    const topPlatform = platformStats.length > 0 ? platformStats[0] : null;

    // Calculate Top 3 "Recent Gems"
    // 1. Flatten all games safely
    const allGames = Object.values(groupedGames).flat().filter(g => g);

    // 2. Sort by addedDate (newest first) to find "recents"
    // We look at the last 20 added games to find the gems among them
    const recentGames = [...allGames]
        .sort((a, b) => {
            const dateA = new Date(a.addedDate || 0);
            const dateB = new Date(b.addedDate || 0);
            return dateB - dateA;
        })
        .slice(0, 20);

    // 3. Sort these by rating (desc)
    const topRecentGames = recentGames
        .filter(g => g.rating && typeof g.rating === 'number') // Must have valid rating
        .sort((a, b) => b.rating - a.rating);

    // 4. Deduplicate (by ID) and take top 3
    const uniqueTopGames = [];
    const seenIds = new Set();

    for (const game of topRecentGames) {
        if (game && game.id && !seenIds.has(game.id)) {
            uniqueTopGames.push(game);
            seenIds.add(game.id);
            if (uniqueTopGames.length === 3) break;
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal stats-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <MdClose />
                </button>

                <div className="modal-header">
                    <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MdQueryStats /> Estadísticas de la Colección
                    </h2>
                    <p className="modal-subtitle">Resumen de tu biblioteca de videojuegos</p>
                </div>

                <div className="stats-dashboard">
                    {/* Summary Cards */}
                    <div className="stats-summary-grid">
                        <div className="stat-card total-games">
                            <div className="stat-icon"><FaGamepad /></div>
                            <div className="stat-value">{totalGames}</div>
                            <div className="stat-label">Juegos Totales</div>
                        </div>

                        {topPlatform && (
                            <div className="stat-card top-platform">
                                <div className="stat-icon"><FaTrophy /></div>
                                <div className="stat-value">{topPlatform.name}</div>
                                <div className="stat-label">Plataforma Principal</div>
                                <div className="stat-sub">{topPlatform.count} juegos</div>
                            </div>
                        )}
                    </div>

                    {/* Platform Distribution Chart/List */}
                    <div className="stats-section">
                        <h3>Distribución por Plataforma</h3>
                        <div className="platform-bars">
                            {platformStats.map((stat, idx) => {
                                const percentage = Math.round((stat.count / totalGames) * 100);
                                return (
                                    <div key={stat.name} className="platform-stat-row">
                                        <div className="stat-row-label">
                                            <span className="platform-name">{stat.name}</span>
                                        </div>
                                        <div className="stat-row-bar-container">
                                            <div
                                                className="stat-row-bar"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="stat-row-value">
                                            {stat.count} <span className="stat-percentage">({percentage}%)</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Top Recent Gems Section */}
                    {uniqueTopGames.length > 0 && (
                        <div className="stats-section">
                            <h3>Joyas Recientes (Top 3)</h3>
                            <div className="top-games-grid">
                                {uniqueTopGames.map((game, idx) => (
                                    <div key={game.id} className="top-game-card">
                                        <div className="rank-badge">#{idx + 1}</div>
                                        <div className="top-game-cover">
                                            {game.coverUrl ? (
                                                <img src={game.coverUrl} alt={game.name} />
                                            ) : (
                                                <div className="placeholder">🎮</div>
                                            )}
                                        </div>
                                        <div className="top-game-info">
                                            <div className="top-game-name">{game.name}</div>
                                            <div className="top-game-meta">
                                                <span className="rating-badge">★ {Math.round(game.rating)}</span>
                                                <span className="platform-tag">{game.platform}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

export default StatsModal;
