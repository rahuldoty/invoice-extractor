const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const endpoints = {
  upload: `${API_BASE}/upload`,
  invoices: `${API_BASE}/invoices`,
  summary: (id) => `${API_BASE}/invoices/${id}/summary`
};


