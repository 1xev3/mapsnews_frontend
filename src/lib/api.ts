import { GeoPoint, LoginCredentials, NewsCreate, NewsUpdate, User, GeoPointResponse, NewsResponseWithGeoPoint, RegisterCredentials, NewsResponse } from '@/types/ApiTypes';
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
      withCredentials: true,
    });

    this.initializeRequestInterceptor();
    this.initializeResponseInterceptor();
  }

  // Initialize request interceptor to attach access token
  private initializeRequestInterceptor() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Initialize response interceptor to handle token refresh
  private initializeResponseInterceptor() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        if (
          (error.response?.status === 401 || error.response?.status === 403) &&
          !originalRequest._retry &&
          originalRequest.url !== '/auth/refresh'
        ) {
          originalRequest._retry = true;
          
          try {
            console.log("Refreshing token");
            const response = await this.axiosInstance.post<{ access_token: string }>(
              '/auth/refresh',
              {},
              { headers: {} }
            );
            this.setAccessToken(response.data.access_token);
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            }
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.clearAccessToken();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Static method to get singleton instance
  public static getInstance(): API {
    if (!API.instance) {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010';
      API.instance = new API(baseURL);
      
      if (typeof window !== 'undefined') {
        API.instance.loadTokensFromStorage();
      }
    }
    return API.instance;
  }

  // Set access token and store it if in browser
  private setAccessToken(token: string): void {
    this.accessToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  // Clear access token and remove it from storage if in browser
  private clearAccessToken(): void {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  // Load tokens from localStorage if available
  public loadTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        this.accessToken = accessToken;
      }
    }
  }

  // Authentication Methods
  public async login(credentials: LoginCredentials): Promise<void> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await this.axiosInstance.post<{ access_token: string }>('/auth/login', formData);
    this.setAccessToken(response.data.access_token);
    // Refresh token is automatically handled by the browser in httpOnly cookie
  }

  public async register(credentials: RegisterCredentials): Promise<void> {
    await this.axiosInstance.post('/auth/register', credentials);
  }

  public async logout(): Promise<void> {
    try {
      await this.axiosInstance.post('/auth/logout');
    } finally {
      this.clearAccessToken();
    }
  }

  // News Service Endpoints
  public async getNews(skip = 0, limit = 100, startDate?: Date, endDate?: Date): Promise<AxiosResponse<NewsResponse[]>> {
    const params = this.buildQueryParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(startDate && { start_date: startDate.toISOString() }),
      ...(endDate && { end_date: endDate.toISOString() }),
    });

    return this.axiosInstance.get(`/news?${params}`);
  }

  public async getNewsByGeoIDs(geoIDs: string[]): Promise<AxiosResponse<NewsResponse[]>> {
    const params = this.buildQueryParams({
      geo_ids: geoIDs.join(','),
    });

    return this.axiosInstance.get(`/news-by-geodata?${params}`);
  }

  public async createNews(newsData: NewsCreate): Promise<AxiosResponse<NewsResponse>> {
    return this.axiosInstance.post('/news', newsData);
  }

  public async updateNews(newsId: number, updateData: NewsUpdate): Promise<AxiosResponse<NewsResponse>> {
    return this.axiosInstance.put(`/news/${newsId}`, updateData);
  }

  public async deleteNews(newsId: number): Promise<AxiosResponse<void>> {
    return this.axiosInstance.delete(`/news/${newsId}`);
  }

  // Geo Service Endpoints
  public async createGeoPoint(point: GeoPoint): Promise<AxiosResponse<GeoPointResponse>> {
    return this.axiosInstance.post('/points', point);
  }

  public async getGeoPointByID(pointId: string): Promise<AxiosResponse<GeoPointResponse>> {
    return this.axiosInstance.get(`/points/id/${pointId}`);
  }

  public async getPointsInRadius(latitude: number, longitude: number, radius: number): Promise<AxiosResponse<GeoPointResponse[]>> {
    const params = this.buildQueryParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
    });

    return this.axiosInstance.get(`/points/radius?${params}`);
  }

  public async getNewsInRadius(
    latitude: number, 
    longitude: number, 
    radius: number, 
    startDate?: Date | null, 
    endDate?: Date | null,
    tags?: string[]
  ): Promise<AxiosResponse<NewsResponseWithGeoPoint[]>> {
    const params = this.buildQueryParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
      ...(startDate && { start_date: startDate.toISOString() }),
      ...(endDate && { end_date: endDate.toISOString() }),
      ...(tags && tags.length > 0 && { tags: tags.join(',') })
    });

    return this.axiosInstance.get(`/news-by-radius?${params}`);
  }

  // User Service Endpoints
  public async getCurrentUser(): Promise<AxiosResponse<User>> {
    return this.axiosInstance.get('/users/me', { timeout: 5000 });
  }

  public async updateCurrentUser(nickname?: string, password?: string): Promise<AxiosResponse<User>> {
    return this.axiosInstance.patch('/users/me', {
      ...(nickname && { nickname }),
      ...(password && { password }),
    });
  }

  public async getAllUsers(skip = 0, limit = 100, email?: string): Promise<AxiosResponse<User[]>> {
    const params = this.buildQueryParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(email && { email }),
    });

    return this.axiosInstance.get(`/users/all?${params}`);
  }

  public async getUserByID(user_id: number): Promise<AxiosResponse<User>> {
    return this.axiosInstance.get(`/users/all/${user_id}`);
  }

  public async getUserGroups(): Promise<AxiosResponse<{ id: number; name: string }[]>> {
    return this.axiosInstance.get('/groups');
  }

  public async updateUser(user_id: number, data: { 
    nickname?: string; 
    password?: string; 
    group_id?: number;
    email?: string;
    is_active?: boolean;
  }): Promise<AxiosResponse<User>> {
    return this.axiosInstance.patch(`/users/all/${user_id}`, data);
  }

  public async getNewsTags(): Promise<AxiosResponse<string[]>> {
    return this.axiosInstance.get('/news-tags');
  }

  // Utility method to build query parameters
  private buildQueryParams(params: Record<string, string>): string {
    return new URLSearchParams(params).toString();
  }
}

// Create and export default instance
export default API.getInstance();