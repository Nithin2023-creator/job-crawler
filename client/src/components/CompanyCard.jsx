import { useState, useEffect } from 'react';
import { JobService } from '../services/api';
import JobCard from './JobCard';
import { ChevronDown, Edit2, Trash2, Building, Zap } from 'lucide-react';

const CompanyCard = ({ company, onDelete, onUpdate, refreshTrigger }) => {
    const [expanded, setExpanded] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [jobsFetched, setJobsFetched] = useState(false);

    const toggleExpand = () => setExpanded(!expanded);

    useEffect(() => {
        if (expanded && !jobsFetched) {
            fetchJobs();
        }
    }, [expanded]);

    // Auto-refresh jobs when crawl completes (only if expanded)
    useEffect(() => {
        if (refreshTrigger && expanded) {
            console.log(`🔄 Auto-refreshing jobs for ${company.name}...`);
            setJobsFetched(false); // Reset flag to force re-fetch
            fetchJobs();
        }
    }, [refreshTrigger]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await JobService.getByCompany(company._id);
            if (res.success) {
                setJobs(res.data.jobs);
            }
            setJobsFetched(true);
        } catch (error) {
            console.error("Failed to fetch jobs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkViewed = async (id) => {
        // Optimistic update
        setJobs(prev => prev.map(job =>
            job._id === id ? { ...job, isFresh: false } : job
        ));

        try {
            const res = await JobService.markViewed(id);
            if (!res.success) {
                // Rollback on API error
                setJobs(prev => prev.map(job =>
                    job._id === id ? { ...job, isFresh: true } : job
                ));
                console.error('Failed to mark job as viewed:', res);
            }
        } catch (error) {
            // Rollback on network error
            setJobs(prev => prev.map(job =>
                job._id === id ? { ...job, isFresh: true } : job
            ));
            console.error('Error marking job as viewed:', error);
        }
    };

    const handleJobDelete = (id) => {
        setJobs(prev => prev.filter(job => job._id !== id));
    };

    const tagsDisplay = (company.customTags && company.customTags.length > 0)
        ? company.customTags.map((tag, idx) => (
            <span key={idx} style={{
                background: 'rgba(0, 243, 255, 0.1)',
                border: '1px solid rgba(0, 243, 255, 0.2)',
                color: 'var(--primary-neon)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontFamily: 'var(--font-mono)'
            }}>
                {tag}
            </span>
        ))
        : <span style={{ fontStyle: 'italic', opacity: 0.5 }}>GLOBAL DEFAULTS</span>;

    return (
        <div className="company-card hover-lift" style={{
            background: 'rgba(10, 10, 10, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: company.newJobsCount > 0
                ? '1px solid rgba(255, 0, 85, 0.2)'
                : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            transition: 'all var(--transition-base)',
            position: 'relative',
            boxShadow: company.newJobsCount > 0
                ? '0 0 20px rgba(255, 0, 85, 0.15)'
                : 'var(--shadow-card)'
        }}>
            {/* Decoration Line */}
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px',
                background: company.newJobsCount > 0
                    ? 'linear-gradient(180deg, var(--neon-pink), var(--danger-red))'
                    : 'linear-gradient(180deg, var(--primary-neon), var(--secondary-neon))',
                boxShadow: company.newJobsCount > 0
                    ? '0 0 15px rgba(255, 0, 85, 0.5)'
                    : '0 0 10px rgba(0, 243, 255, 0.3)',
                opacity: company.newJobsCount > 0 ? 1 : 0.5,
                animation: company.newJobsCount > 0 ? 'pulse-glow 2s ease-in-out infinite' : 'none'
            }}></div>

            {/* Header Section */}
            <div className="card-header mobile-stack" style={{
                padding: 'var(--spacing-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: expanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                gap: 'var(--spacing-md)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', flex: 1 }}>
                    {/* Logo Plate */}
                    <div className="company-logo" style={{
                        width: '70px',
                        height: '70px',
                        minWidth: '70px',
                        borderRadius: 'var(--radius-xl)',
                        background: company.logoUrl
                            ? '#050505'
                            : 'linear-gradient(135deg, var(--primary-neon) 0%, var(--secondary-neon) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        border: company.logoUrl
                            ? '1px solid rgba(255,255,255,0.1)'
                            : 'none',
                        boxShadow: company.logoUrl
                            ? 'inset 0 0 20px rgba(0,0,0,0.8)'
                            : '0 4px 15px rgba(0, 243, 255, 0.3)',
                        transition: 'all var(--transition-base)'
                    }}>
                        {company.logoUrl ? (
                            <img
                                src={company.logoUrl}
                                alt={company.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <span style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                fontFamily: 'var(--font-mono)',
                                color: '#000',
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}>
                                {company.name[0].toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h3 style={{
                                margin: 0, fontSize: '1.4rem', color: '#fff',
                                fontFamily: 'var(--font-sans)', fontWeight: '700',
                                letterSpacing: '-0.5px'
                            }}>
                                {company.name}
                            </h3>
                            {company.newJobsCount > 0 && (
                                <div className="animate-pulse-glow" style={{
                                    background: 'linear-gradient(135deg, var(--neon-pink), var(--danger-red))',
                                    color: '#fff',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    fontFamily: 'var(--font-mono)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    boxShadow: '0 0 15px rgba(255, 0, 85, 0.5), 0 4px 10px rgba(0, 0, 0, 0.3)',
                                    letterSpacing: '0.5px'
                                }}>
                                    <Zap size={12} fill="currentColor" strokeWidth={2.5} />
                                    {company.newJobsCount} NEW
                                </div>
                            )}
                        </div>

                        {/* Metadata Grid */}
                        <div style={{
                            display: 'flex', gap: '20px', marginTop: '10px',
                            fontSize: '0.8rem', color: '#888'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5 }}>Targets</span>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{tagsDisplay}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        onClick={() => onUpdate(company)}
                        className="btn-icon"
                        title="Configure Protocol"
                        style={{ color: '#666', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <Edit2 size={16} />
                    </button>

                    <button
                        onClick={() => onDelete(company._id)}
                        className="btn-icon delete"
                        title="Terminate Protocol"
                        style={{ color: '#ff3333', border: '1px solid rgba(255,51,51,0.2)' }}
                    >
                        <Trash2 size={16} />
                    </button>

                    <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 10px' }}></div>

                    <button
                        onClick={toggleExpand}
                        className="btn-icon"
                        style={{
                            background: expanded ? 'var(--primary-neon)' : 'rgba(255,255,255,0.05)',
                            color: expanded ? '#000' : '#fff',
                            width: '36px', height: '36px',
                            transition: 'all 0.3s ease',
                            border: expanded ? 'none' : '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <ChevronDown size={20} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                    </button>
                </div>
            </div>

            {/* Accordion Content */}
            <div style={{
                maxHeight: expanded ? '1000px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.5s ease-in-out',
                background: 'rgba(0,0,0,0.3)'
            }}>
                <div style={{ padding: '30px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary-neon)', borderRadius: '50%', boxShadow: '0 0 10px var(--primary-neon)' }}></div>
                            <h4 style={{ margin: 0, color: '#fff', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>
                                INTELLIGENCE FEED
                            </h4>
                        </div>
                        <button
                            onClick={fetchJobs}
                            style={{
                                background: 'transparent', border: '1px solid var(--primary-neon)', color: 'var(--primary-neon)',
                                padding: '5px 15px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', fontFamily: 'var(--font-mono)'
                            }}
                        >
                            REFRESH FEED
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontFamily: 'var(--font-mono)' }}>decryption_in_progress...</div>
                    ) : jobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#444', fontStyle: 'italic', border: '1px dashed #333', borderRadius: '8px' }}>
                            NO SIGNAL DETECTED
                        </div>
                    ) : (
                        <div className="job-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                            {jobs.map(job => (
                                <JobCard
                                    key={job._id}
                                    job={job}
                                    onMarkViewed={handleMarkViewed}
                                    onDelete={handleJobDelete}
                                    compact={true}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyCard;
