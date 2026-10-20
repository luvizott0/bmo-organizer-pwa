import axios from 'axios'
import type { CalendarEvent, Project, Release, Reminder, Task, TaskComment, TaskStatus, DockerContainer, DockerContainersResponse } from '@/types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Attach Sanctum Bearer token and active Workspace from storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bmo_token') || localStorage.getItem('flux_auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const workspaceId = localStorage.getItem('bmo_workspace_id') || localStorage.getItem('flux_active_workspace_id')
  if (workspaceId) {
    config.headers['X-Workspace-Id'] = workspaceId
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem('bmo_token')
      localStorage.removeItem('flux_auth_token')
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      }
    }
    return Promise.reject(error)
  }
)



export const projectsApi = {
  list: async () => (await api.get<{ data: Project[] }>('/projects')).data.data,
  create: async (payload: Partial<Project>) => (await api.post<{ data: Project }>('/projects', payload)).data.data,
  update: async (id: number, payload: Partial<Project>) => (await api.put<{ data: Project }>(`/projects/${id}`, payload)).data.data,
  delete: async (id: number) => (await api.delete(`/projects/${id}`)).data,
}

export const tasksApi = {
  list: async (params?: { project_id?: number; status?: string }) =>
    (await api.get<{ data: Task[] }>('/tasks', { params })).data.data,
  inProgress: async () => (await api.get<{ data: Task[] }>('/tasks/in-progress')).data.data,
  create: async (payload: {
    project_id: number
    title: string
    description?: string
    type?: string
    priority?: string
    status?: string
    assignee_type?: string
    due_date?: string
  }) => (await api.post<{ data: Task }>('/tasks', payload)).data.data,
  update: async (id: number, payload: Partial<Task>) =>
    (await api.put<{ data: Task }>(`/tasks/${id}`, payload)).data.data,
  updateStatus: async (id: number, status: TaskStatus, order?: number) =>
    (await api.patch<{ data: Task }>(`/tasks/${id}/status`, { status, order })).data.data,
  delete: async (id: number) => (await api.delete(`/tasks/${id}`)).data,
}

export const taskCommentsApi = {
  list: async (taskId: number) =>
    (await api.get<{ data: TaskComment[] }>(`/tasks/${taskId}/comments`)).data.data,
  create: async (taskId: number, content: string) =>
    (await api.post<{ data: TaskComment }>(`/tasks/${taskId}/comments`, { content })).data.data,
  delete: async (taskId: number, commentId: number) =>
    (await api.delete(`/tasks/${taskId}/comments/${commentId}`)).data,
}

export const calendarApi = {
  list: async (start?: string, end?: string) =>
    (await api.get<{ data: CalendarEvent[] }>('/calendar-events', { params: { start, end } })).data.data,
  todaySummary: async () =>
    (await api.get<{ date: string; events: CalendarEvent[]; reminders: Reminder[] }>('/calendar-events/today-summary')).data,
  create: async (payload: Partial<CalendarEvent>) =>
    (await api.post<{ data: CalendarEvent }>('/calendar-events', payload)).data.data,
  update: async (id: number, payload: Partial<CalendarEvent>) =>
    (await api.put<{ data: CalendarEvent }>(`/calendar-events/${id}`, payload)).data.data,
  delete: async (id: number) => (await api.delete(`/calendar-events/${id}`)).data,
}

export const remindersApi = {
  list: async (completed?: boolean) =>
    (await api.get<{ data: Reminder[] }>('/reminders', { params: { completed } })).data.data,
  create: async (payload: Partial<Reminder>) =>
    (await api.post<{ data: Reminder }>('/reminders', payload)).data.data,
  toggle: async (id: number) => (await api.patch<{ data: Reminder }>(`/reminders/${id}/toggle`)).data.data,
  update: async (id: number, payload: Partial<Reminder>) =>
    (await api.put<{ data: Reminder }>(`/reminders/${id}`, payload)).data.data,
  delete: async (id: number) => (await api.delete(`/reminders/${id}`)).data,
}

export const releasesApi = {
  list: async (params?: { project_id?: number; status?: string }) =>
    (await api.get<{ data: Release[] }>('/releases', { params })).data.data,
  get: async (id: number) =>
    (await api.get<{ data: Release }>(`/releases/${id}`)).data.data,
  create: async (payload: {
    project_id: number
    version: string
    title: string
    description?: string
    task_ids?: number[]
  }) => (await api.post<{ data: Release }>('/releases', payload)).data.data,
  update: async (id: number, payload: Partial<Release> & { task_ids?: number[] }) =>
    (await api.put<{ data: Release }>(`/releases/${id}`, payload)).data.data,
  delete: async (id: number) => (await api.delete(`/releases/${id}`)).data,
  deploySandbox: async (id: number) =>
    (await api.post<{ message: string; result: any; release: Release }>(`/releases/${id}/deploy-sandbox`)).data,
  deployProduction: async (id: number) =>
    (await api.post<{ message: string; result: any; release: Release }>(`/releases/${id}/deploy-production`)).data,
}

export const systemApi = {
  getQuota: async () => (await api.get<import('@/types').QuotaStatus>('/system/quota')).data,
}

export const dockerApi = {
  list: async () => (await api.get<DockerContainersResponse>('/docker/containers')).data,
  start: async (idOrName: string) => (await api.post<{ message: string }>(`/docker/containers/${encodeURIComponent(idOrName)}/start`)).data,
  stop: async (idOrName: string) => (await api.post<{ message: string }>(`/docker/containers/${encodeURIComponent(idOrName)}/stop`)).data,
  restart: async (idOrName: string) => (await api.post<{ message: string }>(`/docker/containers/${encodeURIComponent(idOrName)}/restart`)).data,
  logs: async (idOrName: string, tail: number = 100) =>
    (await api.get<{ container: string; tail: number; logs: string }>(`/docker/containers/${encodeURIComponent(idOrName)}/logs`, { params: { tail } })).data,
}

