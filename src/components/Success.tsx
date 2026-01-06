import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPush,
  savePushSubscription,
  sendPushNotification,
} from '../utils/pushNotifications';
import './Success.css';

interface User {
  id: string;
  email: string;
  created_at: string;
}

export default function Success() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  useEffect(() => {
    initializePushNotifications();
    fetchUsers();
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserId(user.id);

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) return;

      // Request notification permission
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }

      // Subscribe to push notifications
      const subscription = await subscribeToPush(registration);
      if (!subscription) return;

      // Save subscription to database
      await savePushSubscription(subscription, user.id);
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users from API endpoint
      const response = await fetch('/api/list-users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (userId: string) => {
    if (sendingTo) return; // Prevent multiple clicks
    
    try {
      setSendingTo(userId);
      const success = await sendPushNotification(
        userId,
        'TEST NOTIFICATION',
        'This is a test notification from Q&C'
      );

      if (success) {
        alert('Push notification sent successfully!');
      } else {
        alert('Failed to send push notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
    } finally {
      setSendingTo(null);
    }
  };

  return (
    <div className="success-container">
      <div className="success-card">
        <h1 className="success-title">Successfully signed in</h1>
        
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Send Test Notification</h2>
          
          {loading && <p>Loading users...</p>}
          
          {error && (
            <p style={{ color: 'red' }}>Error: {error}</p>
          )}
          
          {!loading && !error && users.length === 0 && (
            <p>No users found</p>
          )}
          
          {!loading && !error && users.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  disabled={sendingTo === user.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    cursor: sendingTo === user.id ? 'wait' : 'pointer',
                    backgroundColor: currentUserId === user.id ? '#f0f0f0' : 'white',
                    textAlign: 'left',
                    opacity: sendingTo === user.id ? 0.6 : 1,
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{user.email}</div>
                  {currentUserId === user.id && (
                    <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                      (You)
                    </div>
                  )}
                  {sendingTo === user.id && (
                    <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                      Sending...
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
