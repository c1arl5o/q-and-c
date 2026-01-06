import { useState, type FormEvent } from 'react';
import { supabase } from '../config/supabaseClient';
import './Onboarding.css';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [displayName, setDisplayName] = useState('');
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState<number>(3);
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Save user preferences to a profile table or user metadata
      // For now, we'll update the user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          workouts_per_week: workoutsPerWeek,
          fitness_goal: fitnessGoal,
          experience_level: experienceLevel,
          onboarding_completed: true,
        }
      });

      if (updateError) throw updateError;

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1 className="onboarding-title">Complete Your Profile</h1>
        <p className="onboarding-subtitle">
          Help us personalize your fitness journey
        </p>
        
        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-group">
            <label className="form-label">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How should we call you?"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              How often do you want to work out per week?
            </label>
            <div className="workout-frequency">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`frequency-button ${workoutsPerWeek === num ? 'active' : ''}`}
                  onClick={() => setWorkoutsPerWeek(num)}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="frequency-label">
              {workoutsPerWeek} {workoutsPerWeek === 1 ? 'day' : 'days'} per week
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              What's your primary fitness goal?
            </label>
            <select
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value)}
              className="form-select"
            >
              <option value="">Select a goal</option>
              <option value="lose-weight">Lose Weight</option>
              <option value="build-muscle">Build Muscle</option>
              <option value="improve-endurance">Improve Endurance</option>
              <option value="stay-active">Stay Active</option>
              <option value="increase-flexibility">Increase Flexibility</option>
              <option value="general-fitness">General Fitness</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              What's your experience level?
            </label>
            <div className="experience-options">
              {[
                { value: 'beginner', label: 'Beginner', desc: 'New to fitness' },
                { value: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
                { value: 'advanced', label: 'Advanced', desc: 'Regular training' },
              ].map((level) => (
                <button
                  key={level.value}
                  type="button"
                  className={`experience-button ${experienceLevel === level.value ? 'active' : ''}`}
                  onClick={() => setExperienceLevel(level.value)}
                >
                  <div className="experience-label">{level.label}</div>
                  <div className="experience-desc">{level.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="button-group">
            <button
              type="button"
              onClick={handleSkip}
              className="skip-button"
              disabled={loading}
            >
              Skip for now
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`submit-button ${loading ? 'loading' : ''}`}
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
