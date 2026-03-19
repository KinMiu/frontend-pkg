import {
  Faculty,
  Achievement,
  Event,
  Pengumuman,
  Partner,
  Statistik,
  Testimonial,
  Greeting,
  Certification,
  RPS,
  Surat,
  PerangkatAjar,
  Facility,
  Kurikulum,
  Banner,
  Program,
  Structural,
} from '../types';

// API response types
interface APIResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

// Custom error classes
class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'APIError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string).replace(/\/+$/, '');
const DEFAULT_TIMEOUT = 30000;

// Remove id fields before sending to API
const sanitizeData = (data: any) => {
  if (data instanceof FormData) return data;
  const clone = { ...data };
  delete clone._id;
  delete clone.id;
  return clone;
};

// Handle request timeout
const fetchWithTimeout = async (resource: string, options?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
};

// Main fetch function with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const isFormData = options?.body instanceof FormData;

    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        Accept: 'application/json',
        ...options?.headers,
      },
      mode: 'cors',
    });

    if (!response.ok) {
      let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (_) {}
      throw new APIError(response.status, errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error instanceof APIError) throw error;
    if (error.name === 'AbortError') throw new NetworkError('Request timeout');
    if (!navigator.onLine) throw new NetworkError('No internet connection');
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new NetworkError(`Unable to connect to API at ${API_BASE_URL}`);
    }

    console.error('Unhandled API error:', error);
    throw new NetworkError('Unexpected error during API request');
  }
}

const prepareRequestData = (data: any) => {
  const clean = sanitizeData(data);
  return clean instanceof FormData ? clean : JSON.stringify(clean);
};

// -------- Auth API (Guru) --------
export const authAPI = {
  loginAdmin: async (username: string, password: string) => {
    const response = await fetchAPI<APIResponse<{ username: string }>>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return response.data;
  },

  changeAdminPassword: async (username: string, currentPassword: string, newPassword: string) => {
    const response = await fetchAPI<APIResponse<{ username: string }>>('/api/auth/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ username, currentPassword, newPassword }),
    });
    return response.data;
  },

  loginDosen: async (nuptk: string, password: string) => {
    const response = await fetchAPI<
      APIResponse<{
        facultyId: string;
        nuptk: string;
        nidn?: string;
        name: string;
        hasCustomPassword: boolean;
      }>
    >('/api/auth/dosen/login', {
      method: 'POST',
      body: JSON.stringify({ nuptk, password }),
    });
    return response.data;
  },

  changeDosenPassword: async (nuptk: string, currentPassword: string, newPassword: string) => {
    const response = await fetchAPI<APIResponse<{ nuptk: string }>>('/api/auth/dosen/change-password', {
      method: 'POST',
      body: JSON.stringify({ nuptk, currentPassword, newPassword }),
    });
    return response.data;
  },

  loginOperator: async (email: string, password: string) => {
    const response = await fetchAPI<
      APIResponse<{ operatorId: string; satminkal: string; npsn: string; email: string }>
    >('/api/auth/operator/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.data;
  },

  changeOperatorPassword: async (email: string, currentPassword: string, newPassword: string) => {
    const response = await fetchAPI<APIResponse<{ email: string }>>('/api/auth/operator/change-password', {
      method: 'POST',
      body: JSON.stringify({ email, currentPassword, newPassword }),
    });
    return response.data;
  },

  resetPassword: async (identifier: string, newPassword: string) => {
    const response = await fetchAPI<APIResponse<{ role: string; identifier: string }>>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, newPassword }),
    });
    return response.data;
  },

  requestResetPassword: async (identifier: string, newPassword: string) => {
    const response = await fetchAPI<
      APIResponse<{ requestId: string; role: 'operator' | 'dosen'; identifier: string; status: 'pending' }>
    >('/api/auth/request-reset-password', {
      method: 'POST',
      body: JSON.stringify({ identifier, newPassword }),
    });
    return response.data;
  },

  listResetRequests: async (status: 'pending' | 'approved' | 'rejected' = 'pending') => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const response = await fetchAPI<
      APIResponse<
        Array<{
          id: string;
          role: 'operator' | 'dosen';
          identifier: string;
          targetId: string;
          status: 'pending' | 'approved' | 'rejected';
          requestedAt: string;
          decidedAt?: string | null;
          decidedBy?: string | null;
        }>
      >
    >(`/api/auth/reset-requests${query}`);
    return response.data;
  },

  approveResetRequest: async (id: string, decidedBy?: string) => {
    const response = await fetchAPI<APIResponse<{ id: string; status: 'approved' }>>(
      `/api/auth/reset-requests/${encodeURIComponent(id)}/approve`,
      {
        method: 'POST',
        body: JSON.stringify({ decidedBy }),
      }
    );
    return response.data;
  },

  rejectResetRequest: async (id: string, decidedBy?: string) => {
    const response = await fetchAPI<APIResponse<{ id: string; status: 'rejected' }>>(
      `/api/auth/reset-requests/${encodeURIComponent(id)}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ decidedBy }),
      }
    );
    return response.data;
  },

  resetOperatorPassword: async (email: string, newPassword: string) => {
    const response = await fetchAPI<APIResponse<{ email: string }>>('/api/auth/operator/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
    return response.data;
  },
};

// -------- Faculty Import (Excel) API --------
export const facultyImportAPI = {
  importFromExcel: async (
    file: File,
    options?: { mode?: 'admin' | 'operator'; satminkal?: string }
  ) => {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    if (options?.mode) params.append('mode', options.mode);
    if (options?.satminkal) params.append('satminkal', options.satminkal);

    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await fetch(`${API_BASE_URL}/api/faculties/import-excel${query}`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      let message = 'Gagal mengimpor data guru';
      try {
        const data = await response.json();
        message = data.error || message;
      } catch (_) {}
      throw new Error(message);
    }

    const result = await response.json();
    return result.data;
  },

  downloadTemplateUrl: (mode?: 'admin' | 'operator') => {
    const params = new URLSearchParams();
    if (mode) params.append('mode', mode);
    const query = params.toString() ? `?${params.toString()}` : '';
    return `${API_BASE_URL}/api/faculties/import-template${query}`;
  },
};

// -------- Faculty API --------
export const facultyAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Faculty[]>>('/api/faculties');
      return response.data;
    } catch (error) {
      console.error('Error fetching faculties:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Faculty ID is required');
    try {
      const response = await fetchAPI<APIResponse<Faculty>>(`/api/faculties/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching faculty ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Faculty>>('/api/faculties', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Faculty ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Faculty>>(`/api/faculties/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Faculty ID is required');
    await fetchAPI<APIResponse<void>>(`/api/faculties/${_id}`, { method: 'DELETE' });
  },

  setResearchVisibilityAll: async (isResearchPublic: boolean) => {
    const response = await fetchAPI<
      APIResponse<{ matchedCount: number; modifiedCount: number; isResearchPublic: boolean }>
    >('/api/faculties/research-visibility', {
      method: 'PUT',
      body: JSON.stringify({ isResearchPublic }),
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },
};

// -------- Achievement API --------
export const achievementAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Achievement[]>>('/api/achievements');
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Achievement ID is required');
    try {
      const response = await fetchAPI<APIResponse<Achievement>>(`/api/achievements/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching achievement ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Achievement>>('/api/achievements', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Achievement ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Achievement>>(`/api/achievements/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Achievement ID is required');
    await fetchAPI<APIResponse<void>>(`/api/achievements/${_id}`, { method: 'DELETE' });
  },
};

// -------- Event API --------
export const eventAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Event[]>>('/api/events');
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Event ID is required');
    try {
      const response = await fetchAPI<APIResponse<Event>>(`/api/events/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Event>>('/api/events', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Event ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Event>>(`/api/events/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Event ID is required');
    await fetchAPI<APIResponse<void>>(`/api/events/${_id}`, { method: 'DELETE' });
  },
};

// -------- K3SP Event API --------
export const k3spEventAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Event[]>>('/api/k3sp-events');
      return response.data;
    } catch (error) {
      console.error('Error fetching k3sp events:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Event ID is required');
    try {
      const response = await fetchAPI<APIResponse<Event>>(`/api/k3sp-events/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching k3sp event ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Event>>('/api/k3sp-events', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Event ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Event>>(`/api/k3sp-events/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Event ID is required');
    await fetchAPI<APIResponse<void>>(`/api/k3sp-events/${_id}`, { method: 'DELETE' });
  },
};

// -------- Pengumuman API --------
export const pengumumanAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Pengumuman[]>>('/api/pengumuman');
      return response.data;
    } catch (error) {
      console.error('Error fetching pengumuman:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Pengumuman ID is required');
    try {
      const response = await fetchAPI<APIResponse<Pengumuman>>(`/api/pengumuman/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching pengumuman ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Pengumuman>>('/api/pengumuman', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Pengumuman ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Pengumuman>>(`/api/pengumuman/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Pengumuman ID is required');
    await fetchAPI<APIResponse<void>>(`/api/pengumuman/${_id}`, { method: 'DELETE' });
  },
};

// -------- Statistik API --------
export const statistikAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Statistik[]>>('/api/statistik');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistik:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Statistik ID is required');
    try {
      const response = await fetchAPI<APIResponse<Statistik>>(`/api/statistik/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching statistik ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: { name: string; value: string; order?: number }) => {
    const response = await fetchAPI<APIResponse<Statistik>>('/api/statistik', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: { name?: string; value?: string; order?: number }) => {
    if (!_id) throw new Error('Statistik ID is required');
    const response = await fetchAPI<APIResponse<Statistik>>(`/api/statistik/${_id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Statistik ID is required');
    await fetchAPI<APIResponse<void>>(`/api/statistik/${_id}`, { method: 'DELETE' });
  },
};

// -------- Partner API --------
export const partnerAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Partner[]>>('/api/partners');
      return response.data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Partner ID is required');
    try {
      const response = await fetchAPI<APIResponse<Partner>>(`/api/partners/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching partner ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Partner>>('/api/partners', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Partner ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Partner>>(`/api/partners/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Partner ID is required');
    await fetchAPI<APIResponse<void>>(`/api/partners/${_id}`, { method: 'DELETE' });
  },
};

// -------- Testimonial API --------
export const testimonialAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Testimonial[]>>('/api/testimonials');
      return response.data;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Testimonial ID is required');
    try {
      const response = await fetchAPI<APIResponse<Testimonial>>(`/api/testimonials/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching testimonial ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Testimonial>>('/api/testimonials', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Testimonial ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Testimonial>>(`/api/testimonials/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Testimonial ID is required');
    await fetchAPI<APIResponse<void>>(`/api/testimonials/${_id}`, { method: 'DELETE' });
  },
};

// -------- Greeting (Kata Pengantar) API --------
export const greetingAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Greeting[]>>('/api/greetings');
      return response.data;
    } catch (error) {
      console.error('Error fetching greetings:', error);
      return [];
    }
  },

  getLatest: async () => {
    try {
      const response = await fetchAPI<APIResponse<Greeting | null>>('/api/greetings/latest');
      return response.data;
    } catch (error) {
      console.error('Error fetching latest greeting:', error);
      return null;
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Greeting ID is required');
    try {
      const response = await fetchAPI<APIResponse<Greeting>>(`/api/greetings/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching greeting ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Greeting>>('/api/greetings', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Greeting ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Greeting>>(`/api/greetings/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Greeting ID is required');
    await fetchAPI<APIResponse<void>>(`/api/greetings/${_id}`, { method: 'DELETE' });
  },
};

// -------- HKI API --------
export const hkiAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Certification[]>>('/api/hki');
      return response.data;
    } catch (error) {
      console.error('Error fetching HKI:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('HKI ID is required');
    try {
      const response = await fetchAPI<APIResponse<Certification>>(`/api/hki/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching HKI ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Certification>>('/api/hki', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('HKI ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Certification>>(`/api/hki/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('HKI ID is required');
    await fetchAPI<APIResponse<void>>(`/api/hki/${_id}`, { method: 'DELETE' });
  },
};

// -------- Patent API --------
export const patentAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Certification[]>>('/api/patents');
      return response.data;
    } catch (error) {
      console.error('Error fetching patents:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Patent ID is required');
    try {
      const response = await fetchAPI<APIResponse<Certification>>(`/api/patents/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching patent ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Certification>>('/api/patents', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Patent ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Certification>>(`/api/patents/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Patent ID is required');
    await fetchAPI<APIResponse<void>>(`/api/patents/${_id}`, { method: 'DELETE' });
  },
};

// -------- Industrial Design API --------
export const industrialDesignAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Certification[]>>('/api/industrial-designs');
      return response.data;
    } catch (error) {
      console.error('Error fetching industrial designs:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Industrial Design ID is required');
    try {
      const response = await fetchAPI<APIResponse<Certification>>(`/api/industrial-designs/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching industrial design ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Certification>>('/api/industrial-designs', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Industrial Design ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Certification>>(`/api/industrial-designs/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Industrial Design ID is required');
    await fetchAPI<APIResponse<void>>(`/api/industrial-designs/${_id}`, { method: 'DELETE' });
  },
};

// -------- RPS API --------
export const rpsAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<RPS[]>>('/api/rps');
      return response.data;
    } catch (error) {
      console.error('Error fetching RPS:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('RPS ID is required');
    try {
      const response = await fetchAPI<APIResponse<RPS>>(`/api/rps/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching RPS ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: FormData) => {
    const response = await fetch(`${API_BASE_URL}/api/rps`, {
      method: 'POST',
      body: data,
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Failed to create RPS');
    }
    const result = await response.json();
    return result.data;
  },

  update: async (_id: string, data: FormData) => {
    if (!_id) throw new Error('RPS ID is required');
    const response = await fetch(`${API_BASE_URL}/api/rps/${_id}`, {
      method: 'PUT',
      body: data,
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Failed to update RPS');
    }
    const result = await response.json();
    return result.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('RPS ID is required');
    await fetchAPI<APIResponse<void>>(`/api/rps/${_id}`, { method: 'DELETE' });
  },
};

// -------- Surat API --------
export const suratAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Surat[]>>('/api/surat');
      return response.data;
    } catch (error) {
      console.error('Error fetching surat:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Surat ID is required');
    try {
      const response = await fetchAPI<APIResponse<Surat>>(`/api/surat/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching surat ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: FormData) => {
    const response = await fetch(`${API_BASE_URL}/api/surat`, {
      method: 'POST',
      body: data,
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Failed to create Surat');
    }
    const result = await response.json();
    return result.data;
  },

  update: async (_id: string, data: FormData) => {
    if (!_id) throw new Error('Surat ID is required');
    const response = await fetch(`${API_BASE_URL}/api/surat/${_id}`, {
      method: 'PUT',
      body: data,
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Failed to update Surat');
    }
    const result = await response.json();
    return result.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Surat ID is required');
    await fetchAPI<APIResponse<void>>(`/api/surat/${_id}`, { method: 'DELETE' });
  },
};

// -------- Perangkat Ajar API --------
export const perangkatAjarAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<PerangkatAjar[]>>('/api/perangkat-ajar');
      return response.data;
    } catch (error) {
      console.error('Error fetching perangkat ajar:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('PerangkatAjar ID is required');
    try {
      const response = await fetchAPI<APIResponse<PerangkatAjar>>(`/api/perangkat-ajar/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching perangkat ajar ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: FormData) => {
    const response = await fetch(`${API_BASE_URL}/api/perangkat-ajar`, {
      method: 'POST',
      body: data,
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Failed to create PerangkatAjar');
    }
    const result = await response.json();
    return result.data;
  },

  update: async (_id: string, data: FormData) => {
    if (!_id) throw new Error('PerangkatAjar ID is required');
    const response = await fetch(`${API_BASE_URL}/api/perangkat-ajar/${_id}`, {
      method: 'PUT',
      body: data,
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error('Failed to update PerangkatAjar');
    }
    const result = await response.json();
    return result.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('PerangkatAjar ID is required');
    await fetchAPI<APIResponse<void>>(`/api/perangkat-ajar/${_id}`, { method: 'DELETE' });
  },

  checkPassword: async (password: string) => {
    const response = await fetchAPI<APIResponse<{ role: string }>>('/api/perangkat-ajar/check-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    return response.data;
  },
};

// -------- Facility API --------
export const facilityAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Facility[]>>('/api/facilities');
      return response.data;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Facility ID is required');
    try {
      const response = await fetchAPI<APIResponse<Facility>>(`/api/facilities/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching facility ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Facility>>('/api/facilities', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Facility ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Facility>>(`/api/facilities/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Facility ID is required');
    await fetchAPI<APIResponse<void>>(`/api/facilities/${_id}`, { method: 'DELETE' });
  },
};

// -------- Banner API --------
export const bannerAPI = {
  // default onlyActive=true to preserve landing behaviour
  getAll: async (onlyActive: boolean = true) => {
    try {
      const query = onlyActive ? '?active=true' : '';
      const response = await fetchAPI<APIResponse<Banner[]>>(`/api/banners${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Banner ID is required');
    try {
      const response = await fetchAPI<APIResponse<Banner>>(`/api/banners/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching banner ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Banner>>('/api/banners', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Banner ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Banner>>(`/api/banners/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Banner ID is required');
    await fetchAPI<APIResponse<void>>(`/api/banners/${_id}`, { method: 'DELETE' });
  },
};

// -------- Program Pembelajaran API --------
export const programAPI = {
  // activeOnly=false by default so dashboard gets all programs,
  // landing pages call getAll(true) to get only active programs.
  getAll: async (activeOnly: boolean = false) => {
    try {
      const query = activeOnly ? '?active=true' : '';
      const response = await fetchAPI<APIResponse<Program[]>>(`/api/programs${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching programs:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Program ID is required');
    try {
      const response = await fetchAPI<APIResponse<Program>>(`/api/programs/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching program ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Program>>('/api/programs', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Program ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Program>>(`/api/programs/${_id}`, {
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Program ID is required');
    await fetchAPI<APIResponse<void>>(`/api/programs/${_id}`, { method: 'DELETE' });
  },
};

// -------- Struktur Jabatan API --------
export const structuralAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Structural[]>>('/api/structurals');
      return response.data;
    } catch (error) {
      console.error('Error fetching structurals:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Structural ID is required');
    try {
      const response = await fetchAPI<APIResponse<Structural>>(`/api/structurals/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching structural ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Structural>>('/api/structurals', {
      method: 'POST',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Structural ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Structural>>(`/api/structurals/${_id}`, {
      method: 'PUT',
      body,
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Structural ID is required');
    await fetchAPI<APIResponse<void>>(`/api/structurals/${_id}`, { method: 'DELETE' });
  },
};

// -------- Kurikulum API --------
export const kurikulumAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<Kurikulum[]>>('/api/kurikulums');
      return response.data;
    } catch (error) {
      console.error('Error fetching kurikulums:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Kurikulum ID is required');
    try {
      const response = await fetchAPI<APIResponse<Kurikulum>>(`/api/kurikulums/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching kurikulum ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Kurikulum>>('/api/kurikulums', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Kurikulum ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<Kurikulum>>(`/api/kurikulums/${_id}`, {
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Kurikulum ID is required');
    await fetchAPI<APIResponse<void>>(`/api/kurikulums/${_id}`, { method: 'DELETE' });
  },
};

// -------- Operator (SATMINKAL) API --------
export const operatorAPI = {
  getAll: async () => {
    try {
      const response = await fetchAPI<APIResponse<any[]>>('/api/operators');
      return response.data;
    } catch (error) {
      console.error('Error fetching operators:', error);
      return [];
    }
  },

  getById: async (_id: string) => {
    if (!_id) throw new Error('Operator ID is required');
    try {
      const response = await fetchAPI<APIResponse<any>>(`/api/operators/${_id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching operator ${_id}:`, error);
      return undefined;
    }
  },

  create: async (data: any) => {
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<any>>('/api/operators', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  update: async (_id: string, data: any) => {
    if (!_id) throw new Error('Operator ID is required');
    const body = prepareRequestData(data);
    const response = await fetchAPI<APIResponse<any>>(`/api/operators/${_id}`, {
      method: 'PUT',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  },

  delete: async (_id: string) => {
    if (!_id) throw new Error('Operator ID is required');
    await fetchAPI<APIResponse<void>>(`/api/operators/${_id}`, { method: 'DELETE' });
  },
};

// -------- Operator Import (Excel) API --------
export const operatorImportAPI = {
  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/operators/import-excel`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
    });

    if (!response.ok) {
      let message = 'Gagal mengimpor data operator';
      try {
        const data = await response.json();
        message = data.error || message;
      } catch (_) {}
      throw new Error(message);
    }

    const result = await response.json();
    return result.data;
  },

  downloadTemplateUrl: () => {
    return `${API_BASE_URL}/api/operators/import-template`;
  },
};

// -------- Settings API (global UI settings) --------
export const settingsAPI = {
  getTheme: async () => {
    const response = await fetchAPI<
      APIResponse<{
        activeTheme: string;
        sidebarTheme: string;
        headerTheme: string;
        sidebarTextColor?: string;
        headerTextColor?: string;
        hideMainHero?: boolean;
      }>
    >('/api/settings/theme');
    return response.data;
  },
  updateTheme: async (payload: {
    activeTheme?: string;
    sidebarTheme?: string;
    headerTheme?: string;
    sidebarTextColor?: string;
    headerTextColor?: string;
    hideMainHero?: boolean;
  }) => {
    const response = await fetchAPI<
      APIResponse<{
        activeTheme: string;
        sidebarTheme: string;
        headerTheme: string;
        sidebarTextColor?: string;
        headerTextColor?: string;
      }>
    >('/api/settings/theme', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data;
  },
};

export { APIError, NetworkError };