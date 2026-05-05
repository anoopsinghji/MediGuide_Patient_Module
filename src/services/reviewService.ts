import axios, { AxiosInstance } from 'axios';
import { Review, ReviewPayload, ListResponse } from '../models';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ReviewService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/reviews`,
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

  async submitReview(payload: ReviewPayload) {
    const response = await this.api.post('/submit', payload);
    return response.data;
  }

  async getReviewsByDoctor(doctorId: string): Promise<ListResponse<Review>> {
    const response = await this.api.get<ListResponse<Review>>(`/doctor/${doctorId}`);
    return response.data;
  }

  async updateReview(id: string, payload: ReviewPayload) {
    const response = await this.api.put(`/${id}`, payload);
    return response.data;
  }

  async deleteReview(id: string) {
    const response = await this.api.delete(`/${id}`);
    return response.data;
  }

  async getMyReviews(): Promise<ListResponse<Review>> {
    const response = await this.api.get<ListResponse<Review>>('/my-reviews');
    return response.data;
  }

  async getDoctorReviews(doctorId: string): Promise<ListResponse<Review>> {
    const response = await this.api.get<ListResponse<Review>>(`/doctor/${doctorId}`);
    return response.data;
  }
}

export default new ReviewService();
