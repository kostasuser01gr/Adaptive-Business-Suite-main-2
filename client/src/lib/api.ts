async function fetchAPI(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    credentials: 'include',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(data.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    me: () => fetchAPI('/api/auth/me'),
    login: (username: string, password: string) => fetchAPI('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
    register: (username: string, password: string, displayName?: string) => fetchAPI('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password, displayName }) }),
    logout: () => fetchAPI('/api/auth/logout', { method: 'POST' }),
  },
  user: {
    setMode: (mode: string) => fetchAPI('/api/user/mode', { method: 'PATCH', body: JSON.stringify({ mode }) }),
    setPreferences: (prefs: any) => fetchAPI('/api/user/preferences', { method: 'PATCH', body: JSON.stringify(prefs) }),
  },
  modules: {
    list: () => fetchAPI('/api/modules'),
    create: (data: any) => fetchAPI('/api/modules', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/api/modules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => fetchAPI(`/api/modules/${id}`, { method: 'DELETE' }),
  },
  chat: {
    list: () => fetchAPI('/api/chat'),
    send: (content: string) => fetchAPI('/api/chat', { method: 'POST', body: JSON.stringify({ content }) }),
  },
  vehicles: {
    list: () => fetchAPI('/api/vehicles'),
    create: (data: any) => fetchAPI('/api/vehicles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/api/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => fetchAPI(`/api/vehicles/${id}`, { method: 'DELETE' }),
  },
  customers: {
    list: () => fetchAPI('/api/customers'),
    create: (data: any) => fetchAPI('/api/customers', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/api/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => fetchAPI(`/api/customers/${id}`, { method: 'DELETE' }),
  },
  bookings: {
    list: () => fetchAPI('/api/bookings'),
    create: (data: any) => fetchAPI('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  maintenance: {
    list: () => fetchAPI('/api/maintenance'),
    create: (data: any) => fetchAPI('/api/maintenance', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/api/maintenance/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },
  tasks: {
    list: () => fetchAPI('/api/tasks'),
    create: (data: any) => fetchAPI('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => fetchAPI(`/api/tasks/${id}`, { method: 'DELETE' }),
  },
  notes: {
    list: () => fetchAPI('/api/notes'),
    create: (data: any) => fetchAPI('/api/notes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => fetchAPI(`/api/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => fetchAPI(`/api/notes/${id}`, { method: 'DELETE' }),
  },
  stats: () => fetchAPI('/api/stats'),
  suggestions: () => fetchAPI('/api/suggestions'),
  actions: () => fetchAPI('/api/actions'),
  modelConfig: {
    get: () => fetchAPI('/api/model-config'),
    update: (data: any) => fetchAPI('/api/model-config', { method: 'PATCH', body: JSON.stringify(data) }),
  },
  nexusUltra: {
    get: () => fetchAPI('/api/nexus-ultra'),
  },
};
