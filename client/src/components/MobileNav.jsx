import { Home, Building2, Settings, Bell } from 'lucide-react';
import { useState } from 'react';

const MobileNav = ({ newJobsCount = 0 }) => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const navItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: Home,
        },
        {
            id: 'companies',
            label: 'Companies',
            icon: Building2,
        },
        {
            id: 'notifications',
            label: 'Alerts',
            icon: Bell,
            badge: newJobsCount,
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
        },
    ];

    const handleNavClick = (id) => {
        setActiveTab(id);
        // Scroll to top on navigation
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav className="mobile-nav">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                    <button
                        key={item.id}
                        className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleNavClick(item.id)}
                        aria-label={item.label}
                    >
                        <div style={{ position: 'relative' }}>
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            {item.badge > 0 && (
                                <span className="nav-badge">{item.badge}</span>
                            )}
                        </div>
                        <span className="mobile-nav-label">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default MobileNav;
