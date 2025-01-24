import { GeoPoint, LoginCredentials, NewsCreate, NewsUpdate, User } from '@/types/ApiTypes';
import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';

export class API {
  private static instance: API | null = null;
  private baseURL: string;
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;

  private constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true, // Enable sending cookies with requests
    });

    // Add interceptor to include token in requests
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        await this.refreshTokenIfNeeded();
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        // Check if error is 401/403, it's not a refresh token request, and request hasn't been retried yet
        if ((error.response?.status === 401 || error.response?.status === 403) && 
            originalRequest && 
            originalRequest.url !== '/auth/refresh' &&
            !(originalRequest as any)._retry) { // Add retry flag check
          try {
            (originalRequest as any)._retry = true; // Mark request as retried
            
            // Get new access token using httpOnly refresh token cookie
            const response = await this.axiosInstance.post<{ access_token: string }>('/auth/refresh');
            const newAccessToken = response.data.access_token;
            
            // Update access token
            this.setAccessToken(newAccessToken);
            
            // Retry the original request with new token
            if (originalRequest && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.axiosInstance(originalRequest as AxiosRequestConfig);
            }
            return Promise.reject(error);
          } catch (refreshError) {
            // If refresh fails, clear access token and redirect to login
            this.clearAccessToken();
            throw refreshError;
          }
        }
        throw error;
      }
    );
  }

  // Static method to get instance
  public static getInstance(): API {
    if (!API.instance) {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010';
      API.instance = new API(baseURL);
      
      // Only load tokens if we're in the browser
      if (typeof window !== 'undefined') {
        API.instance.loadTokensFromStorage();
      }
    }
    return API.instance;
  }

  // Token management methods
  private setAccessToken(token: string): void {
    this.accessToken = token;
    // Only store in localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  private clearAccessToken(): void {
    this.accessToken = null;
    // Only clear localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  public loadTokensFromStorage(): void {
    // Only access localStorage if we're in the browser
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        this.accessToken = accessToken;
      }
    }
  }

  // Authentication
  public async login(credentials: LoginCredentials): Promise<void> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await this.axiosInstance.post<{ access_token: string }>('/auth/login', formData);
    this.setAccessToken(response.data.access_token);
    // Refresh token is automatically handled by the browser in httpOnly cookie
  }

  public async logout(): Promise<void> {
    try {
      await this.axiosInstance.post('/auth/logout');
    } finally {
      this.clearAccessToken();
    }
  }

  // News Service endpoints
  public async getNews(skip = 0, limit = 100, startDate?: Date, endDate?: Date) {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(startDate && { start_date: startDate.toISOString() }),
      ...(endDate && { end_date: endDate.toISOString() }),
    });

    return this.axiosInstance.get(`/news?${params}`);
  }

  public async getNewsByGeoIDs(geoIDs: string[]) {
    const params = new URLSearchParams({
      geo_ids: geoIDs.join(','),
    });

    return this.axiosInstance.get(`/news-by-geodata?${params}`);
  }

  public async createNews(newsData: NewsCreate) {
    return this.axiosInstance.post('/news', newsData);
  }

  public async updateNews(newsId: number, updateData: NewsUpdate) {
    return this.axiosInstance.put(`/news/${newsId}`, updateData);
  }

  public async deleteNews(newsId: number) {
    return this.axiosInstance.delete(`/news/${newsId}`);
  }

  // Geo Service endpoints
  public async createGeoPoint(point: GeoPoint) {
    return this.axiosInstance.post('/points', point);
  }

  public async getPointsInRadius(latitude: number, longitude: number, radius: number) {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
    });

    return this.axiosInstance.get(`/points/radius?${params}`);
  }

  // User Service endpoints
  public async getCurrentUser(): Promise<AxiosResponse<User>> {
    return this.axiosInstance.get('/users/me');
  }

  public async updateCurrentUser(nickname?: string, password?: string) {
    return this.axiosInstance.patch('/users/me', {
      ...(nickname && { nickname }),
      ...(password && { password }),
    });
  }

  public async getAllUsers(skip = 0, limit = 100) {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
    });

    return this.axiosInstance.get(`/users/all?${params}`);
  }

  private isTokenExpired(token: string): boolean {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp;
    const now = Math.floor(Date.now() / 1000);
    return now >= expiry;
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    if (this.accessToken && this.isTokenExpired(this.accessToken)) {
      try {
        const response = await this.axiosInstance.post<{ access_token: string }>('/auth/refresh');
        this.setAccessToken(response.data.access_token);
      } catch (error) {
        this.clearAccessToken();
        throw new Error('Failed to refresh token');
      }
    }
  }
}

// Create and export default instance
export default API.getInstance();