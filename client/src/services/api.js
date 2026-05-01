const getApiBase = () => {
    let base = import.meta.env.VITE_API_BASE_URL || '';
    if (!base) return '/api';
    
    base = base.replace(/\/$/, ''); // Remove trailing slash
    if (!base.endsWith('/api')) {
        base += '/api';
    }
    return base;
};

export const API_BASE = getApiBase();

export const CompanyService = {
    getAll: async () => {
        const res = await fetch(`${API_BASE}/companies`);
        return res.json();
    },
    create: async (company) => {
        const res = await fetch(`${API_BASE}/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(company)
        });
        return res.json();
    },
    update: async (id, updates) => {
        const res = await fetch(`${API_BASE}/companies/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        return res.json();
    },
    delete: async (id) => {
        const res = await fetch(`${API_BASE}/companies/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};

export const SettingsService = {
    get: async () => {
        const res = await fetch(`${API_BASE}/settings`);
        return res.json();
    },
    update: async (settings) => {
        const res = await fetch(`${API_BASE}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        return res.json();
    }
};

export const JobService = {
    getByCompany: async (companyId) => {
        const res = await fetch(`${API_BASE}/jobs?company=${companyId}`);
        return res.json();
    },
    markViewed: async (id) => {
        const res = await fetch(`${API_BASE}/jobs/${id}/mark-viewed`, {
            method: 'PATCH'
        });
        return res.json();
    },
    cleanup: async (days = 7) => {
        const res = await fetch(`${API_BASE}/jobs/cleanup?days=${days}`, {
            method: 'POST'
        });
        return res.json();
    },
    deleteByCompany: async (companyId) => {
        const res = await fetch(`${API_BASE}/jobs/company/${companyId}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};
