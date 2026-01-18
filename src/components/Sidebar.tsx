import './Sidebar.css';

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export default function Sidebar({ isOpen, onClose, navItems }: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className={`nav-item ${item.active ? 'active' : ''}`}
              onClick={item.onClick}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="overlay" 
          onClick={onClose}
        ></div>
      )}
    </>
  );
}
