const BASE = '/api';

// Helper to build fetch options
function buildOptions(method, data, extra = {}) {
  const opts = {
    method,
    credentials: 'include',
    headers: {}
  };
  if (data instanceof FormData) {
    opts.body = data; // fetch sets correct multipart headers automatically
  } else if (data !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(data);
  }
  return { ...opts, ...extra };
}

// PUBLIC_INTERFACE
export async function get(path, extra = {}) {
  /** Perform GET request to backend API. */
  const res = await fetch(`${BASE}${path}`, buildOptions('GET', undefined, extra));
  if (!res.ok) {
    let msg = 'Request failed';
    try { const j = await res.json(); msg = j.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// PUBLIC_INTERFACE
export async function post(path, data, extra = {}) {
  /** Perform POST request to backend API. */
  const res = await fetch(`${BASE}${path}`, buildOptions('POST', data, extra));
  if (!res.ok) {
    let msg = 'Request failed';
    try { const j = await res.json(); msg = j.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export default { get, post };
