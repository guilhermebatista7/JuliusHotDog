const API_BASE_URL = '/api';

async function apiRequest(path, options = {}) {
  const {
    redirectOnUnauthorized = true,
    ...requestOptions
  } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'same-origin',
    ...requestOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(requestOptions.headers || {})
    }
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login' && redirectOnUnauthorized) {
      window.location.href = '/login';
      return null;
    }

    throw new Error(payload?.message || 'Nao foi possivel concluir a operacao.');
  }

  return payload;
}

async function showAdminMenuItems() {
  const menus = document.querySelectorAll('[data-control-href]');
  if (!menus.length) return;

  try {
    const session = await apiRequest('/auth/me');
    if (session?.data?.role === 'admin') {
      menus.forEach((menu) => {
        const item = document.createElement('li');
        const link = document.createElement('a');

        link.href = menu.dataset.controlHref;
        link.textContent = 'CONTROLE';
        item.appendChild(link);
        menu.insertBefore(item, menu.querySelector('.cart-btn'));
      });
    }
  } catch (_error) {
    // No control link is created when the session cannot be confirmed.
  }
}

document.addEventListener('DOMContentLoaded', showAdminMenuItems);
