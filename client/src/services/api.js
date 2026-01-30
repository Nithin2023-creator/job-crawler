// Use Vercel env var if set, otherwise use production URL (in prod) or local proxy (in dev)
const isDev = import.meta.env.DEV;
const fallback = isDev ? '/api' : 'https://job-crawler-two.vercel.app/api';
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || fallback).replace(/\/$/, '');

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
    starJob: async (id, isStarred) => {
        const res = await fetch(`${API_BASE}/jobs/${id}/star`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isStarred })
        });
        return res.json();
    },
    deleteJob: async (id) => {
        const res = await fetch(`${API_BASE}/jobs/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    }
};
