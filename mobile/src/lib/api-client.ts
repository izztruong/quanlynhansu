import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'hrm_token';
const API_PORT = 4000;

function resolveApiUrl() {
  // In Expo Go on a physical device, "localhost" resolves to the phone
  // itself, not the dev machine running the API. Derive the dev machine's
  // LAN IP from the address Metro used to serve this bundle instead.
  const hostUri: string | undefined =
    Constants.expoConfig?.hostUri ?? (Constants as { expoGoConfig?: { debuggerHost?: string } })
      .expoGoConfig?.debuggerHost;
  const host = hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:${API_PORT}/api/v1`;
}

export const API_URL = resolveApiUrl();

export const tokenStore = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await tokenStore.get();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? 'Đã xảy ra lỗi');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  get: <T,>(path: string) => request<{ data: T }>(path).then((r) => r.data),
  post: <T,>(path: string, body?: unknown) =>
    request<{ data: T } | undefined>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }).then((r) => r?.data as T),
  put: <T,>(path: string, body?: unknown) =>
    request<{ data: T } | undefined>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }).then((r) => r?.data as T),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};

/** Login is the one endpoint whose response carries a top-level `token`
 * alongside `data`, so it can't reuse the generic `api.post` helper above. */
export function login<T>(email: string, password: string) {
  return request<{ data: T; token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, platform: 'mobile' }),
  });
}
