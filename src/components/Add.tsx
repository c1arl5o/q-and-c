import { useState } from 'react';
import './Add.css';
import Activity from './add-components/Activity';
import Post from './add-components/Post';
import Challenge from './add-components/Challenge';

interface AddProps {
  onViewChange: (view: 'signin' | 'onboarding' | 'home' | 'shop' | 'add' | 'map' | 'imagehub') => void;
}

export default function Add({ onViewChange }: AddProps) {
  const [selectedType, setSelectedType] = useState<'activity' | 'status' | 'challenge' | null>(null);

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
              <Activity onViewChange={onViewChange} />
            ) : selectedType === 'status' ? (
              <Post onViewChange={onViewChange} />
            ) : (
              <Challenge onViewChange={onViewChange} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}