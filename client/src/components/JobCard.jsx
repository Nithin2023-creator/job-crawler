import { ExternalLink, Calendar, MapPin, Building, Eye, Clock } from 'lucide-react';

const JobCard = ({ job, onMarkViewed, compact = false }) => {
    // Format date as "YY.MM.DD HH:MM"
    const d = new Date(job.detectedAt);
    const dateStr = `${d.getFullYear().toString().substr(-2)}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${job.isFresh ? 'var(--primary-neon)' : '#333'}`,
            padding: compact ? '15px' : '20px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s'
        }}
            className="animate-float"
        >
            {job.isFresh && (
                <div style={{
                    position: 'absolute', top: 0, right: 0,
                    background: 'var(--primary-neon)', color: '#000',
                    fontSize: '0.6rem', fontWeight: 'bold',
                    padding: '2px 8px', fontFamily: 'var(--font-mono)',
                    borderBottomLeftRadius: '6px'
                }}>
                    NEW
                </div>
            )}

            <h4 style={{
                color: '#fff', fontSize: '1rem', margin: 0,
                fontFamily: 'var(--font-sans)', fontWeight: '600',
                lineHeight: '1.4'
            }}>
                {job.title}
            </h4>

            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '12px',
                color: 'var(--text-dim)', fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)'
            }}>
                {!compact && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={12} /> {job.company}
                    </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} /> {job.location || 'Remote'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                    <Clock size={12} /> {dateStr}
                </span>
            </div>

            <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {job.isFresh && (
                    <button
                        title="Mark as Seen"
                        onClick={() => onMarkViewed(job._id)}
                        style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                    >
                        <Eye size={16} />
                    </button>
                )}
                <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: 'var(--primary-neon)', textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        fontSize: '0.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)'
                    }}
                >
                    APPLY <ExternalLink size={14} />
                </a>
            </div>
        </div>
    );
};

export default JobCard;
