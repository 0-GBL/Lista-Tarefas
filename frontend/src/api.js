// comentario

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || 'Não foi possível concluir a ação.');
  }
  return response.status === 204 ? null : response.json();
}

export const tasksApi = {
  list: () => request('/tasks'),
  create: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id, task) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
  toggle: (id) => request(`/tasks/${id}/toggle`, { method: 'PATCH' }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' })
};
