// api request utilities
async function apiRequest(url, method = "GET", data) {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (res.status === 401) {
    window.location.href = "/auth/login";
  }

  return res.json();
}
