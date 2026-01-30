import { useState, useEffect } from 'react';
import { JobService } from '../services/api';
import JobCard from './JobCard';
import { ChevronDown, Edit2, Trash2, Building, Zap } from 'lucide-react';

const CompanyCard = ({ company, onDelete, onUpdate }) => {
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

    const handleMarkViewed = (id) => {
        setJobs(prev => prev.map(job =>
            job._id === id ? { ...job, isFresh: false } : job
        ));
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
        <div className="company-card" style={{
            background: 'rgba(10, 10, 10, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            position: 'relative'
        }}>
            {/* Decoration Line */}
            <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px',
                background: company.newJobsCount > 0 ? 'var(--neon-pink)' : 'var(--glass-border)',
                boxShadow: company.newJobsCount > 0 ? '0 0 10px var(--neon-pink)' : 'none'
            }}></div>

            {/* Header Section */}
            <div className="card-header" style={{
                padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: expanded ? 'rgba(255,255,255,0.02)' : 'transparent'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                    {/* Logo Plate */}
                    <div className="company-logo" style={{
                        width: '70px', height: '70px',
                        borderRadius: '16px',
                        background: '#050505',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                    }}>
                        {company.logoUrl
                            ? <img src={company.logoUrl} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <Building size={32} color="#444" />
                        }
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
                                <div style={{
                                    background: 'var(--neon-pink)', color: '#fff',
                                    padding: '2px 8px', borderRadius: '4px',
                                    fontSize: '0.65rem', fontWeight: 'bold',
                                    fontFamily: 'var(--font-mono)',
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    boxShadow: '0 0 10px rgba(255, 0, 85, 0.4)'
                                }}>
                                    <Zap size={10} fill="currentColor" /> {company.newJobsCount} NEW
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
                                <JobCard key={job._id} job={job} onMarkViewed={handleMarkViewed} compact={true} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyCard;
