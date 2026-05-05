import axios, { AxiosInstance } from 'axios';
import { Doctor, DoctorSearchQuery, ListResponse } from '../models';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class DoctorService {
  private api: AxiosInstance;

  private buildParams(query?: DoctorSearchQuery): Record<string, string | number> {
    const params: Record<string, string | number> = {};

    if (query?.search) params.search = query.search;
    if (query?.specialty) params.specialty = query.specialty;
    if (query?.city) params.city = query.city;
    if (query?.state) params.state = query.state;
    if (query?.language) params.language = query.language;
    if (query?.languages?.length) params.languages = query.languages.join(',');

    if (Array.isArray(query?.foreignLanguage)) {
      params.foreignLanguage = query.foreignLanguage.join(',');
    } else if (query?.foreignLanguage) {
      params.foreignLanguage = query.foreignLanguage;
    }

    if (query?.touristFriendly) params.touristFriendly = 'true';
    if (query?.teleconsultation) params.teleconsultation = 'true';
    if (query?.availableToday) params.availableToday = 'true';

    if (typeof query?.minRating === 'number') params.minRating = query.minRating;
    if (query?.sortBy) params.sortBy = query.sortBy;
    if (typeof query?.lat === 'number') params.lat = query.lat;
    if (typeof query?.lng === 'number') params.lng = query.lng;
    if (typeof query?.radiusKm === 'number') params.radiusKm = query.radiusKm;
    if (typeof query?.page === 'number') params.page = query.page;
    if (typeof query?.limit === 'number') params.limit = query.limit;

    return params;
  }

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/doctors`,
    });

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getDoctors(query?: DoctorSearchQuery): Promise<ListResponse<Doctor>> {
    const response = await this.api.get<ListResponse<Doctor>>('/', {
      params: this.buildParams(query),
    });
    return response.data;
  }

  async getNearbyDoctors(query: DoctorSearchQuery & { lat: number; lng: number }): Promise<ListResponse<Doctor>> {
    const response = await this.api.get<ListResponse<Doctor>>('/nearby', {
      params: this.buildParams(query),
    });
    return response.data;
  }

  async getDoctorById(id: string): Promise<{ success: boolean; data: Doctor }> {
    const response = await this.api.get<{ success: boolean; data: Doctor }>(`/${id}`);
    return response.data;
  }

  async getSpecialties(): Promise<string[]> {
    const response = await this.api.get<{ success: boolean; data: string[] }>('/specialties');
    return response.data.data || [];
  }

  async getCities(): Promise<string[]> {
    const response = await this.api.get<{ success: boolean; data: string[] }>('/cities');
    return response.data.data || [];
  }

  async getLanguages(): Promise<{ all: string[]; local: string[]; foreign: string[] }> {
    const response = await this.api.get<{ success: boolean; data: { all: string[]; local: string[]; foreign: string[] } }>('/languages');
    return response.data.data || { all: [], local: [], foreign: [] };
  }

  async getDoctorReviews(doctorId: string) {
    const response = await this.api.get(`/${doctorId}/reviews`);
    return response.data;
  }

  async searchDoctors(term: string): Promise<ListResponse<Doctor>> {
    const response = await this.api.get<ListResponse<Doctor>>('/search', {
      params: { q: term },
    });
    return response.data;
  }
}

export default new DoctorService();
