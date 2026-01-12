import { useState } from 'react';
import './Add.css';

interface AddProps {
  onViewChange: (view: 'signin' | 'onboarding' | 'home' | 'shop' | 'add') => void;
}

export default function Add({ onViewChange: _onViewChange }: AddProps) {
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
            <div className="selection-label">Status Post</div>
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
              <p className="placeholder-text">Activity will be added</p>
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