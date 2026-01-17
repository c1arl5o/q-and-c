import { useState, useRef } from 'react';
import './AddComponents.css';

export default function Post() {
  const [postText, setPostText] = useState('');
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
      });
      
      alert('Post saved successfully!');
      
      // Reset form
      setPostText('');
      setPhoto(null);
      setPhotoPreview(null);
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
