// Reusable skeleton loader components

export const CompanyCardSkeleton = () => {
    return (
        <div className="company-card" style={{
            background: 'rgba(10, 10, 10, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            overflow: 'hidden',
            padding: '25px',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                {/* Logo skeleton */}
                <div className="skeleton" style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '16px',
                }} />

                {/* Info skeleton */}
                <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{
                        width: '200px',
                        height: '24px',
                        marginBottom: '12px',
                    }} />
                    <div className="skeleton" style={{
                        width: '150px',
                        height: '16px',
                    }} />
                </div>

                {/* Actions skeleton */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="skeleton" style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                    }} />
                    <div className="skeleton" style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                    }} />
                    <div className="skeleton" style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                    }} />
                </div>
            </div>
        </div>
    );
};

export const JobCardSkeleton = () => {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid #333',
            padding: '15px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        }}>
            <div className="skeleton" style={{
                width: '100%',
                height: '20px',
                marginTop: '30px',
            }} />
            <div className="skeleton" style={{
                width: '80%',
                height: '16px',
            }} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <div className="skeleton" style={{
                    width: '60px',
                    height: '14px',
                }} />
                <div className="skeleton" style={{
                    width: '80px',
                    height: '14px',
                }} />
            </div>
        </div>
    );
};

export const StatusPanelSkeleton = () => {
    return (
        <div className="status-hud">
            <div style={{ display: 'flex', gap: '50px', flex: 1 }}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="stat-item">
                        <div className="skeleton" style={{
                            width: '80px',
                            height: '32px',
                            marginBottom: '8px',
                        }} />
                        <div className="skeleton" style={{
                            width: '100px',
                            height: '12px',
                        }} />
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
                <div className="skeleton" style={{
                    width: '100px',
                    height: '44px',
                    borderRadius: '4px',
                }} />
                <div className="skeleton" style={{
                    width: '150px',
                    height: '44px',
                    borderRadius: '4px',
                }} />
            </div>
        </div>
    );
};

export const LoadingSkeleton = ({ type = 'company', count = 1 }) => {
    const components = {
        company: CompanyCardSkeleton,
        job: JobCardSkeleton,
        status: StatusPanelSkeleton,
    };

    const SkeletonComponent = components[type] || CompanyCardSkeleton;

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonComponent key={index} />
            ))}
        </>
    );
};

export default LoadingSkeleton;
