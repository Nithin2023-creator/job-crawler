import { createContext, useState, useEffect, useContext } from 'react';

const CrawlerContext = createContext();

export const CrawlerProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHunting, setIsHunting] = useState(false);
    const [lastCrawlTime, setLastCrawlTime] = useState(null);

    // Fetch initial data
    const refreshData = async () => {
        try {
            const [configRes, statusRes] = await Promise.all([
                fetch('/api/config'),
                fetch('/api/hunt/status')
            ]);

            const configData = await configRes.json();
            const statusData = await statusRes.json();

            if (configData.success) setConfig(configData.data);
            if (statusData.success) {
                setStatus(statusData.data);
                setIsHunting(statusData.data.isActive);
            }
        } catch (error) {
            console.error('Failed to fetch crawler data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
        // Poll for status updates every 30 seconds

        const interval = setInterval(() => {
            // Use fetch directly to avoid creating new intervals on state change
            fetch('/api/hunt/status')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        const newStatus = data.data;

                        // Use functional update to get previous status without dependency
                        setStatus(prevStatus => {
                            // Detect crawl completion: status was active, now inactive with lastRunTime updated
                            if (prevStatus && prevStatus.isActive && !newStatus.isActive && newStatus.lastRunTime) {
                                console.log('🔔 Crawl completed! Triggering refresh...');
                                setLastCrawlTime(Date.now());
                            }
                            return newStatus;
                        });

                        setIsHunting(newStatus.isActive);
                    }
                })
                .catch(console.error);
        }, 30000);

        return () => clearInterval(interval);
    }, []); // Empty dependency array - only run once on mount

    const updateConfig = async (newConfig) => {
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
            const data = await res.json();
            if (data.success) {
                setConfig(data.data);
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const startHunt = async () => {
        try {
            const res = await fetch('/api/hunt/start', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setIsHunting(true);
                refreshData();
                return true;
            }
        } catch (e) {
            console.error(e);
        }
        return false;
    };

    const stopHunt = async () => {
        try {
            const res = await fetch('/api/hunt/stop', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setIsHunting(false);
                refreshData();
                return true;
            }
        } catch (e) {
            console.error(e);
        }
        return false;
    };

    const triggerHunt = async () => {
        try {
            const res = await fetch('/api/hunt/trigger', { method: 'POST' });
            const data = await res.json();
            return data.success;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    return (
        <CrawlerContext.Provider value={{
            config,
            status,
            loading,
            isHunting,
            lastCrawlTime,
            refreshData,
            updateConfig,
            startHunt,
            stopHunt,
            triggerHunt
        }}>
            {children}
        </CrawlerContext.Provider>
    );
};

export const useCrawler = () => useContext(CrawlerContext);
