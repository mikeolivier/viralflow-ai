import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiErrorResponse {
  message: string;
  code?: string;
  statusCode?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiErrorResponse>) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Auth endpoints
  async signup(email: string, password: string, username: string) {
    const response = await this.client.post('/auth/signup', {
      email,
      password,
      username,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', {
      email,
      password,
    });
    if (response.data.auth?.accessToken) {
      this.setToken(response.data.auth.accessToken);
    }
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.client.post('/auth/refresh', {
      refreshToken,
    });

    if (response.data.auth?.accessToken) {
      this.setToken(response.data.auth.accessToken);
    }

    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // User endpoints
  async getUserProfile() {
    const response = await this.client.get('/user/profile');
    return response.data;
  }

  async updateUserProfile(data: any) {
    const response = await this.client.put('/user/profile', data);
    return response.data;
  }

  async getUserStats() {
    const response = await this.client.get('/user/stats');
    return response.data;
  }

  // Video endpoints
  async requestUploadUrl(filename: string, fileSize: number) {
    const response = await this.client.post('/videos/upload', {
      filename,
      fileSize,
    });
    return response.data;
  }

  async getVideoStatus(videoId: string) {
    const response = await this.client.get(`/videos/${videoId}/status`);
    return response.data;
  }

  async getVideoResult(videoId: string) {
    const response = await this.client.get(`/videos/${videoId}/result`);
    return response.data;
  }

  async listVideos(page: number = 1, limit: number = 20) {
    const response = await this.client.get('/videos', {
      params: { page, limit },
    });
    return response.data;
  }

  async deleteVideo(videoId: string) {
    const response = await this.client.delete(`/videos/${videoId}`);
    return response.data;
  }

  // Feedback endpoints
  async submitFeedback(videoId: string, data: any) {
    const response = await this.client.post('/feedback', {
      videoId,
      ...data,
    });
    return response.data;
  }

  async getFeedbackStatistics() {
    const response = await this.client.get('/feedback/statistics');
    return response.data;
  }

  // Upload file to presigned URL
  async uploadFileToS3(presignedUrl: string, file: File, onProgress?: (progress: number) => void) {
    const response = await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          onProgress(progress);
        }
      },
    });
    return response.data;
  }

  getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message || 'An error occurred';
    }
    return 'An unexpected error occurred';
  }
}

export const apiClient = new ApiClient();
