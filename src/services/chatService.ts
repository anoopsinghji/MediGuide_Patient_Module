import axios, { AxiosInstance } from 'axios';
import { Chat, ListResponse } from '../models';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ChatService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/chat`,
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

  async getChats(): Promise<ListResponse<Chat>> {
    const response = await this.api.get<ListResponse<Chat>>('/');
    return response.data;
  }

  async getChatWithDoctor(doctorId: string): Promise<{ success: boolean; message?: string; data: any }> {
    const response = await this.api.get<{ success: boolean; message?: string; data: any }>(`/${doctorId}`);
    return response.data;
  }

  async sendMessage(
    doctorId: string,
    message: string
  ): Promise<{ success: boolean; message?: string; data?: any }> {
    const response = await this.api.post<{ success: boolean; message?: string; data?: any }>(`/${doctorId}/send`, { message });
    return response.data;
  }

  async markAsRead(doctorId: string): Promise<{ success: boolean; message?: string }> {
    const response = await this.api.put<{ success: boolean; message?: string }>(`/${doctorId}/mark-read`);
    return response.data;
  }
}

export default new ChatService();
