import { ExternalLink, Calendar, MapPin, Building, Eye, Clock, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { JobService } from '../services/api';

const JobCard = ({ job, onMarkViewed, onDelete, compact = false }) => {
    const [isStarred, setIsStarred] = useState(job.isStarred || false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Format date as "YY.MM.DD HH:MM"
    const d = new Date(job.detectedAt);
    const dateStr = `${d.getFullYear().toString().substr(-2)}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    const handleStarToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling

        console.log('⭐ Star clicked! Current state:', isStarred);

        const newStarState = !isStarred;
        setIsStarred(newStarState); // Optimistic update

        try {
            console.log(`📡 Calling API to ${newStarState ? 'star' : 'unstar'} job...`);
            const res = await JobService.starJob(job._id, newStarState);
            console.log('✅ API response:', res);

            if (!res.success) {
                setIsStarred(!newStarState); // Rollback on error
                console.error('❌ Failed to star job:', res);
            }
        } catch (error) {
            setIsStarred(!newStarState); // Rollback on error
            console.error('❌ Error starring job:', error);
        }
    };

    const handleDelete = async () => {
        // No confirmation - doing hacking animation instead
        setIsDeleting(true);

        // Wait for animation (500ms match CSS)
        setTimeout(async () => {
            try {
                const res = await JobService.deleteJob(job._id);
                if (res.success) {
                    if (onDelete) onDelete(job._id);
                } else {
                    console.error('Failed to delete job');
                    setIsDeleting(false); // Revert if failed
                }
            } catch (error) {
                console.error('Error deleting job:', error);
                setIsDeleting(false); // Revert if failed
            }
        }, 500);
    };

    return (
        <div className={`hover-lift ${isDeleting ? 'animate-delete' : ''}`} style={{
            background: job.isFresh
                ? 'rgba(255, 0, 85, 0.05)'
                : 'rgba(255,255,255,0.03)',
            border: job.isFresh
                ? '1px solid rgba(255, 0, 85, 0.3)'
                : '1px solid rgba(255, 255, 255, 0.08)',
            padding: compact ? 'var(--spacing-md)' : 'var(--spacing-lg)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-sm)',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all var(--transition-base)',
            opacity: 1, // Opacity handled by animation
            boxShadow: job.isFresh
                ? '0 0 20px rgba(255, 0, 85, 0.1)'
                : 'none'
        }}>
            {/* NEW Badge */}
            {job.isFresh && (
                <div className="animate-pulse-glow" style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'linear-gradient(135deg, var(--neon-pink), var(--danger-red))',
                    color: '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    padding: '6px 14px',
                    fontFamily: 'var(--font-mono)',
                    borderBottomLeftRadius: 'var(--radius-lg)',
                    boxShadow: '0 0 20px rgba(255, 0, 85, 0.6), 0 4px 10px rgba(0, 0, 0, 0.3)',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    ⚡ NEW
                </div>
            )}

            {/* Star and Delete buttons */}
            <div style={{
                position: 'absolute',
                top: 'var(--spacing-sm)',
                left: 'var(--spacing-sm)',
                display: 'flex',
                gap: '6px',
                zIndex: 10
            }}>
                <button
                    onClick={handleStarToggle}
                    title={isStarred ? "Remove from favorites" : "Add to favorites"}
                    className="btn-icon"
                    style={{
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: `1px solid ${isStarred ? '#ffd700' : 'rgba(255,255,255,0.2)'}`,
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px',
                        minWidth: '36px',
                        minHeight: '36px',
                    }}
                >
                    <Star
                        size={16}
                        fill={isStarred ? '#ffd700' : 'none'}
                        color={isStarred ? '#ffd700' : '#888'}
                        style={{ transition: 'all var(--transition-base)' }}
                    />
                </button>

                <button
                    onClick={handleDelete}
                    title="Delete job"
                    className="btn-icon"
                    style={{
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,51,51,0.3)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px',
                        minWidth: '36px',
                        minHeight: '36px',
                    }}
                >
                    <Trash2 size={16} color="#ff3333" />
                </button>
            </div>

            {/* Job Title */}
            <h4 style={{
                color: 'var(--text-main)',
                fontSize: compact ? 'var(--font-base)' : 'var(--font-lg)',
                margin: 0,
                fontFamily: 'var(--font-sans)',
                fontWeight: '600',
                lineHeight: '1.4',
                paddingTop: '40px', // Space for star/delete buttons
                paddingRight: job.isFresh ? '60px' : '0' // Space for NEW badge
            }}>
                {job.title}
            </h4>

            {/* Job Metadata */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--spacing-sm)',
                color: 'var(--text-dim)',
                fontSize: 'var(--font-xs)',
                fontFamily: 'var(--font-mono)',
                alignItems: 'center'
            }}>
                {!compact && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={12} />
                        {job.company}
                    </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} />
                    {job.location || 'Remote'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.7 }}>
                    <Clock size={12} />
                    {dateStr}
                </span>
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: 'var(--spacing-sm)',
                marginTop: 'var(--spacing-sm)',
            }}>
                {job.isFresh && (
                    <button
                        onClick={() => onMarkViewed(job._id)}
                        className="btn-secondary"
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            fontSize: 'var(--font-xs)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        <Eye size={14} />
                        Mark Seen
                    </button>
                )}
                <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{
                        flex: job.isFresh ? 2 : 1,
                        padding: '10px 16px',
                        fontSize: 'var(--font-xs)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}
                >
                    Apply Now
                    <ExternalLink size={14} />
                </a>
            </div>
        </div>
    );
};

export default JobCard;
