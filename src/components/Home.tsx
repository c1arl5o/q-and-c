import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import Header from './Header';
import Sidebar from './Sidebar';
import './Home.css';

interface HomeProps {
  onViewChange: (view: 'signin' | 'onboarding' | 'home' | 'shop' | 'add') => void;
}

interface Activity {
  id: string;
  user_id: string;
  activity_type: 'walking' | 'running' | 'swimming';
  time_minutes: number;
  distance_km: number;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  user: {
    email: string;
    display_name?: string;
  };
}

interface Post {
  id: string;
  user_id: string;
  content: string;
  photo_url: string | null;
  created_at: string;
  user: {
    email: string;
    display_name?: string;
  };
}

interface Challenge {
  id: string;
  created_by_user_id: string;
  target_user_id: string;
  description: string | null;
  goal: string;
  duration_days: number | null;
  created_at: string;
  completed_at: string | null;
  creator: {
    email: string;
    display_name?: string;
  };
  target: {
    email: string;
    display_name?: string;
  };
}

type FeedItem = 
  | ({ type: 'activity' } & Activity)
  | ({ type: 'post' } & Post)
  | ({ type: 'challenge' } & Challenge);

export default function Home({ onViewChange }: HomeProps) {
  // const [displayName, setDisplayName] = useState<string>('');
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchFeed();
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

  const fetchFeed = async () => {
    try {
      setFeedLoading(true);

      // Fetch all three types in parallel
      const [activitiesRes, postsRes, challengesRes] = await Promise.all([
        supabase
          .from('activities')
          .select(`
            *,
            user:user_id (
              email,
              raw_user_meta_data
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('posts')
          .select(`
            *,
            user:user_id (
              email,
              raw_user_meta_data
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('challenges')
          .select(`
            *,
            creator:created_by_user_id (
              email,
              raw_user_meta_data
            ),
            target:target_user_id (
              email,
              raw_user_meta_data
            )
          `)
          .order('created_at', { ascending: false })
      ]);

      // Merge and sort by created_at
      const allItems: FeedItem[] = [
        ...(activitiesRes.data || []).map(a => ({
          ...a,
          type: 'activity' as const,
          user: {
            email: a.user?.email || 'Unknown',
            display_name: a.user?.raw_user_meta_data?.display_name
          }
        })),
        ...(postsRes.data || []).map(p => ({
          ...p,
          type: 'post' as const,
          user: {
            email: p.user?.email || 'Unknown',
            display_name: p.user?.raw_user_meta_data?.display_name
          }
        })),
        ...(challengesRes.data || []).map(c => ({
          ...c,
          type: 'challenge' as const,
          creator: {
            email: c.creator?.email || 'Unknown',
            display_name: c.creator?.raw_user_meta_data?.display_name
          },
          target: {
            email: c.target?.email || 'Unknown',
            display_name: c.target?.raw_user_meta_data?.display_name
          }
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setFeedItems(allItems);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setFeedLoading(false);
    }
  };

  const getActivityEmoji = (type: string) => {
    switch (type) {
      case 'walking': return '🚶';
      case 'running': return '🏃';
      case 'swimming': return '🏊';
      default: return '🏃';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getUserDisplayName = (user: { email: string; display_name?: string }) => {
    return user.display_name || user.email.split('@')[0];
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
        
        {feedLoading ? (
          <p className="feed-placeholder">Loading feed...</p>
        ) : feedItems.length === 0 ? (
          <p className="feed-placeholder">No posts yet. Be the first to add something!</p>
        ) : (
          <div className="feed-items">
            {feedItems.map((item) => (
              <div key={`${item.type}-${item.id}`} className="feed-item">
                <div className="feed-item-header">
                  <div className="feed-item-author">
                    {item.type === 'activity' && (
                      <>
                        <strong>{getUserDisplayName(item.user)}</strong>
                        <span> logged an activity</span>
                      </>
                    )}
                    {item.type === 'post' && (
                      <>
                        <strong>{getUserDisplayName(item.user)}</strong>
                        <span> shared a post</span>
                      </>
                    )}
                    {item.type === 'challenge' && (
                      <>
                        <strong>{getUserDisplayName(item.creator)}</strong>
                        <span> created a challenge for </span>
                        <strong>{getUserDisplayName(item.target)}</strong>
                      </>
                    )}
                  </div>
                  <div className="feed-item-time">{formatDate(item.created_at)}</div>
                </div>

                <div className="feed-item-content">
                  {item.type === 'activity' && (
                    <>
                      <div className="activity-summary">
                        <span className="activity-type">{getActivityEmoji(item.activity_type)} {item.activity_type}</span>
                        <span className="activity-stats">
                          {item.time_minutes} min • {item.distance_km} km
                        </span>
                      </div>
                      {item.notes && <p className="activity-notes">{item.notes}</p>}
                      {item.photo_url && (
                        <img 
                          src={item.photo_url} 
                          alt="Activity" 
                          className="feed-item-photo"
                        />
                      )}
                    </>
                  )}

                  {item.type === 'post' && (
                    <>
                      <p className="post-content">{item.content}</p>
                      {item.photo_url && (
                        <img 
                          src={item.photo_url} 
                          alt="Post" 
                          className="feed-item-photo"
                        />
                      )}
                    </>
                  )}

                  {item.type === 'challenge' && (
                    <div className="challenge-content">
                      <div className="challenge-goal">
                        <strong>Goal:</strong> {item.goal}
                      </div>
                      {item.description && (
                        <p className="challenge-description">{item.description}</p>
                      )}
                      {item.duration_days && (
                        <div className="challenge-duration">
                          Duration: {item.duration_days} days
                        </div>
                      )}
                      {item.completed_at && (
                        <div className="challenge-completed">
                          ✅ Completed {formatDate(item.completed_at)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
