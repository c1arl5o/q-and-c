import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import Header from './Header';
import Sidebar from './Sidebar';
import './ImageHub.css';

interface ImageHubProps {
  onViewChange: (view: 'signin' | 'onboarding' | 'home' | 'shop' | 'add' | 'map' | 'imagehub') => void;
  onImageSelect: (imageId: string) => void;
}

interface UnlockableImage {
  id: string;
  name: string;
  status: 'in-progress' | 'unlocked';
  progress?: number; // 0-100
  totalTiles?: number;
  unlockedTiles?: number;
}

export default function ImageHub({ onViewChange, onImageSelect }: ImageHubProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUserCoins, setCurrentUserCoins] = useState(0);
  const [images, setImages] = useState<UnlockableImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profiles } = await supabase.from('profiles').select('*');
      if (profiles) {
        const currentUserProfile = profiles.find(p => p.id === user.id);
        setCurrentUserCoins(currentUserProfile?.coins || 0);
      }

      // Fetch tiles to calculate progress for Image 1
      const { data: tilesData } = await supabase
        .from('tiles')
        .select('*');

      if (tilesData) {
        const totalTiles = tilesData.length;
        const unlockedTiles = tilesData.filter(t => t.is_unlocked).length;
        const progress = totalTiles > 0 ? Math.round((unlockedTiles / totalTiles) * 100) : 0;
        const status = progress === 100 ? 'unlocked' : 'in-progress';

        setImages([
          {
            id: 'image-1',
            name: 'Image 1',
            status: status,
            progress: progress,
            totalTiles: totalTiles,
            unlockedTiles: unlockedTiles
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageId: string) => {
    onImageSelect(imageId);
    onViewChange('map');
  };

  const inProgressImages = images.filter(img => img.status === 'in-progress');
  const unlockedImages = images.filter(img => img.status === 'unlocked');

  if (loading) {
    return (
      <div className="imagehub-container">
        <div className="loading">Loading images...</div>
      </div>
    );
  }

  return (
    <div className="imagehub-container">
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
      <div className="imagehub-content">
        <div className="imagehub-header">
          <h1 className="imagehub-title">Unlockable Images</h1>
          <div className="coins-display">
            <span className="coin-icon">🪙</span>
            <span className="coin-amount">{currentUserCoins}</span>
          </div>
        </div>

        {/* In Progress Section */}
        {inProgressImages.length > 0 && (
          <div className="image-section">
            <h2 className="section-title">In Progress</h2>
            <div className="image-list">
              {inProgressImages.map((image) => (
                <div
                  key={image.id}
                  className="image-card in-progress"
                  onClick={() => handleImageClick(image.id)}
                >
                  <div className="image-card-content">
                    <h3 className="image-name">{image.name}</h3>
                    <div className="image-progress">
                      <div className="progress-info">
                        <span>{image.unlockedTiles} / {image.totalTiles} tiles</span>
                        <span>{image.progress}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${image.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="image-card-icon">🔓</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unlocked Section */}
        {unlockedImages.length > 0 && (
          <div className="image-section">
            <h2 className="section-title">Unlocked</h2>
            <div className="image-list">
              {unlockedImages.map((image) => (
                <div
                  key={image.id}
                  className="image-card unlocked"
                  onClick={() => handleImageClick(image.id)}
                >
                  <div className="image-card-content">
                    <h3 className="image-name">{image.name}</h3>
                    <p className="unlocked-text">Fully Unlocked! ✨</p>
                  </div>
                  <div className="image-card-icon">✅</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length === 0 && (
          <div className="empty-state">
            <p>No images available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
