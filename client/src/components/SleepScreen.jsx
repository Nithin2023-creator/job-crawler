import { useEffect, useRef } from 'react';
import { Radar } from 'lucide-react';

const SleepScreen = ({ onWake, nextRunTime }) => {
    const canvasRef = useRef(null);

    // Matrix Rain Effect
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = '0123456789ABCDEF';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#0F0'; // Green for classic matrix, or maybe Cyan for our theme?
            // Let's go Cyan
            ctx.fillStyle = '#00f3ff';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="sleep-screen" onClick={onWake} style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: '#000', color: 'var(--primary-neon)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, cursor: 'pointer', overflow: 'hidden'
        }}>
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, opacity: 0.2 }} />

            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    border: '1px solid var(--primary-neon)', borderRadius: '50%',
                    padding: '40px', marginBottom: '30px',
                    boxShadow: '0 0 30px rgba(0, 243, 255, 0.2)',
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)'
                }}>
                    <Radar size={64} style={{ animation: 'radar-sweep 4s linear infinite' }} />
                </div>

                <h1 style={{
                    fontFamily: 'var(--font-mono)', letterSpacing: '8px',
                    textShadow: '0 0 10px var(--primary-neon)', fontSize: '2.5rem', marginBottom: '10px'
                }}>
                    SYSTEM ACTIVE
                </h1>

                <p style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#fff', opacity: 0.7,
                    background: '#000', padding: '5px 10px'
                }}>
                    AUTONOMOUS SURVEILLANCE IN PROGRESS
                </p>

                {nextRunTime && (
                    <div style={{
                        marginTop: '40px', border: '1px solid #333', padding: '10px 30px',
                        fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.8)'
                    }}>
                        NEXT SEQUENCE: <span style={{ color: '#fff' }}>{nextRunTime}</span>
                    </div>
                )}
            </div>

            <div style={{
                position: 'absolute', bottom: '50px', zIndex: 2,
                opacity: 0.5, fontSize: '0.8rem', animation: 'blink 2s infinite',
                fontFamily: 'var(--font-mono)'
            }}>
                [ TAP TO INTERFACE ]
            </div>
        </div>
    );
};

export default SleepScreen;
