import { useEffect, useState } from 'react';
import { useCrawler } from '../context/CrawlerContext';
import StatusPanel from '../components/StatusPanel';
import CompanyCard from '../components/CompanyCard';
import AddCompanyModal from '../components/AddCompanyModal';
import SleepScreen from '../components/SleepScreen';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { ToastContainer, showToast } from '../components/Toast';
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
        const toastId = showToast.loading(editingCompany ? 'Updating company...' : 'Adding company...');
        try {
            if (editingCompany) {
                // Update
                const updated = await CompanyService.update(editingCompany._id, companyData);
                setCompanies(prev => prev.map(c => c._id === editingCompany._id ? { ...updated, newJobsCount: c.newJobsCount } : c));
                showToast.dismiss(toastId);
                showToast.success('Company updated successfully!');
            } else {
                // Create
                const newCompany = await CompanyService.create(companyData);
                setCompanies(prev => [...prev, { ...newCompany, newJobsCount: 0 }]);
                showToast.dismiss(toastId);
                showToast.success('Company added successfully!');
            }
        } catch (error) {
            showToast.dismiss(toastId);
            showToast.error('Failed to save company. Please try again.');
            console.error("Failed to save company", error);
        }
    };

    const handleDeleteCompany = async (id) => {
        if (!window.confirm("Delete this company and its configuration?")) return;
        const toastId = showToast.loading('Deleting company...');
        try {
            await CompanyService.delete(id);
            setCompanies(prev => prev.filter(c => c._id !== id));
            showToast.dismiss(toastId);
            showToast.success('Company deleted successfully!');
        } catch (error) {
            showToast.dismiss(toastId);
            showToast.error('Failed to delete company. Please try again.');
            console.error("Failed to delete company", error);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        const toastId = showToast.loading('Saving settings...');
        try {
            const tagsArray = typeof settings.defaultTags === 'string'
                ? settings.defaultTags.split(',').map(t => t.trim()).filter(Boolean)
                : settings.defaultTags;

            await SettingsService.update({
                defaultTags: tagsArray,
                schedule: settings.schedule
            });
            showToast.dismiss(toastId);
            showToast.success('Settings saved successfully!');
            setShowSettings(false);
            fetchData();
        } catch (error) {
            showToast.dismiss(toastId);
            showToast.error('Failed to save settings. Please try again.');
            console.error("Failed to update settings", error);
        }
    };


    if (loading) {
        return (
            <div className="container">
                <div className="loading-container">
                    <div className="loading-spinner" />
                    <p>INITIALIZING SYSTEM...</p>
                </div>
            </div>
        );
    }

    if (inSleepMode) {
        return <SleepScreen onWake={() => setInSleepMode(false)} nextRunTime={status?.nextRunIn} />;
    }

    return (
        <>
            <ToastContainer />
            <div className="container main-view" style={{ paddingBottom: 'var(--spacing-xl)' }}>
                <header className="dashboard-header">
                    <div>
                        <h1 className="title-neon">NIGHT CRAWLER</h1>
                        <p style={{ color: 'var(--text-dim)', marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)' }}>
                            COMPANY-CENTRIC JOB HUNTER // V2.0
                        </p>
                    </div>

                    <div className="header-actions" style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                        <button className="btn-secondary" onClick={() => setShowSettings(!showSettings)}>
                            {showSettings ? 'CLOSE' : 'SETTINGS'}
                        </button>
                        {isHunting && (
                            <button className="btn-primary" onClick={() => setInSleepMode(true)}>
                                SLEEP MODE
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
                    <div className="settings-panel">
                        <h3>GLOBAL CONFIGURATION</h3>
                        <form onSubmit={handleUpdateSettings} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label>Default Search Tags (Comma separated)</label>
                                <input
                                    type="text"
                                    value={Array.isArray(settings.defaultTags) ? settings.defaultTags.join(', ') : settings.defaultTags}
                                    onChange={(e) => setSettings({ ...settings, defaultTags: e.target.value })}
                                    placeholder="e.g. React, Node.js, Full Stack"
                                />
                            </div>
                            <div>
                                <label>Cron Schedule</label>
                                <input
                                    type="text"
                                    value={settings.schedule}
                                    onChange={(e) => setSettings({ ...settings, schedule: e.target.value })}
                                    placeholder="e.g. 0 */6 * * *"
                                />
                            </div>
                            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>SAVE SETTINGS</button>
                        </form>
                    </div>
                )}

                {/* Companies Grid */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                    <h2 className="title-neon" style={{ margin: 0 }}>Companies</h2>
                    <button className="btn-primary" onClick={handleOpenAdd}>
                        + ADD
                    </button>
                </div>

                {loadingData ? (
                    <LoadingSkeleton type="company" count={3} />
                ) : companies.length === 0 ? (
                    <EmptyState
                        type="add"
                        title="No Companies Tracked"
                        message="Start by adding companies you're interested in. We'll hunt for jobs automatically."
                        action="+ ADD YOUR FIRST COMPANY"
                        onAction={handleOpenAdd}
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                        {companies.map((company, index) => (
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
        </>
    );
};

export default Dashboard;
