import { useAuthStore } from '@/store/authStore';
import type { ApiResponse } from '@shared/types';

const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, unknown>;
}

function buildUrl(url: string, params?: Record<string, unknown>): string {
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  
  if (!params || Object.keys(params).length === 0) {
    return fullUrl;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return `${fullUrl}?${searchParams.toString()}`;
}

function getToken(): string | null {
  const state = useAuthStore.getState();
  return state.token;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { params, ...fetchOptions } = options;
  const fullUrl = buildUrl(url, params);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  const token = getToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().logout();
      }
      const err = new Error(data.message || '请求失败');
      (err as any).data = data.data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络错误，请检查网络连接');
  }
}

export const api = {
  get<T>(url: string, params?: Record<string, unknown>, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(url, { ...options, method: 'GET', params });
  },

  post<T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put<T>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>(url, { ...options, method: 'DELETE' });
  },
};

export default api;
