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
        if (!window.confirm('Delete this job? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await JobService.deleteJob(job._id);
            if (res.success) {
                // Notify parent to remove from list
                if (onDelete) {
                    onDelete(job._id);
                }
            } else {
                console.error('Failed to delete job');
                setIsDeleting(false);
            }
        } catch (error) {
            console.error('Error deleting job:', error);
            setIsDeleting(false);
        }
    };

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
            transition: 'transform 0.2s, box-shadow 0.2s',
            opacity: isDeleting ? 0.5 : 1,
            pointerEvents: isDeleting ? 'none' : 'auto'
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

            {/* Star and Delete buttons */}
            <div style={{
                position: 'absolute', top: '10px', left: '10px',
                display: 'flex', gap: '8px',
                zIndex: 10 // Ensure buttons are above other elements
            }}>
                <button
                    onClick={handleStarToggle}
                    title={isStarred ? "Remove from favorites" : "Add to favorites"}
                    style={{
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${isStarred ? '#ffd700' : 'rgba(255,255,255,0.2)'}`,
                        borderRadius: '4px',
                        padding: '8px 10px',
                        minWidth: '40px',
                        minHeight: '40px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    <Star
                        size={18}
                        fill={isStarred ? '#ffd700' : 'none'}
                        color={isStarred ? '#ffd700' : '#888'}
                        style={{ transition: 'all 0.2s' }}
                    />
                </button>

                <button
                    onClick={handleDelete}
                    title="Delete job"
                    style={{
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,51,51,0.3)',
                        borderRadius: '4px',
                        padding: '8px 10px',
                        minWidth: '40px',
                        minHeight: '40px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                >
                    <Trash2 size={18} color="#ff3333" style={{ transition: 'all 0.2s' }} />
                </button>
            </div>

            <h4 style={{
                color: '#fff', fontSize: '1rem', margin: 0,
                fontFamily: 'var(--font-sans)', fontWeight: '600',
                lineHeight: '1.4',
                paddingTop: '30px' // Space for larger star/delete buttons
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
