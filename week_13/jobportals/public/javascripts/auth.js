// frontend authtentication utilities
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  localStorage.setItem("token", data.token);
  // set cookie so server-side view auth middleware can read it
  document.cookie = `token=${data.token}; path=/`;
  const role = data.user && data.user.role;
  if (role === 'ADMIN') {
    window.location.href = '/admin/dashboard';
  } else {
    window.location.href = '/jobs';
  }
});

document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  window.location.href = "/auth/login";
});
