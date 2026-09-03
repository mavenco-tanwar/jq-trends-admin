import { vi } from 'vitest';
import type { ApiResponse } from '@/services/api';

export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  request: vi.fn(),
};

export function createApiResponse<T>(data: T, success: boolean = true, message?: string): ApiResponse<T> {
  return {
    data,
    success,
    message,
    meta: { timestamp: new Date().toISOString() },
  };
}

export function resetApiClientMocks() {
  mockApiClient.get.mockReset();
  mockApiClient.post.mockReset();
  mockApiClient.put.mockReset();
  mockApiClient.patch.mockReset();
  mockApiClient.delete.mockReset();
  mockApiClient.request.mockReset();
}
