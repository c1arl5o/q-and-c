import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import './AddComponents.css';

interface User {
  id: string;
  email: string;
  created_at: string;
}

export default function Post() {
  const [postText, setPostText] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [wantToNotify, setWantToNotify] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (wantToNotify) {
      fetchUsers();
    }
  }, [wantToNotify]);

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

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePost = async () => {
    if (!postText.trim()) {
      alert('Please enter some text for your post');
      return;
    }

    setIsSaving(true);
    
    try {
      // TODO: Upload photo to Supabase storage if photo exists
      // TODO: Insert post into Supabase posts table
      
      // Placeholder for Supabase integration
      console.log('Saving post:', {
        postText,
        photo: photo?.name,
        notifyUsers: selectedUsers,
      });
      
      alert('Post saved successfully!');
      
      // Reset form
      setPostText('');
      setPhoto(null);
      setPhotoPreview(null);
      setWantToNotify(false);
      setSelectedUsers([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="post-form">
      <h3 className="form-section-title">What's on your mind?</h3>
      <div className="input-group">
        <textarea
          className="post-textarea"
          placeholder="Share your thoughts, achievements, or goals..."
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          rows={6}
        />
      </div>

      <h3 className="form-section-title">Photo (Optional)</h3>
      <div className="photo-section">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="file-input"
          id="post-photo-upload"
        />
        <label htmlFor="post-photo-upload" className="photo-button">
          📷 Add Photo
        </label>
        
        {photoPreview && (
          <div className="photo-preview">
            <img src={photoPreview} alt="Post preview" />
            <button 
              className="remove-photo"
              onClick={() => {
                setPhoto(null);
                setPhotoPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <h3 className="form-section-title">Do you want to notify someone?</h3>
      <div className="input-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={wantToNotify}
            onChange={(e) => setWantToNotify(e.target.checked)}
          />
          <span style={{ marginLeft: '0.5rem' }}>Yes, notify users</span>
        </label>
      </div>

      {wantToNotify && (
        <div className="users-list" style={{ marginTop: '1rem' }}>
          {loadingUsers && <p>Loading users...</p>}
          
          {!loadingUsers && users.length === 0 && <p>No users found</p>}
          
          {!loadingUsers && users.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {users.map(user => (
                <div
                  key={user.id}
                  onClick={() => toggleUserSelection(user.id)}
                  style={{
                    padding: '0.75rem',
                    border: '2px solid',
                    borderColor: selectedUsers.includes(user.id) ? '#4CAF50' : '#ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedUsers.includes(user.id) ? '#e8f5e9' : 'white',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
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
          {selectedUsers.length > 0 && (
            <p style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.9rem' }}>
              {selectedUsers.length} user(s) selected
            </p>
          )}
        </div>
      )}

      <button 
        className="save-button"
        onClick={handleSavePost}
        disabled={isSaving}
      >
        {isSaving ? 'Posting...' : 'Post'}
      </button>
    </div>
  );
}
