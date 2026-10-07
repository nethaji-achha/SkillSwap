const API_BASE_URL = '/api/v1';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('skillswap_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${cleanEndpoint}`;
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...this.getAuthHeader(),
      ...(options.headers as Record<string, string> || {})
    };

    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorData = await response.json();
          if (Array.isArray(errorData.detail)) {
            errorDetail = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
          } else if (typeof errorData.detail === 'string') {
            errorDetail = errorData.detail;
          } else if (errorData.message) {
            errorDetail = errorData.message;
          }
        } catch {
          // If response body is not JSON
        }

        if (!errorDetail) {
          switch (response.status) {
            case 400:
              errorDetail = 'Invalid request. Please check the provided information.';
              break;
            case 401:
              errorDetail = 'Please sign in again.';
              break;
            case 403:
              errorDetail = "You don't have permission to perform this action.";
              break;
            case 404:
              errorDetail = 'Information not found.';
              break;
            case 409:
              errorDetail = 'That action conflicts with existing data.';
              break;
            case 500:
              errorDetail = 'Something went wrong on the server. Please try again.';
              break;
            default:
              errorDetail = `Request failed with status ${response.status}`;
          }
        }

        throw new ApiError(errorDetail, response.status);
      }

      return await response.json();
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Network'))) {
        throw new ApiError('Unable to connect to Skill Swap. Please ensure backend is running.', 0);
      }
      throw new ApiError(error.message || 'Unable to connect to server.', 500);
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined)
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined)
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData
    });
  }
}

export const apiClient = new ApiClient();
