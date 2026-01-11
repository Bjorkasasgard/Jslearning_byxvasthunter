// frontend authentication utilities with CSRF support
async function fetchCsrfToken() {
  try {
    const res = await fetch('/api/csrf', { credentials: 'same-origin' });
    const data = await res.json();
    return data?.csrfToken || '';
  } catch (err) {
    console.warn('Could not fetch CSRF token', err);
    return '';
  }
}

async function postAuth(url, payload) {
  const csrfToken = await fetchCsrfToken();
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
    },
    body: JSON.stringify(payload),
  });
  let data;
  try {
    data = await res.json();
  } catch (_) {
    data = null;
  }
  if (!res.ok) {
    const msg = data?.message || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const params = new URLSearchParams(window.location.search);
  const next = params.get('next');

  try {
    const data = await postAuth('/api/auth/login', { email, password });
    const role = data.user && data.user.role;
    if (role === 'ADMIN') {
      window.location.href = '/admin/dashboard';
    } else {
      window.location.href = next || '/jobs';
    }
  } catch (err) {
    window.lastLoginError = err.message || 'Login failed';
    const errorDiv = document.getElementById('loginError');
    if (errorDiv) {
      errorDiv.textContent = window.lastLoginError;
      errorDiv.classList.remove('hidden');
    } else {
      alert(window.lastLoginError);
    }
  }
});

document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('registerError');
  if (errorDiv) errorDiv.classList.add('hidden');

  if (password.length < 6) {
    if (errorDiv) {
      errorDiv.textContent = 'Password must be at least 6 characters.';
      errorDiv.classList.remove('hidden');
    } else {
      alert('Password must be at least 6 characters.');
    }
    return;
  }

  try {
    const data = await postAuth('/api/auth/register', { name, email, password });
    if (data && data.user) {
      window.location.href = '/jobs';
    }
  } catch (err) {
    if (errorDiv) {
      errorDiv.textContent = err.message || 'Register failed';
      errorDiv.classList.remove('hidden');
    } else {
      alert(err.message || 'Register failed');
    }
  }
});

// Logout handler
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
  e.preventDefault();
  try {
    await postAuth('/api/auth/logout', {});
  } catch (_) {
    // ignore errors and force redirect
  }
  window.location.href = '/auth/login';
});
