import { MdClose, MdQueryStats } from "react-icons/md";
import { FaGamepad, FaTrophy } from "react-icons/fa";

function StatsModal({ groupedGames, onClose }) {
    // Calculate Stats
    const totalGames = Object.values(groupedGames).reduce((acc, games) => acc + games.length, 0);
    const platformCount = Object.keys(groupedGames).length;

    // Sort platforms by count for chart/list
    const platformStats = Object.keys(groupedGames)
        .map(platform => ({
            name: platform,
            count: groupedGames[platform].length
        }))
        .sort((a, b) => b.count - a.count);

    const topPlatform = platformStats.length > 0 ? platformStats[0] : null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
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
                </div>
            </div>

            <style jsx>{`
                .stats-dashboard {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    padding-top: 1rem;
                }

                .stats-summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    transition: transform 0.2s ease;
                }

                .stat-card:hover {
                    transform: translateY(-5px);
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .stat-icon {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    color: #00d4ff;
                }

                .stat-card.top-platform .stat-icon {
                    color: #ffd700;
                }

                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, white 0%, #cbd5e1 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 0.25rem;
                }

                .stat-label {
                    color: #94a3b8;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 600;
                }

                .stat-sub {
                    font-size: 0.8rem;
                    color: #00d4ff;
                    margin-top: 0.25rem;
                }

                .stats-section h3 {
                    margin-bottom: 1.5rem;
                    font-size: 1.1rem;
                    color: #fff;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding-bottom: 0.5rem;
                }

                .platform-bars {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .platform-stat-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .stat-row-label {
                    width: 100px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #e2e8f0;
                    text-align: right;
                }

                .stat-row-bar-container {
                    flex: 1;
                    height: 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                    overflow: hidden;
                }

                .stat-row-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #00d4ff, #9d4edd);
                    border-radius: 6px;
                    box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
                }

                .stat-row-value {
                    width: 80px;
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #fff;
                }

                .stat-percentage {
                    font-size: 0.75rem;
                    color: #94a3b8;
                    font-weight: 400;
                    margin-left: 4px;
                }

                @media (max-width: 600px) {
                    .stat-card {
                        padding: 1rem;
                    }
                    .stat-value {
                        font-size: 2rem;
                    }
                    .stat-row-label {
                        width: 70px;
                        font-size: 0.8rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default StatsModal;
