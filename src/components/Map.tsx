import { useEffect, useState, useRef } from 'react';
import { supabase } from '../config/supabaseClient';
import Header from './Header';
import Sidebar from './Sidebar';
import './Map.css';

interface MapProps {
  onViewChange: (view: 'signin' | 'onboarding' | 'home' | 'shop' | 'add' | 'map') => void;
}

interface Tile {
  id: string;
  position_x: number;
  position_y: number;
  tile_type: string;
  unlock_cost: number;
  user1_contribution: number;
  user2_contribution: number;
  is_unlocked: boolean;
  image_url: string | null;
}

export default function Map({ onViewChange }: MapProps) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserCoins, setCurrentUserCoins] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [contributionAmount, setContributionAmount] = useState<number>(0);

  // New state for zoom and pan
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data: profiles } = await supabase.from('profiles').select('*');
      if (profiles) {
        const currentUserProfile = profiles.find(p => p.id === user.id);
        setCurrentUserCoins(currentUserProfile?.coins || 0);
      }

      const { data: tilesData, error: tilesError } = await supabase
        .from('tiles')
        .select('*')
        .order('position_y', { ascending: true })
        .order('position_x', { ascending: true });

      if (tilesError) console.error('Error fetching tiles:', tilesError);
      else setTiles(tilesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHexagonImageNumber = (positionX: number, positionY: number): string => {
    const hexagonNumber = (positionX * 6) + positionY + 1;
    return hexagonNumber.toString().padStart(3, '0');
  };

  const getHexagonImage = (tile: Tile): string => {
    const hexNumber = getHexagonImageNumber(tile.position_x, tile.position_y);
    return `/hexagon_output/hexagon_${hexNumber}.png`;
  };

  const handleTileClick = (tile: Tile) => {
    if (isDragging) return;
    if (tile.is_unlocked) {
      alert('This tile is already unlocked!');
      return;
    }
    setSelectedTile(tile);
    const maxContribution = Math.floor(tile.unlock_cost / 2);
    const alreadyContributed = tile.user1_contribution + tile.user2_contribution;
    const needed = tile.unlock_cost - alreadyContributed;
    const suggestedAmount = Math.min(maxContribution, needed, currentUserCoins);
    setContributionAmount(suggestedAmount);
  };

  const handleContribute = async () => {
    if (!selectedTile || !currentUserId) return;
    if (contributionAmount <= 0) {
      alert('Please enter a valid contribution amount');
      return;
    }
    if (contributionAmount > currentUserCoins) {
      alert('You don\'t have enough coins!');
      return;
    }

    const maxContribution = Math.floor(selectedTile.unlock_cost / 2);

    try {
      const isUser1 = selectedTile.user1_contribution === 0 ||
        (selectedTile.user2_contribution > 0 && selectedTile.user1_contribution < maxContribution);

      const newUser1Contribution = isUser1
        ? Math.min(selectedTile.user1_contribution + contributionAmount, maxContribution)
        : selectedTile.user1_contribution;

      const newUser2Contribution = !isUser1
        ? Math.min(selectedTile.user2_contribution + contributionAmount, maxContribution)
        : selectedTile.user2_contribution;

      if ((isUser1 && newUser1Contribution > maxContribution) || (!isUser1 && newUser2Contribution > maxContribution)) {
        alert(`You can only contribute up to ${maxContribution} coins (50% of unlock cost)`);
        return;
      }

      await supabase.from('tiles').update({
        user1_contribution: newUser1Contribution,
        user2_contribution: newUser2Contribution,
        updated_at: new Date().toISOString()
      }).eq('id', selectedTile.id);

      await supabase.from('profiles').update({
        coins: currentUserCoins - contributionAmount,
        updated_at: new Date().toISOString()
      }).eq('id', currentUserId);

      const isNowUnlocked = newUser1Contribution >= maxContribution && newUser2Contribution >= maxContribution;
      if (isNowUnlocked) {
        alert('🎉 Tile unlocked! The cozy town is growing!');
      } else {
        const totalContribution = newUser1Contribution + newUser2Contribution;
        alert(`Contribution successful! ${selectedTile.unlock_cost - totalContribution} coins still needed to unlock this tile.`);
      }

      setSelectedTile(null);
      setContributionAmount(0);
      await fetchData();
    } catch (error) {
      console.error('Error contributing to tile:', error);
      alert('Failed to contribute to tile');
    }
  };

  // Zoom and Pan handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newZoom = e.deltaY > 0 ? zoom / zoomFactor : zoom * zoomFactor;
    setZoom(Math.max(0.5, Math.min(newZoom, 3))); // Clamp zoom level
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return <div className="map-container"><div className="loading">Loading map...</div></div>;
  }

  return (
    <div className="map-container">
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navItems={[
          { label: 'Home', href: '#', onClick: (e) => { e.preventDefault(); setIsSidebarOpen(false); onViewChange('home'); } },
          { label: 'The Map', href: '#map', active: true },
          { label: 'Shop', href: '#shop', onClick: (e) => { e.preventDefault(); setIsSidebarOpen(false); onViewChange('shop'); } }
        ]}
      />
      <div className="map-content">
        <div className="map-header">
          <h1 className="map-title">The Cozy Town</h1>
          <div className="coins-display">
            <span className="coin-icon">🪙</span>
            <span className="coin-amount">{currentUserCoins}</span>
          </div>
        </div>

        {/* Viewport for map */}
        <div
          className="map-viewport"
          ref={mapRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="map-grid"
            style={{
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            }}
          >
            {tiles.map((tile) => (
              <div
                key={tile.id}
                className={`tile ${tile.is_unlocked ? 'unlocked' : 'locked'}`}
                onClick={() => handleTileClick(tile)}
                style={{
                  '--x': tile.position_x,
                  '--y': tile.position_y,
                } as React.CSSProperties}
              >
                <div className="tile-content">
                  {tile.is_unlocked ? (
                    <img src={getHexagonImage(tile)} alt={`Tile ${tile.position_x}, ${tile.position_y}`} />
                  ) : (
                    <div className="locked-overlay">🔒</div>
                  )}
                </div>
                {!tile.is_unlocked && (
                  <div className="tile-progress">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${((tile.user1_contribution + tile.user2_contribution) / tile.unlock_cost) * 100}%`
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTile && (
        <div className="modal-overlay" onClick={() => setSelectedTile(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Unlock Tile</h2>
            <div className="modal-info">
              <p><strong>Type:</strong> {selectedTile.tile_type}</p>
              <p><strong>Unlock Cost:</strong> {selectedTile.unlock_cost} coins</p>
              <p><strong>Current Progress:</strong></p>
              <div className="contribution-bars">
                <div className="contribution-bar">
                  <span>User 1:</span>
                  <div className="bar">
                    <div
                      className="bar-fill user1"
                      style={{
                        width: `${(selectedTile.user1_contribution / (selectedTile.unlock_cost / 2)) * 100}%`
                      }}
                    />
                  </div>
                  <span>{selectedTile.user1_contribution} / {Math.floor(selectedTile.unlock_cost / 2)}</span>
                </div>
                <div className="contribution-bar">
                  <span>User 2:</span>
                  <div className="bar">
                    <div
                      className="bar-fill user2"
                      style={{
                        width: `${(selectedTile.user2_contribution / (selectedTile.unlock_cost / 2)) * 100}%`
                      }}
                    />
                  </div>
                  <span>{selectedTile.user2_contribution} / {Math.floor(selectedTile.unlock_cost / 2)}</span>
                </div>
              </div>
              <p className="info-text">
                Both users must contribute at least 50% to unlock this tile.
              </p>
            </div>
            <div className="contribution-input">
              <label>Your Contribution:</label>
              <input
                type="number"
                min="1"
                max={Math.min(currentUserCoins, Math.floor(selectedTile.unlock_cost / 2))}
                value={contributionAmount}
                onChange={(e) => setContributionAmount(parseInt(e.target.value) || 0)}
              />
              <p className="input-hint">
                Max: {Math.min(currentUserCoins, Math.floor(selectedTile.unlock_cost / 2))} coins
              </p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSelectedTile(null)}>
                Cancel
              </button>
              <button
                className="btn-contribute"
                onClick={handleContribute}
                disabled={contributionAmount <= 0 || contributionAmount > currentUserCoins}
              >
                Contribute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
