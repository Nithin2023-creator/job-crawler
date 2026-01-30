import { Plus } from 'lucide-react';

const FloatingActionButton = ({ onClick, icon: Icon = Plus, label = 'Add' }) => {
    return (
        <button
            className="fab hover-lift"
            onClick={onClick}
            aria-label={label}
            title={label}
        >
            <Icon size={24} strokeWidth={2.5} />
        </button>
    );
};

export default FloatingActionButton;
