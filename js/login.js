async function handleLogin(event) {
  event.preventDefault();

  const payload = {
    email: document.getElementById('login-email').value,
    password: document.getElementById('login-password').value
  };

  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response) return;

    localStorage.setItem('julios_user', JSON.stringify(response.data));
    alert(`Bem-vindo, ${response.data.name}!`);
    window.location.href = '../index.html';
  } catch (error) {
    alert(error.message);
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const payload = {
    name: document.getElementById('register-name').value,
    email: document.getElementById('register-email').value,
    phone: document.getElementById('register-phone').value,
    password: document.getElementById('register-password').value
  };

  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response) return;

    alert('Conta criada com sucesso! Agora faca seu login.');
    document.getElementById('register-form').reset();
    toggleCard();
  } catch (error) {
    alert(error.message);
  }
}

async function handleLogout() {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
      redirectOnUnauthorized: false
    });
  } catch (_error) {
    // The local session data is cleared even if the server session already expired.
  }

  localStorage.removeItem('julios_user');
  window.location.reload();
}

async function loadAccount() {
  const loginContainer = document.getElementById('loginContainer');
  const accountContainer = document.getElementById('accountContainer');

  try {
    const response = await apiRequest('/auth/me', {
      redirectOnUnauthorized: false
    });

    document.getElementById('accountName').textContent = response.data.name;
    accountContainer.hidden = false;
  } catch (_error) {
    loginContainer.hidden = false;
  }
}

document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('register-form').addEventListener('submit', handleRegister);
document.getElementById('logoutButton').addEventListener('click', handleLogout);

loadAccount();
