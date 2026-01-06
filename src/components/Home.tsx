import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import './Home.css';

export default function Home() {
  const [displayName, setDisplayName] = useState<string>('');
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<number>(3);
  const [loading, setLoading] = useState(true);

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
      <div className="dashboard">
        <h1 className="dashboard-title">My Dashboard</h1>
        <p className="dashboard-greeting">Hello {displayName}!</p>
        
        <div className="workout-circles">
          {Array.from({ length: workoutsPerWeek }, (_, index) => (
            <div key={index} className="workout-circle">
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="feed-section">
        <h2 className="feed-title">Feed</h2>
        <p className="feed-placeholder">Posts will appear here soon...</p>
      </div>
    </div>
  );
}
