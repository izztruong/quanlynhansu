const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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

async function upload<T>(path: string, file: File, folder: string): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  // No Content-Type header here on purpose — the browser sets
  // multipart/form-data with the correct boundary itself.
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? 'Đã xảy ra lỗi');
  }

  const result: { data: T } = await res.json();
  return result.data;
}

async function uploadFile<T>(path: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? 'Đã xảy ra lỗi');
  }

  const result: { data: T } = await res.json();
  return result.data;
}

async function downloadFile(path: string, filename: string): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, { credentials: 'include' });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(body.message ?? 'Đã xảy ra lỗi');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const api = {
  get: <T>(path: string) => request<{ data: T }>(path).then((r) => r.data),
  upload: <T>(file: File, folder: string) => upload<T>('/uploads', file, folder),
  uploadFile: <T>(path: string, file: File) => uploadFile<T>(path, file),
  downloadFile: (path: string, filename: string) => downloadFile(path, filename),
  post: <T>(path: string, body?: unknown) =>
    request<{ data: T } | undefined>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }).then((r) => r?.data as T),
  put: <T>(path: string, body?: unknown) =>
    request<{ data: T } | undefined>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }).then((r) => r?.data as T),
  patch: <T>(path: string, body?: unknown) =>
    request<{ data: T } | undefined>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }).then((r) => r?.data as T),
  delete: (path: string) => request<void>(path, { method: 'DELETE' }),
};
