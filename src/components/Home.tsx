import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import './Home.css';

export default function Home() {
  const [displayName, setDisplayName] = useState<string>('');
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setDisplayName(user.user_metadata?.display_name || 'there');
        setWorkoutsPerWeek(user.user_metadata?.workouts_per_week || 3);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <button 
          className="burger-menu" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 className="header-title">Q&C</h1>
      </header>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button 
            className="close-btn" 
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">Home</a>
        </nav>
      </div>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="overlay" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div className="dashboard">
        
        <div className="workout-circles">
          {Array.from({ length: workoutsPerWeek }, (_, index) => (
            <div key={index} className="workout-circle">
              {index + 1}
            </div>
          ))}
        </div>

        <div className="metrics-container">
          <div className="metric-box">
            <div className="metric-icon">🪙</div>
            <div className="metric-value">0</div>
          </div>
          <div className="metric-box">
            <div className="metric-icon">🔥</div>
            <div className="metric-value">0</div>
          </div>
        </div>
      </div>

      <div className="feed-section">
        <h2 className="feed-title">Feed</h2>
        <p className="feed-placeholder">Posts will appear here soon...</p>
      </div>
    </div>
  );
}
