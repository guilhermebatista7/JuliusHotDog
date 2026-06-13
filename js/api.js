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

async function showAdminMenuItems() {
  const adminMenuItems = document.querySelectorAll('[data-admin-only]');
  if (!adminMenuItems.length) return;

  try {
    const session = await apiRequest('/auth/me');
    if (session?.data?.role === 'admin') {
      adminMenuItems.forEach((item) => {
        item.hidden = false;
      });
    }
  } catch (_error) {
    // The menu remains hidden when the session cannot be confirmed.
  }
}

document.addEventListener('DOMContentLoaded', showAdminMenuItems);
