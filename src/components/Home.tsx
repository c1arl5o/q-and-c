import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import Header from './Header';
import Sidebar from './Sidebar';
import './Home.css';

interface HomeProps {
  onViewChange: (view: 'signin' | 'onboarding' | 'home' | 'shop' | 'add') => void;
}

export default function Home({ onViewChange }: HomeProps) {
  // const [displayName, setDisplayName] = useState<string>('');
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
        // setDisplayName(user.user_metadata?.display_name || 'there');
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
      <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navItems={[
          {
            label: 'Home',
            href: '#',
            active: true
          },
          {
            label: 'Shop',
            href: '#shop',
            onClick: (e) => {
              e.preventDefault();
              setIsSidebarOpen(false);
              onViewChange('shop');
            }
          }
        ]}
      />

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

      {/* Add Button and Flyout Menu */}
      <button 
        className="add-button" 
        //onClick={() => setIsMenuOpen(!isMenuOpen)}
        onClick={() => {
              onViewChange('add');
            }}
        aria-label="Add new post"
      >
        +
      </button>
    </div>
  );
}
