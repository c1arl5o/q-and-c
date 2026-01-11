import './Add.css';

interface AddProps {
  onViewChange: (view: 'signin' | 'onboarding' | 'home' | 'shop' | 'add') => void;
}

export default function Add({ onViewChange }: AddProps) {
  return (
    <div className="add-container">
      <p>This is the add page</p>
    </div>
  );
}
