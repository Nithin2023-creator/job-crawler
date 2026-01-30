import { useEffect, useState } from 'react';
import { useCrawler } from '../context/CrawlerContext';
import StatusPanel from '../components/StatusPanel';
import CompanyCard from '../components/CompanyCard';
import AddCompanyModal from '../components/AddCompanyModal';
import SleepScreen from '../components/SleepScreen';
import { CompanyService, SettingsService } from '../services/api';
import '../styles/dashboard.css';

const Dashboard = () => {
    const { status, loading, isHunting, startHunt, stopHunt, triggerHunt, lastCrawlTime } = useCrawler();
    const [inSleepMode, setInSleepMode] = useState(false);

    // Data State
    const [companies, setCompanies] = useState([]);
    const [settings, setSettings] = useState({ defaultTags: [], schedule: '' });
    const [loadingData, setLoadingData] = useState(true);

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [showSettings, setShowSettings] = useState(false);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const [companiesData, settingsData] = await Promise.all([
                CompanyService.getAll(),
                SettingsService.get()
            ]);
            setCompanies(companiesData);
            setSettings(settingsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Auto-refresh companies when crawl completes
    useEffect(() => {
        if (lastCrawlTime) {
            console.log('📊 Refreshing companies after crawl completion...');
            fetchData();
        }
    }, [lastCrawlTime]);

    const handleOpenAdd = () => {
        setEditingCompany(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (company) => {
        setEditingCompany(company);
        setIsModalOpen(true);
    };

    const handleSaveCompany = async (companyData) => {
        try {
            if (editingCompany) {
                // Update
                const updated = await CompanyService.update(editingCompany._id, companyData);
                setCompanies(prev => prev.map(c => c._id === editingCompany._id ? { ...updated, newJobsCount: c.newJobsCount } : c));
            } else {
                // Create
                const newCompany = await CompanyService.create(companyData);
                setCompanies(prev => [...prev, { ...newCompany, newJobsCount: 0 }]);
            }
        } catch (error) {
            console.error("Failed to save company", error);
        }
    };

    const handleDeleteCompany = async (id) => {
        if (!window.confirm("Delete this company and its configuration?")) return;
        try {
            await CompanyService.delete(id);
            setCompanies(prev => prev.filter(c => c._id !== id));
        } catch (error) {
            console.error("Failed to delete company", error);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        try {
            const tagsArray = typeof settings.defaultTags === 'string'
                ? settings.defaultTags.split(',').map(t => t.trim()).filter(Boolean)
                : settings.defaultTags;

            await SettingsService.update({
                defaultTags: tagsArray,
                schedule: settings.schedule
            });
            alert('Settings Saved!');
            setShowSettings(false);
            fetchData();
        } catch (error) {
            console.error("Failed to update settings", error);
        }
    };

    if (loading) return <div className="container">Initializing System...</div>;

    if (inSleepMode) {
        return <SleepScreen onWake={() => setInSleepMode(false)} nextRunTime={status?.nextRunIn} />;
    }

    return (
        <div className="container main-view">
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="title-neon" style={{ fontSize: '2.5rem' }}>NIGHT CRAWLER</h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '5px' }}>COMPANY-CENTRIC JOB HUNTER // V2.0</p>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="btn-secondary" onClick={() => setShowSettings(!showSettings)}>
                        {showSettings ? 'CLOSE SETTINGS' : 'GLOBAL SETTINGS'}
                    </button>
                    {isHunting && (
                        <button className="btn-primary" onClick={() => setInSleepMode(true)}>
                            ENTER SLEEP MODE
                        </button>
                    )}
                </div>
            </header>

            <StatusPanel
                status={status}
                isHunting={isHunting}
                onStart={startHunt}
                onStop={stopHunt}
                onTrigger={triggerHunt}
            />

            {/* Global Settings Panel */}
            {showSettings && (
                <div className="card-neon" style={{ marginBottom: '30px', padding: '20px', border: '1px dashed var(--neon-blue)' }}>
                    <h3 style={{ marginTop: 0, color: 'var(--neon-blue)' }}>Global Configuration</h3>
                    <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Default Search Tags (Comma separated)</label>
                            <input
                                type="text"
                                value={Array.isArray(settings.defaultTags) ? settings.defaultTags.join(', ') : settings.defaultTags}
                                onChange={(e) => setSettings({ ...settings, defaultTags: e.target.value })}
                                style={{ width: '100%', padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Cron Schedule</label>
                            <input
                                type="text"
                                value={settings.schedule}
                                onChange={(e) => setSettings({ ...settings, schedule: e.target.value })}
                                style={{ width: '100%', padding: '10px', background: '#111', border: '1px solid #333', color: '#fff' }}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>SAVE SETTINGS</button>
                    </form>
                </div>
            )}

            {/* Companies Grid */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="title-neon">Followed Companies</h2>
                <button className="btn-primary" onClick={handleOpenAdd}>
                    + ADD COMPANY
                </button>
            </div>

            {loadingData ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>Loading Companies...</div>
            ) : companies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', border: '1px dashed #555', borderRadius: '10px' }}>
                    <h3>No companies tracked yet.</h3>
                    <p style={{ color: '#888' }}>Add a company to start hunting.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {companies.map(company => (
                        <CompanyCard
                            key={company._id}
                            company={company}
                            onDelete={handleDeleteCompany}
                            onUpdate={handleOpenEdit}
                            refreshTrigger={lastCrawlTime}
                        />
                    ))}
                </div>
            )}

            <AddCompanyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCompany}
                initialData={editingCompany}
            />
        </div>
    );
};

export default Dashboard;
