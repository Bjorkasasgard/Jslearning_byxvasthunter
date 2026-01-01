// api request utilities
async function apiRequest(url, method = "GET", data) {
  // Use cookie-based auth (httpOnly cookie). Send credentials so cookie is included.
  const init = {
    method,
    credentials: 'same-origin',
    headers: { "Content-Type": "application/json" },
  };

  if (data) init.body = JSON.stringify(data);

  // For mutating requests, fetch CSRF token and include in header
  const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
  if (mutating) {
    try {
      const tokenRes = await fetch('/api/csrf', { credentials: 'same-origin' });
      const tokenJson = await tokenRes.json();
      if (tokenJson?.csrfToken) {
        init.headers['x-csrf-token'] = tokenJson.csrfToken;
      }
    } catch (e) {
      console.warn('Could not fetch CSRF token', e);
    }
  }

  const res = await fetch(url, init);

  if (res.status === 401) {
    window.location.href = "/auth/login";
  }

  return res.json();
}
