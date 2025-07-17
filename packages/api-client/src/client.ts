import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiClientConfig, defaultConfig } from './config';
import { ApiRequestOptions, ApiError } from './types';
// import { handleApiError, createSuccessResponse, createErrorResponse } from '@infinite-realty-hub/utils';

/**
 * Handle API errors (temporary implementation)
 */
const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

/**
 * API Client class
 */
export class ApiClient {
  private instance: AxiosInstance;
  private config: ApiClientConfig;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });

    this.setupInterceptors();
  }

  /**
   * Set up request/response interceptors
   */
  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      config => {
        // Add auth token if available
        if (this.config.authToken) {
          config.headers = config.headers || {};
          config.headers['Authorization'] = `Bearer ${this.config.authToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      response => response,
      error => {
        const apiError: ApiError = {
          message: handleApiError(error),
          code: error.code,
          status: error.response?.status,
          details: error.response?.data,
        };
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method: options.method || 'GET',
      url: endpoint,
      headers: options.headers,
      params: options.params,
      data: options.data,
    };

    const response: AxiosResponse<T> = await this.instance.request(config);
    return response.data;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', data });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', data });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', data });
  }

  /**
   * Set auth token
   */
  setAuthToken(token: string) {
    this.config.authToken = token;
  }

  /**
   * Clear auth token
   */
  clearAuthToken() {
    this.config.authToken = undefined;
  }

  /**
   * Get current config
   */
  getConfig(): ApiClientConfig {
    return this.config;
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<ApiClientConfig>) {
    this.config = { ...this.config, ...config };
    // Update axios instance with new config
    this.instance.defaults.baseURL = this.config.baseURL;
    this.instance.defaults.timeout = this.config.timeout;
    this.instance.defaults.headers = {
      ...this.instance.defaults.headers,
      ...this.config.headers,
    };
  }
}

/**
 * Create default API client instance
 */
export const createApiClient = (
  config?: Partial<ApiClientConfig>
): ApiClient => {
  return new ApiClient(config);
};

/**
 * Default API client instance
 */
export const apiClient = createApiClient();
