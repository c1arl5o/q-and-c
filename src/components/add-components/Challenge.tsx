import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import './AddComponents.css';

interface User {
  id: string;
  email: string;
  created_at: string;
}

export default function Challenge() {
  const [challengeDescription, setChallengeDescription] = useState('');
  const [challengeGoal, setChallengeGoal] = useState('');
  const [challengeDuration, setChallengeDuration] = useState('');
  const [challengeTarget, setChallengeTarget] = useState<'self' | 'someone-else'>('self');
  const [isSaving, setIsSaving] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (challengeTarget === 'someone-else') {
      fetchUsers();
    } else {
      setSelectedUserId(null);
    }
  }, [challengeTarget]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/list-users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSaveChallenge = async () => {
    if (!challengeGoal.trim()) {
      alert('Please fill in at least the goal');
      return;
    }

    if (challengeTarget === 'someone-else' && !selectedUserId) {
      alert('Please select a user for this challenge');
      return;
    }

    setIsSaving(true);
    
    try {
      // TODO: Insert challenge into Supabase challenges table
      
      // Placeholder for Supabase integration
      console.log('Saving challenge:', {
        challengeDescription,
        challengeGoal,
        challengeDuration,
        challengeTarget,
        targetUserId: challengeTarget === 'someone-else' ? selectedUserId : currentUserId,
      });
      
      alert('Challenge created successfully!');
      
      // Reset form
      setChallengeDescription('');
      setChallengeGoal('');
      setChallengeDuration('');
      setChallengeTarget('self');
      setSelectedUserId(null);
    } catch (error) {
      console.error('Error saving challenge:', error);
      alert('Failed to create challenge');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="challenge-form">

      <h3 className="form-section-title">Who is this challenge for?</h3>
      <div className="input-group">
        <div style={{ display: 'flex', gap: '1rem' }}>
          <label 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '0.75rem 1.5rem',
              border: '2px solid',
              borderColor: challengeTarget === 'self' ? '#4CAF50' : '#ddd',
              borderRadius: '8px',
              backgroundColor: challengeTarget === 'self' ? '#e8f5e9' : 'white',
              flex: 1,
              transition: 'all 0.2s',
            }}
          >
            <input
              type="radio"
              name="challenge-target"
              value="self"
              checked={challengeTarget === 'self'}
              onChange={(e) => setChallengeTarget(e.target.value as 'self')}
              style={{ marginRight: '0.5rem' }}
            />
            <span style={{ fontWeight: challengeTarget === 'self' ? 'bold' : 'normal' }}>
              For Myself
            </span>
          </label>
          <label 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '0.75rem 1.5rem',
              border: '2px solid',
              borderColor: challengeTarget === 'someone-else' ? '#4CAF50' : '#ddd',
              borderRadius: '8px',
              backgroundColor: challengeTarget === 'someone-else' ? '#e8f5e9' : 'white',
              flex: 1,
              transition: 'all 0.2s',
            }}
          >
            <input
              type="radio"
              name="challenge-target"
              value="someone-else"
              checked={challengeTarget === 'someone-else'}
              onChange={(e) => setChallengeTarget(e.target.value as 'someone-else')}
              style={{ marginRight: '0.5rem' }}
            />
            <span style={{ fontWeight: challengeTarget === 'someone-else' ? 'bold' : 'normal' }}>
              For Someone Else
            </span>
          </label>
        </div>
      </div>

      {challengeTarget === 'someone-else' && (
        <div className="users-list" style={{ marginTop: '1rem' }}>
          <h3 className="form-section-title">Select User</h3>
          
          {loadingUsers && <p>Loading users...</p>}
          
          {!loadingUsers && users.length === 0 && <p>No users found</p>}
          
          {!loadingUsers && users.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {users.map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  style={{
                    padding: '0.75rem',
                    border: '2px solid',
                    borderColor: selectedUserId === user.id ? '#4CAF50' : '#ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedUserId === user.id ? '#e8f5e9' : 'white',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="radio"
                      checked={selectedUserId === user.id}
                      onChange={() => {}} // Handled by div onClick
                      style={{ pointerEvents: 'none' }}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{user.email}</div>
                      {currentUserId === user.id && (
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>(You)</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <h3 className="form-section-title">Description (Optional)</h3>
      <div className="input-group">
        <textarea
          className="challenge-textarea"
          placeholder="Describe what this challenge is about..."
          value={challengeDescription}
          onChange={(e) => setChallengeDescription(e.target.value)}
          rows={4}
        />
      </div>

      <h3 className="form-section-title">Goal</h3>
      <div className="input-group">
        <input
          type="text"
          className="challenge-input"
          placeholder="e.g., Run 100km in total"
          value={challengeGoal}
          onChange={(e) => setChallengeGoal(e.target.value)}
        />
      </div>

      <h3 className="form-section-title">Duration (Optional)</h3>
      <div className="input-group">
        <select 
          className="challenge-dropdown"
          value={challengeDuration}
          onChange={(e) => setChallengeDuration(e.target.value)}
        >
          <option value="">Select duration...</option>
          <option value="7">1 Week</option>
          <option value="14">2 Weeks</option>
          <option value="30">1 Month</option>
          <option value="60">2 Months</option>
          <option value="90">3 Months</option>
        </select>
      </div>

      <button 
        className="save-button"
        onClick={handleSaveChallenge}
        disabled={isSaving}
      >
        {isSaving ? 'Creating...' : 'Create Challenge'}
      </button>
    </div>
  );
}
