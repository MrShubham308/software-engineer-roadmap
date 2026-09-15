import axios, { AxiosError } from 'axios';
import { Roadmap, RoadmapStep, DashboardStats, RoadmapTemplate, User } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('roadmap_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (window.location.pathname !== '/login') {
        // Optional dispatch or storage clearing handled via AuthContext
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const roadmapsApi = {
  async getAll(params?: { search?: string; category?: string; status?: string; sort?: string }): Promise<Roadmap[]> {
    const res = await api.get('/roadmaps', { params });
    return res.data.roadmaps;
  },

  async getStats(): Promise<DashboardStats> {
    const res = await api.get('/roadmaps/stats');
    return res.data.stats;
  },

  async getById(id: string): Promise<Roadmap> {
    const res = await api.get(`/roadmaps/${id}`);
    return res.data.roadmap;
  },

  async create(data: Partial<Roadmap> & { initialSteps?: Partial<RoadmapStep>[] }): Promise<Roadmap> {
    const res = await api.post('/roadmaps', data);
    return res.data.roadmap;
  },

  async update(id: string, data: Partial<Roadmap>): Promise<Roadmap> {
    const res = await api.put(`/roadmaps/${id}`, data);
    return res.data.roadmap;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/roadmaps/${id}`);
  },

  async addStep(roadmapId: string, stepData: Partial<RoadmapStep>): Promise<{ step: RoadmapStep; roadmap: Roadmap }> {
    const res = await api.post(`/roadmaps/${roadmapId}/steps`, stepData);
    return res.data;
  },

  async updateStep(roadmapId: string, stepId: string, stepData: Partial<RoadmapStep>): Promise<{ step: RoadmapStep; roadmap: Roadmap }> {
    const res = await api.put(`/roadmaps/${roadmapId}/steps/${stepId}`, stepData);
    return res.data;
  },

  async deleteStep(roadmapId: string, stepId: string): Promise<{ roadmap: Roadmap }> {
    const res = await api.delete(`/roadmaps/${roadmapId}/steps/${stepId}`);
    return res.data;
  },

  async reorderSteps(roadmapId: string, orderedStepIds: string[]): Promise<{ roadmap: Roadmap }> {
    const res = await api.put(`/roadmaps/${roadmapId}/steps-reorder`, { orderedStepIds });
    return res.data;
  },

  async getTemplates(): Promise<RoadmapTemplate[]> {
    const res = await api.get('/roadmaps/templates');
    return res.data.templates;
  },

  async cloneTemplate(templateId: string): Promise<Roadmap> {
    const res = await api.post(`/roadmaps/templates/${templateId}/clone`);
    return res.data.roadmap;
  }
};

export default api;
