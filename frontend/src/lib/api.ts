import { Role } from "@/types/fixmycampus";

const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  login: async (role: Role, data: any) => {
    // Both 'warden' and 'admin' (or faculty) go to /api/auth/admin/login
    // Student goes to /api/auth/student/login
    const endpoint = role === 'student' ? '/auth/student/login' : '/auth/admin/login';
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  signup: async (role: Role, data: any) => {
    const endpoint = role === 'student' ? '/auth/student/signup' : '/auth/admin/signup';
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Signup failed');
    }
    return res.json();
  },

  // Complaints
  getComplaints: async () => {
    const res = await fetch(`${API_BASE}/complaints`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch complaints');
    return res.json();
  },

  createComplaint: async (formData: FormData) => {
    const res = await fetch(`${API_BASE}/complaints/newcomplaint`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to create complaint');
    return res.json();
  },

  updateStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  toggleUpvote: async (id: string) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/upvote`, {
      method: 'PUT',
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to toggle upvote');
    return res.json();
  },

  addComment: async (id: string, text: string) => {
    const res = await fetch(`${API_BASE}/complaints/${id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add comment');
    }
    return res.json();
  }
};
