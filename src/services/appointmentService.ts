import axios, { AxiosInstance } from 'axios';
import { Appointment, AppointmentPayload, ListResponse } from '../models';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class AppointmentService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/appointments`,
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

  async bookAppointment(payload: AppointmentPayload) {
    const response = await this.api.post('/book', payload);
    return response.data;
  }

  async getMyAppointments(): Promise<ListResponse<Appointment>> {
    const response = await this.api.get<ListResponse<Appointment>>('/my-appointments');
    return response.data;
  }

  async cancelAppointment(id: string, reason: string) {
    const response = await this.api.put(`/${id}/cancel`, { reason });
    return response.data;
  }

  async getDoctorAvailableSlots(doctorId: string, date: string) {
    const response = await this.api.get('/available-slots', {
      params: { doctorId, date },
    });
    return response.data;
  }

  async updateAppointment(id: string, data: any) {
    const response = await this.api.put(`/${id}`, data);
    return response.data;
  }
}

export default new AppointmentService();
