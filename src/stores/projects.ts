import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Project, Task, TaskStatus } from '@/types'
import { projectsApi, tasksApi } from '@/api/client'

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const tasks = ref<Task[]>([])
  const selectedProjectId = ref<number | null>(null)
  const loading = ref(false)

  const selectedProject = computed(() =>
    projects.value.find((p) => p.id === selectedProjectId.value) || null
  )

  const filteredTasks = computed(() => {
    if (!selectedProjectId.value) return tasks.value
    return tasks.value.filter((t) => t.project_id === selectedProjectId.value)
  })

  // Columns grouping for the Kanban Board
  const tasksByStatus = computed(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      review: [],
      reviewed: [],
      done: [],
    }
    filteredTasks.value.forEach((task) => {
      if (task.status === 'backlog') {
        map.todo.push(task)
      } else if (map[task.status]) {
        map[task.status].push(task)
      } else {
        map.todo.push(task)
      }
    })
    return map
  })

  async function loadProjects() {
    loading.value = true
    try {
      projects.value = await projectsApi.list()
      if (projects.value.length > 0 && selectedProjectId.value === null) {
        selectedProjectId.value = projects.value[0]?.id ?? null
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadTasks() {
    loading.value = true
    try {
      tasks.value = await tasksApi.list({
        project_id: selectedProjectId.value || undefined,
      })
    } catch (err) {
      console.error('Failed to load tasks:', err)
    } finally {
      loading.value = false
    }
  }

  // Automatically reload tasks when project selection changes
  watch(selectedProjectId, async (newId: number | null, oldId: number | null) => {
    if (newId !== oldId && newId !== null && newId !== undefined) {
      await loadTasks()
    }
  })

  async function addProject(payload: Partial<Project>) {
    const created = await projectsApi.create(payload)
    projects.value.push(created)
    selectedProjectId.value = created.id
    return created
  }

  async function updateProject(id: number, payload: Partial<Project>) {
    const updated = await projectsApi.update(id, payload)
    const idx = projects.value.findIndex((p) => p.id === id)
    if (idx !== -1) {
      projects.value[idx] = updated
    }
    return updated
  }

  async function deleteProject(id: number) {
    await projectsApi.delete(id)
    projects.value = projects.value.filter((p) => p.id !== id)
    if (selectedProjectId.value === id) {
      selectedProjectId.value = projects.value[0]?.id ?? null
    }
  }

  async function addTask(payload: {
    project_id: number
    title: string
    description?: string
    type?: string
    priority?: string
    status?: string
    assignee_type?: string
    due_date?: string
  }) {
    const created = await tasksApi.create(payload)
    tasks.value.unshift(created)
    return created
  }

  async function updateTaskStatus(taskId: number, newStatus: TaskStatus) {
    // Optimistic UI update
    const task = tasks.value.find((t) => t.id === taskId)
    if (task) {
      const oldStatus = task.status
      task.status = newStatus
      try {
        const updated = await tasksApi.updateStatus(taskId, newStatus)
        Object.assign(task, updated)
      } catch (err) {
        task.status = oldStatus
        console.error('Failed to update task status:', err)
      }
    }
  }

  async function updateTask(id: number, payload: Partial<Task>) {
    const updated = await tasksApi.update(id, payload)
    const idx = tasks.value.findIndex((t) => t.id === id)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], ...updated }
    }
    return updated
  }

  async function deleteTask(id: number) {
    await tasksApi.delete(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  return {
    projects,
    tasks,
    selectedProjectId,
    selectedProject,
    filteredTasks,
    tasksByStatus,
    loading,
    loadProjects,
    loadTasks,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
  }
})

