import axios, { AxiosInstance } from 'axios';
import { SymptomAnalysisResult, SymptomRecommendationPayload } from '../models';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class SymptomService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_URL}/symptoms`,
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

  async analyzeSymptoms(symptoms: string[]): Promise<SymptomAnalysisResult> {
    const response = await this.api.post('/analyze', { symptoms });
    return response.data.data;
  }

  async analyzePlainText(text: string, city?: string): Promise<SymptomAnalysisResult> {
    const response = await this.api.post('/analyze-text', { text, city });
    return response.data.data;
  }

  async recommendDoctors(payload: SymptomRecommendationPayload): Promise<SymptomAnalysisResult> {
    const response = await this.api.post('/recommend-doctors', payload);
    return response.data.data;
  }

  async getCommonSymptoms(): Promise<string[]> {
    const response = await this.api.get('/common');
    return response.data.data || [];
  }

  async getUrgencyGuidelines() {
    const response = await this.api.get('/urgency-guidelines');
    return response.data.data;
  }
}

export default new SymptomService();
