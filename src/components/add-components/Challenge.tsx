import { useState } from 'react';
import './AddComponents.css';

export default function Challenge() {
  const [challengeDescription, setChallengeDescription] = useState('');
  const [challengeGoal, setChallengeGoal] = useState('');
  const [challengeDuration, setChallengeDuration] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChallenge = async () => {
    if (!challengeGoal.trim()) {
      alert('Please fill in at least the goal');
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
      });
      
      alert('Challenge created successfully!');
      
      // Reset form
      setChallengeDescription('');
      setChallengeGoal('');
      setChallengeDuration('');
    } catch (error) {
      console.error('Error saving challenge:', error);
      alert('Failed to create challenge');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="challenge-form">

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
