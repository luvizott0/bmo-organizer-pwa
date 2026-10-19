import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
      done: [],
    }
    filteredTasks.value.forEach((task) => {
      if (map[task.status]) {
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

  async function addProject(payload: Partial<Project>) {
    const created = await projectsApi.create(payload)
    projects.value.push(created)
    selectedProjectId.value = created.id
    return created
  }

  async function addTask(payload: {
    project_id: number
    title: string
    description?: string
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
    addTask,
    updateTaskStatus,
  }
})
