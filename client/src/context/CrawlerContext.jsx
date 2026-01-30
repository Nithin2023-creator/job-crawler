import { createContext, useState, useEffect, useContext } from 'react';

const CrawlerContext = createContext();

export const CrawlerProvider = ({ children }) => {
    const [config, setConfig] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHunting, setIsHunting] = useState(false);

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
        // Poll status every 30 seconds
        const interval = setInterval(() => {
            // Only refresh if not in sleep mode (save bandwidth)
            // Actually we might want updates IN sleep mode to show status?
            // Let's poll gently.
            fetch('/api/hunt/status')
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setStatus(data.data);
                        setIsHunting(data.data.isActive);
                    }
                })
                .catch(console.error);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

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
