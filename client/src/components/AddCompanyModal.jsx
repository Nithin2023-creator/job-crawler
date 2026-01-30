import { useState, useEffect } from 'react';

const AddCompanyModal = ({ isOpen, onClose, onSave, initialData = null }) => {
    const [name, setName] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    // Tag Inputs
    const [urls, setUrls] = useState([]);
    const [urlInput, setUrlInput] = useState('');



    const [customPersona, setCustomPersona] = useState('');

    useEffect(() => {
        if (isOpen && initialData) {
            setName(initialData.name || '');
            setLogoUrl(initialData.logoUrl || '');
            setUrls(initialData.urls || []);
            setCustomPersona(initialData.customPersona || []);
        } else if (isOpen) {
            // Reset for new entry
            setName('');
            setLogoUrl('');
            setUrls([]);
            setCustomPersona('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleAddUrl = (e) => {
        if (e.key === 'Enter' && urlInput.trim()) {
            e.preventDefault();
            if (!urls.includes(urlInput.trim())) {
                setUrls([...urls, urlInput.trim()]);
            }
            setUrlInput('');
        }
    };

    const removeUrl = (idx) => {
        setUrls(urls.filter((_, i) => i !== idx));
    };



    const handleSubmit = (e) => {
        e.preventDefault();

        // Auto-add pending inputs if they exist
        const finalUrls = [...urls];
        if (urlInput.trim() && !finalUrls.includes(urlInput.trim())) {
            finalUrls.push(urlInput.trim());
        }

        onSave({
            name,
            urls: finalUrls,
            customTags: [],
            customPersona,
            logoUrl
        });
        onClose();
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, backdropFilter: 'blur(5px)'
        }}>
            <div className="modal-content card-neon" style={{
                width: '600px', background: '#0a0a0a', padding: '30px', borderRadius: '15px',
                border: '1px solid var(--neon-blue)', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <h2 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--neon-blue)' }}>
                    {initialData ? 'Edit Company' : 'Add New Company'}
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Company Name */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Company Name</label>
                        <input
                            type="text"
                            value={name} onChange={(e) => setName(e.target.value)}
                            required
                            className="input-neon"
                            placeholder="e.g. Google"
                            style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                        />
                    </div>

                    {/* Logo URL */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Logo URL (Optional)</label>
                        <input
                            type="text"
                            value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                        />
                    </div>

                    {/* URLs Tag Input */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Career Page URLs</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                            {urls.map((url, idx) => (
                                <span key={idx} style={{
                                    background: 'rgba(0, 255, 255, 0.1)', border: '1px solid var(--neon-blue)',
                                    padding: '5px 10px', borderRadius: '15px', fontSize: '0.85rem', color: '#fff',
                                    display: 'flex', alignItems: 'center', gap: '5px'
                                }}>
                                    {url.length > 30 ? url.substring(0, 30) + '...' : url}
                                    <button type="button" onClick={() => removeUrl(idx)} style={{ background: 'none', border: 'none', color: 'var(--neon-blue)', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={handleAddUrl}
                            placeholder="Paste URL and press Enter"
                            style={{ width: '100%', padding: '12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                        />
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>Press Enter to add multiple URLs.</div>
                    </div>



                    {/* Custom Persona (AI Prompt) */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc' }}>Company Persona (AI Prompt)</label>
                        <textarea
                            value={customPersona}
                            onChange={(e) => setCustomPersona(e.target.value)}
                            placeholder="Overwrite global persona for this company (e.g. 'Look for only Intern roles here'). Leave empty to use Global."
                            rows={3}
                            style={{
                                width: '100%', padding: '12px', background: '#111',
                                border: '1px solid #333', color: '#fff', borderRadius: '8px',
                                fontFamily: 'inherit', resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                        <button type="submit" className="btn-primary" style={{ flex: 2, padding: '12px' }}>
                            {initialData ? 'UPDATE COMPANY' : 'SAVE COMPANY'}
                        </button>
                        <button type="button" onClick={onClose} style={{
                            flex: 1, background: 'transparent', border: '1px solid #555', color: '#ccc', borderRadius: '8px', cursor: 'pointer'
                        }}>CANCEL</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCompanyModal;
