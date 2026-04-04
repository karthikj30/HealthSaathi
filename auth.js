const AUTH_STORAGE_KEY = "healthsaathi_auth";
const AUTH_USER_KEY = "healthsaathi_user";
const AUTH_ROLE_KEY = "healthsaathi_role";

function isAuthenticated() {
  return localStorage.getItem(AUTH_STORAGE_KEY) === "1";
}

function ensureAuthenticated() {
  if (!isAuthenticated()) {
    window.location.href = "login.html";
  }
}

function getDashboardPathByRole(role = getCurrentRole()) {
  return role === "doctor" ? "doctor.html" : "index.html";
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    "x-user-email": getCurrentUser().toLowerCase(),
    "x-user-role": getCurrentRole(),
  };
}

async function login(email, password, role = "patient") {
  if (!email || !password) {
    return { ok: false, error: "Email and password are required" };
  }

  const normalizedRole = role === "doctor" ? "doctor" : "patient";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        role: normalizedRole,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      return { ok: false, error: errorBody?.error || "Unexpected server error" };
    }

    const result = await response.json();
    if (!result?.ok || !result?.user?.email) {
      return { ok: false, error: result?.error || "Invalid auth response" };
    }

    localStorage.setItem(AUTH_STORAGE_KEY, "1");
    localStorage.setItem(AUTH_USER_KEY, result.user.email);
    localStorage.setItem(AUTH_ROLE_KEY, result.user.role || normalizedRole);
    return { ok: true, user: result.user };
  } catch (error) {
    return { ok: false, error: error.message || "Network error" };
  }

}

async function register(email, password, role = "patient") {
  if (!email || !password) {
    return { ok: false, error: "Email and password are required" };
  }

  const normalizedRole = role === "doctor" ? "doctor" : "patient";

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        role: normalizedRole,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      return { ok: false, error: errorBody?.error || "Signup failed" };
    }

    const result = await response.json();
    if (!result?.ok || !result?.user?.email) {
      return { ok: false, error: result?.error || "Invalid response" };
    }

    return { ok: true, user: result.user };
  } catch (error) {
    return { ok: false, error: error.message || "Network error" };
  }
}

function logout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_ROLE_KEY);
  window.location.href = "login.html";
}

function getCurrentUser() {
  return localStorage.getItem(AUTH_USER_KEY) || "Patient";
}

function getCurrentRole() {
  return localStorage.getItem(AUTH_ROLE_KEY) || "patient";
}

function getDisplayIdentity() {
  const role = getCurrentRole();
  const roleTitle = role === "doctor" ? "Doctor" : "Patient";
  return `${roleTitle}: ${getCurrentUser()}`;
}

window.HealthSaathiAuth = {
  isAuthenticated,
  ensureAuthenticated,
  getDashboardPathByRole,
  login,
  register,
  logout,
  getCurrentUser,
  getCurrentRole,
  getDisplayIdentity,
  getAuthHeaders,
};
