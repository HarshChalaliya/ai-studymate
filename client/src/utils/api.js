// Centralized API Helper for AI StudyMate Frontend

const BACKEND_BASE = "http://localhost:5000";

export async function apiFetch(endpoint, options = {}) {
  const isAbsolute = endpoint.startsWith("http");
  const relativeUrl = isAbsolute ? endpoint : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const absoluteUrl = isAbsolute ? endpoint : `${BACKEND_BASE}/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  // Try relative URL first (Vite proxy)
  try {
    const res = await fetch(relativeUrl, options);
    if (res.ok || res.status < 500) {
      return res;
    }
  } catch (err) {
    // Relative fetch failed, fall through to absolute URL
  }

  // Try absolute URL (Direct backend)
  try {
    const res = await fetch(absoluteUrl, options);
    return res;
  } catch (err) {
    // Retry once after 800ms in case backend was starting up
    await new Promise((r) => setTimeout(r, 800));
    return await fetch(absoluteUrl, options);
  }
}
