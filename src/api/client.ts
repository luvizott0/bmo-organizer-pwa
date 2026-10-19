import axios from 'axios'
import type { CalendarEvent, Project, Reminder, Task, TaskStatus } from '@/types'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Attach Sanctum Bearer token and active Workspace from storage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bmo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const workspaceId = localStorage.getItem('bmo_workspace_id')
  if (workspaceId) {
    config.headers['X-Workspace-Id'] = workspaceId
  }
  return config
})

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
