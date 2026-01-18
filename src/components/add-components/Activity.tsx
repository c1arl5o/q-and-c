import { useState, useRef } from 'react';
import { supabase } from '../../config/supabaseClient';
import './AddComponents.css';

interface ActivityProps {
  onViewChange: (view: 'signin' | 'onboarding' | 'home' | 'shop' | 'add') => void;
}

export default function Activity({ onViewChange }: ActivityProps) {
  const [activityType, setActivityType] = useState<'walking' | 'running' | 'swimming'>('walking');
  const [time, setTime] = useState('');
  const [distance, setDistance] = useState('');
  const [customText, setCustomText] = useState('');
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to save an activity');
        return;
      }

      let photoUrl: string | null = null;

      // Upload photo to Supabase storage if photo exists
      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('activity-photos')
          .upload(fileName, photo);

        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
          alert('Failed to upload photo, but will continue saving activity');
        } else {
          // Get public URL for the uploaded photo
          const { data: { publicUrl } } = supabase.storage
            .from('activity-photos')
            .getPublicUrl(uploadData.path);
          photoUrl = publicUrl;
        }
      }

      // Insert activity into Supabase activities table
      const { error: insertError } = await supabase
        .from('activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          time_minutes: parseInt(time),
          distance_km: parseFloat(distance),
          notes: customText || null,
          photo_url: photoUrl
        });

      if (insertError) {
        throw insertError;
      }
      
      alert('Activity saved successfully!');
      
      // Reset form
      setActivityType('walking');
      setTime('');
      setDistance('');
      setCustomText('');
      setPhoto(null);
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Navigate back to home
      setTimeout(() => onViewChange('home'), 500);
    } catch (error) {
      console.error('Error saving activity:', error);
      alert('Failed to save activity');
    } finally {
      setIsSaving(false);
    }
  };

  return (
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

      <h3 className="form-section-title">Notes (Optional)</h3>
      <div className="input-group">
        <label htmlFor="custom-text">Add your own notes</label>
        <textarea
          id="custom-text"
          className="activity-textarea"
          placeholder="How did you feel? Any comments about the activity?"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          rows={4}
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
  );
}
