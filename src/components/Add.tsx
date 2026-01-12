import { useState, useRef } from 'react';
import './Add.css';
// import { supabase } from '../config/supabaseClient';

interface AddProps {
  onViewChange: (view: 'signin' | 'onboarding' | 'home' | 'shop' | 'add') => void;
}

export default function Add({ onViewChange: _onViewChange }: AddProps) {
  const [selectedType, setSelectedType] = useState<'activity' | 'status' | 'challenge' | null>(null);
  
  // Activity form state
  const [activityType, setActivityType] = useState<'walking' | 'running' | 'swimming'>('walking');
  const [time, setTime] = useState('');
  const [distance, setDistance] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSaveActivity = async () => {
    if (!time || !distance) {
      alert('Please fill in both time and distance');
      return;
    }

    setIsSaving(true);
    
    try {
      // TODO: Upload photo to Supabase storage if photo exists
      // TODO: Insert activity into Supabase activities table
      
      // Placeholder for Supabase integration
      console.log('Saving activity:', {
        activityType,
        time,
        distance,
        photo: photo?.name,
      });
      
      alert('Activity saved successfully!');
      
      // Reset form
      setActivityType('walking');
      setTime('');
      setDistance('');
      setPhoto(null);
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save activity');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-container">
      <div className="add-content">
        <h2 className="add-title">What would you like to add?</h2>
        
        <div className="selection-container">
          <div
            className={`selection-option ${selectedType === 'activity' ? 'selected' : ''}`}
            onClick={() => setSelectedType('activity')}
          >
            <div className="selection-label">Activity</div>
          </div>
          
          <div
            className={`selection-option ${selectedType === 'status' ? 'selected' : ''}`}
            onClick={() => setSelectedType('status')}
          >
            <div className="selection-label">Post</div>
          </div>

          <div
            className={`selection-option ${selectedType === 'challenge' ? 'selected' : ''}`}
            onClick={() => setSelectedType('challenge')}
          >
            <div className="selection-label">Challenge</div>
          </div>
        </div>

        {selectedType && (
          <div className="content-area">
            {selectedType === 'activity' ? (
              <div className="activity-form">
                <h3 className="form-section-title">Activity Type</h3>
                <select 
                  className="activity-dropdown"
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as 'walking' | 'running' | 'swimming')}
                >
                  <option value="walking">🚶 Walking</option>
                  <option value="running">🏃 Running</option>
                  <option value="swimming">🏊 Swimming</option>
                </select>

                <h3 className="form-section-title">Time & Distance</h3>
                <div className="input-group">
                  <label htmlFor="time">Time (minutes)</label>
                  <input
                    id="time"
                    type="number"
                    className="activity-input"
                    placeholder="e.g., 30"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    min="0"
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="distance">Distance (km)</label>
                  <input
                    id="distance"
                    type="number"
                    className="activity-input"
                    placeholder="e.g., 5.2"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    min="0"
                    step="0.1"
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
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="photo-button">
                    📷 Add Photo
                  </label>
                  
                  {photoPreview && (
                    <div className="photo-preview">
                      <img src={photoPreview} alt="Activity preview" />
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

                <button 
                  className="save-button"
                  onClick={handleSaveActivity}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            ) : selectedType === 'status' ? (
              <p className="placeholder-text">Status post will be added</p>
            ) : (
              <p className="placeholder-text">Challenge will be added</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}