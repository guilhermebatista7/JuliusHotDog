const API_BASE_URL = '/api';

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      window.location.href = '/login';
      return null;
    }

    throw new Error(payload?.message || 'Nao foi possivel concluir a operacao.');
  }

  return payload;
}
