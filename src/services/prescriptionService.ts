import axios, { AxiosInstance } from 'axios';
import { Prescription, ListResponse } from '../models';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class PrescriptionService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/prescriptions`,
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

  async getMyPrescriptions(): Promise<ListResponse<Prescription>> {
    const response = await this.api.get<ListResponse<Prescription>>('/my-prescriptions');
    return response.data;
  }

  async getPrescriptionById(id: string): Promise<{ success: boolean; data: Prescription }> {
    const response = await this.api.get<{ success: boolean; data: Prescription }>(`/${id}`);
    return response.data;
  }

  async downloadPrescription(id: string) {
    const response = await this.api.get(`/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async sharePrescription(id: string, email: string) {
    const response = await this.api.post(`/${id}/share`, { email });
    return response.data;
  }
}

export default new PrescriptionService();
