'use client';

/**
 * 🪝 useApi Hook - Generic API hook with React Query
 */

import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import api, { ApiException } from '@/lib/api/client';

// ============ Query Hook ============

interface UseApiQueryOptions<T> extends Omit<UseQueryOptions<T, ApiException>, 'queryKey' | 'queryFn'> {
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Hook for GET requests with caching
 */
export function useApiQuery<T>(
  key: string | string[],
  endpoint: string,
  options?: UseApiQueryOptions<T>
) {
  const { params, ...queryOptions } = options || {};
  const queryKey = Array.isArray(key) ? key : [key];

  return useQuery<T, ApiException>({
    queryKey: params ? [...queryKey, params] : queryKey,
    queryFn: async () => {
      const { data } = await api.get<T>(endpoint, params);
      return data;
    },
    ...queryOptions,
  });
}

// ============ Mutation Hook ============

interface UseApiMutationOptions<TData, TVariables> 
  extends Omit<UseMutationOptions<TData, ApiException, TVariables>, 'mutationFn'> {}

/**
 * Hook for POST/PUT/PATCH/DELETE requests
 */
export function useApiMutation<TData, TVariables = unknown>(
  method: 'post' | 'put' | 'patch' | 'delete',
  endpoint: string | ((variables: TVariables) => string),
  options?: UseApiMutationOptions<TData, TVariables>
) {
  return useMutation<TData, ApiException, TVariables>({
    mutationFn: async (variables) => {
      const url = typeof endpoint === 'function' ? endpoint(variables) : endpoint;
      
      let response;
      switch (method) {
        case 'post':
          response = await api.post<TData>(url, variables);
          break;
        case 'put':
          response = await api.put<TData>(url, variables);
          break;
        case 'patch':
          response = await api.patch<TData>(url, variables);
          break;
        case 'delete':
          response = await api.delete<TData>(url);
          break;
      }
      
      return response.data;
    },
    ...options,
  });
}

// ============ Specific Mutation Hooks ============

export function useApiPost<TData, TVariables = unknown>(
  endpoint: string | ((variables: TVariables) => string),
  options?: UseApiMutationOptions<TData, TVariables>
) {
  return useApiMutation<TData, TVariables>('post', endpoint, options);
}

export function useApiPut<TData, TVariables = unknown>(
  endpoint: string | ((variables: TVariables) => string),
  options?: UseApiMutationOptions<TData, TVariables>
) {
  return useApiMutation<TData, TVariables>('put', endpoint, options);
}

export function useApiPatch<TData, TVariables = unknown>(
  endpoint: string | ((variables: TVariables) => string),
  options?: UseApiMutationOptions<TData, TVariables>
) {
  return useApiMutation<TData, TVariables>('patch', endpoint, options);
}

export function useApiDelete<TData>(
  endpoint: string | ((variables: unknown) => string),
  options?: UseApiMutationOptions<TData, unknown>
) {
  return useApiMutation<TData, unknown>('delete', endpoint, options);
}
