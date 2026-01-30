import { Inbox, Search, AlertCircle, Plus } from 'lucide-react';

const EmptyState = ({
    type = 'default',
    title,
    message,
    action,
    onAction
}) => {
    const icons = {
        default: Inbox,
        search: Search,
        error: AlertCircle,
        add: Plus,
    };

    const Icon = icons[type] || icons.default;

    const defaultTitles = {
        default: 'Nothing here yet',
        search: 'No results found',
        error: 'Something went wrong',
        add: 'Get started',
    };

    const defaultMessages = {
        default: 'Start by adding your first item',
        search: 'Try adjusting your search criteria',
        error: 'Please try again later',
        add: 'Click the button below to begin',
    };

    return (
        <div className="empty-state animate-fade-scale">
            <div style={{
                width: '80px',
                height: '80px',
                margin: '0 auto var(--spacing-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'rgba(0, 243, 255, 0.1)',
                border: '2px dashed rgba(0, 243, 255, 0.3)',
            }}>
                <Icon size={40} color="var(--primary-neon)" />
            </div>

            <h3 style={{
                color: 'var(--text-secondary)',
                marginBottom: 'var(--spacing-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--font-lg)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
            }}>
                {title || defaultTitles[type]}
            </h3>

            <p style={{
                color: 'var(--text-dim)',
                fontSize: 'var(--font-sm)',
                marginBottom: action ? 'var(--spacing-lg)' : 0,
                maxWidth: '400px',
                margin: '0 auto',
            }}>
                {message || defaultMessages[type]}
            </p>

            {action && onAction && (
                <button
                    className="btn-primary"
                    onClick={onAction}
                    style={{
                        marginTop: 'var(--spacing-lg)',
                    }}
                >
                    {action}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
