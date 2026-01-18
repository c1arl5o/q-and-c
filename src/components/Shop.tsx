import './Shop.css';

interface ShopProps {
  onViewChange: (view: 'signin' | 'onboarding' | 'home' | 'shop') => void;
}

export default function Shop({ onViewChange }: ShopProps) {
  return (
    <div className="shop-container">
      <button 
        className="back-button"
        onClick={() => onViewChange('home')}
        aria-label="Back to home"
      >
        ← Back
      </button>
      <div className="shop-content">
        <h1>Shop</h1>
        <p className="shop-message">The shop will appear here soon</p>
      </div>
    </div>
  );
}
