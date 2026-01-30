import { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';

const ArrayInput = ({ label, items, onChange, placeholder }) => {
    const [newValue, setNewValue] = useState('');

    const handleAdd = () => {
        if (newValue.trim()) {
            onChange([...items, newValue.trim()]);
            setNewValue('');
        }
    };

    const handleRemove = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        onChange(newItems);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>{label}</label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                />
                <button type="button" className="btn-primary" onClick={handleAdd}>
                    <Plus size={18} />
                </button>
            </div>

            <div className="chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {items.map((item, idx) => (
                    <div key={idx} style={{
                        background: 'rgba(255, 102, 0, 0.1)',
                        border: '1px solid var(--primary-neon)',
                        padding: '5px 10px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.9rem'
                    }}>
                        <span>{item}</span>
                        <button
                            type="button"
                            onClick={() => handleRemove(idx)}
                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ConfigForm = ({
    urls, setUrls,
    targetRoles, setTargetRoles,
    location, setLocation,
    onSave
}) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave({ urls, targetRoles, location });
        setIsSaving(false);
    };

    return (
        <form onSubmit={handleSubmit} className="panel config-panel">
            <h3 className="title-neon" style={{ marginBottom: '20px' }}>Mission Parameters</h3>

            <ArrayInput
                label="Target URLs (Career Pages)"
                items={urls}
                onChange={setUrls}
                placeholder="https://example.com/careers"
            />

            <ArrayInput
                label="Target Roles (Keywords)"
                items={targetRoles}
                onChange={setTargetRoles}
                placeholder="e.g. Frontend Engineer"
            />

            <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Location Filter (Optional)</label>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote, Bangalore, London"
                />
            </div>

            <button type="submit" className="btn-primary" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: 'auto' }}>
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
        </form>
    );
};

export default ConfigForm;
