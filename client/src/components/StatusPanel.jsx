import { Play, Square, Activity, Clock, Crosshair, Zap, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';

const StatusPanel = ({ status, isHunting, onStart, onStop, onTrigger }) => {
    const [triggering, setTriggering] = useState(false);
    const [liveCountdown, setLiveCountdown] = useState('--:--:--');

    // Live countdown timer
    useEffect(() => {
        if (!status?.nextRunIn) {
            setLiveCountdown('--:--:--');
            return;
        }

        // Parse the initial time string (format: "2h 5m 10s" or "5m 10s" or "10s")
        const parseTimeString = (timeStr) => {
            if (!timeStr || timeStr === '--:--:--' || typeof timeStr !== 'string') return 0;

            // Check if it's already in 00:00:00 format
            if (timeStr.includes(':')) {
                const parts = timeStr.split(':').map(Number);
                if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
                if (parts.length === 2) return parts[0] * 60 + parts[1];
                return 0;
            }

            let totalSeconds = 0;
            const hoursMatch = timeStr.match(/(\d+)h/);
            if (hoursMatch) totalSeconds += parseInt(hoursMatch[1], 10) * 3600;

            const minutesMatch = timeStr.match(/(\d+)m/);
            if (minutesMatch) totalSeconds += parseInt(minutesMatch[1], 10) * 60;

            const secondsMatch = timeStr.match(/(\d+)s/);
            if (secondsMatch) totalSeconds += parseInt(secondsMatch[1], 10);

            return totalSeconds;
        };

        // Format seconds to HH:MM:SS
        const formatTime = (totalSeconds) => {
            if (totalSeconds <= 0) return '00:00:00';
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };

        let remainingSeconds = parseTimeString(status.nextRunIn);
        setLiveCountdown(formatTime(remainingSeconds));

        const interval = setInterval(() => {
            remainingSeconds -= 1;
            if (remainingSeconds < 0) {
                remainingSeconds = 0;
                clearInterval(interval);
            }
            setLiveCountdown(formatTime(remainingSeconds));
        }, 1000);

        return () => clearInterval(interval);
    }, [status?.nextRunIn]);

    const handleTrigger = async () => {
        setTriggering(true);
        await onTrigger();
        setTimeout(() => setTriggering(false), 2000); // Reset after 2s
    };

    if (!status) return (
        <div style={{
            height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-panel)', border: 'var(--glass-border)', borderRadius: '12px'
        }}>
            <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>CONNECTING TO SATELLITE...</p>
        </div>
    );

    return (
        <div className="status-hud">
            {/* HUD Header Decoration */}
            <div style={{
                position: 'absolute', top: 0, right: 0,
                padding: '5px 10px', background: 'rgba(255,255,255,0.05)',
                fontSize: '0.6rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)'
            }}>
                SYS.V2.0
            </div>

            {/* Stats Group */}
            <div style={{ display: 'flex', gap: '50px', flexWrap: 'wrap' }}>
                <div className="stat-item">
                    <Activity size={20} color={isHunting ? 'var(--primary-neon)' : '#444'} />
                    <span className="stat-value" style={{
                        color: isHunting ? 'var(--primary-neon)' : '#888',
                        textShadow: isHunting ? '0 0 10px var(--primary-neon)' : 'none'
                    }}>
                        {isHunting ? 'ONLINE' : 'IDLE'}
                    </span>
                    <span className="stat-label">System Status</span>
                </div>

                <div className="stat-item">
                    <Clock size={20} color={liveCountdown !== '--:--:--' ? 'var(--secondary-neon)' : '#444'} />
                    <span className="stat-value" style={{
                        color: 'var(--secondary-neon)',
                        fontVariantNumeric: 'tabular-nums'
                    }}>
                        {liveCountdown}
                    </span>
                    <span className="stat-label">Next Run</span>
                </div>

                <div className="stat-item">
                    <Crosshair size={20} color="#fff" />
                    <span className="stat-value">{status.urlsConfigured}</span>
                    <span className="stat-label">Active Targets</span>
                </div>
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex',
                gap: '15px',
                alignItems: 'center',
                borderLeft: '1px solid #333',
                paddingLeft: '30px',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={handleTrigger}
                    disabled={triggering}
                    className="btn-secondary"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        borderColor: triggering ? 'var(--primary-neon)' : '#444',
                        color: triggering ? 'var(--primary-neon)' : '#888'
                    }}
                    title="Run Immediate Test Scan"
                >
                    <Zap size={16} fill={triggering ? "currentColor" : "none"} />
                    {triggering ? "SCANNING..." : "TEST RUN"}
                </button>

                {isHunting ? (
                    <button className="btn-primary" onClick={onStop} style={{
                        borderColor: 'var(--neon-pink)', color: 'var(--neon-pink)', background: 'rgba(255,0,85,0.1)'
                    }}>
                        <Square size={16} fill="currentColor" style={{ marginRight: '8px' }} />
                        ABORT
                    </button>
                ) : (
                    <button className="btn-primary" onClick={onStart}>
                        <Play size={16} fill="currentColor" style={{ marginRight: '8px' }} />
                        ENGAGE
                    </button>
                )}
            </div>
        </div>
    );
};

export default StatusPanel;
