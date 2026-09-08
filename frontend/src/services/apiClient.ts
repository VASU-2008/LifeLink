const BASE_URL = '/api';

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export const apiClient = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('lifelink_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If unauthorized, clear stored token
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('lifelink_token');
      localStorage.removeItem('lifelink_user');
    }
    throw new ApiError(data.message || `Request failed with status ${response.status}`, response.status, data);
  }

  return data as T;
};
