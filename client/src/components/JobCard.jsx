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
                {job.employmentType && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        • {job.employmentType}
                    </span>
                )}
                {job.experienceLevel && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        • {job.experienceLevel}
                    </span>
                )}
                {job.salary && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        • 💰 {job.salary}
                    </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                    <Clock size={12} /> {dateStr}
                </span>
            </div>

            {job.description && (
                <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#aaa', 
                    fontFamily: 'var(--font-sans)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.4'
                }}>
                    {job.description}
                </div>
            )}

            {job.matchReason && (
                <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--primary-neon)',
                    fontFamily: 'var(--font-mono)',
                    opacity: 0.8,
                    marginTop: '4px'
                }}>
                    💡 {job.matchReason}
                </div>
            )}

            <div style={{ marginTop: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {job.relevanceScore > 0 && (
                        <span style={{ 
                            fontSize: '0.75rem', 
                            fontFamily: 'var(--font-mono)',
                            color: job.relevanceScore >= 70 ? '#10b981' : '#f59e0b',
                            background: job.relevanceScore >= 70 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: `1px solid ${job.relevanceScore >= 70 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                            Score: {job.relevanceScore}
                        </span>
                    )}
                    {job.source !== 'career_page' && job.source && (
                        <span style={{ 
                            fontSize: '0.7rem', 
                            color: '#888',
                            fontFamily: 'var(--font-mono)',
                            textTransform: 'uppercase'
                        }}>
                            src: {job.source}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
    </div>
    );
};

export default JobCard;
