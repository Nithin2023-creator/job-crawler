import { Play, Square, Activity, Clock, Crosshair, Zap, Cpu } from 'lucide-react';
import { useState } from 'react';

const StatusPanel = ({ status, isHunting, onStart, onStop, onTrigger }) => {
    const [triggering, setTriggering] = useState(false);

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
            <div style={{ display: 'flex', gap: '50px' }}>
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
                    <Clock size={20} color={status.nextRunIn ? 'var(--secondary-neon)' : '#444'} />
                    <span className="stat-value" style={{ color: 'var(--secondary-neon)' }}>
                        {status.nextRunIn || '--:--:--'}
                    </span>
                    <span className="stat-label">T-Minus Next Run</span>
                </div>

                <div className="stat-item">
                    <Crosshair size={20} color="#fff" />
                    <span className="stat-value">{status.urlsConfigured}</span>
                    <span className="stat-label">Active Targets</span>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', borderLeft: '1px solid #333', paddingLeft: '30px' }}>
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
                        ABORT SEQUENCE
                    </button>
                ) : (
                    <button className="btn-primary" onClick={onStart}>
                        <Play size={16} fill="currentColor" style={{ marginRight: '8px' }} />
                        INITIATE SEQUENCE
                    </button>
                )}
            </div>
        </div>
    );
};

export default StatusPanel;
