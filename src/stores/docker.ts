import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { DockerContainer } from '@/types'
import { dockerApi } from '@/api/client'

export const useDockerStore = defineStore('docker', () => {
  const containers = ref<DockerContainer[]>([])
  const meta = ref({
    total: 0,
    running: 0,
    stopped: 0,
  })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const actionInProgress = ref<Record<string, 'start' | 'stop' | 'restart' | null>>({})
  
  // Filters & Search
  const searchQuery = ref('')
  const selectedProjectFilter = ref('all')
  const selectedStatusFilter = ref<'all' | 'running' | 'stopped'>('all')
  const autoRefresh = ref(false)
  let refreshTimer: ReturnType<typeof setInterval> | null = null

  // Computed list of distinct projects
  const availableProjects = computed(() => {
    const set = new Set<string>()
    containers.value.forEach((c) => {
      if (c.project) set.add(c.project)
    })
    return Array.from(set).sort()
  })

  // Filtered containers
  const filteredContainers = computed(() => {
    return containers.value.filter((c) => {
      // Status filter
      if (selectedStatusFilter.value === 'running' && !c.is_running) return false
      if (selectedStatusFilter.value === 'stopped' && c.is_running) return false

      // Project filter
      if (selectedProjectFilter.value !== 'all' && c.project !== selectedProjectFilter.value) {
        return false
      }

      // Search query
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        const matchName = c.name.toLowerCase().includes(query)
        const matchProject = c.project.toLowerCase().includes(query)
        const matchImage = c.image.toLowerCase().includes(query)
        const matchService = c.service.toLowerCase().includes(query)
        const matchPort = c.ports.some((p) => p.toLowerCase().includes(query))
        if (!matchName && !matchProject && !matchImage && !matchService && !matchPort) {
          return false
        }
      }

      return true
    })
  })

  async function loadContainers(silent = false) {
    if (!silent) {
      loading.value = true
    }
    error.value = null
    try {
      const response = await dockerApi.list()
      containers.value = response.data
      meta.value = response.meta
    } catch (err: any) {
      console.error('Failed to load docker containers:', err)
      error.value = err.response?.data?.message || err.message || 'Erro ao carregar containers.'
    } finally {
      if (!silent) {
        loading.value = false
      }
    }
  }

  async function start(idOrName: string) {
    actionInProgress.value[idOrName] = 'start'
    try {
      await dockerApi.start(idOrName)
      await loadContainers(true)
      return { success: true }
    } catch (err: any) {
      console.error(`Failed to start container ${idOrName}:`, err)
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Falha ao iniciar container.',
      }
    } finally {
      actionInProgress.value[idOrName] = null
    }
  }

  async function stop(idOrName: string) {
    actionInProgress.value[idOrName] = 'stop'
    try {
      await dockerApi.stop(idOrName)
      await loadContainers(true)
      return { success: true }
    } catch (err: any) {
      console.error(`Failed to stop container ${idOrName}:`, err)
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Falha ao parar container.',
      }
    } finally {
      actionInProgress.value[idOrName] = null
    }
  }

  async function restart(idOrName: string) {
    actionInProgress.value[idOrName] = 'restart'
    try {
      await dockerApi.restart(idOrName)
      await loadContainers(true)
      return { success: true }
    } catch (err: any) {
      console.error(`Failed to restart container ${idOrName}:`, err)
      return {
        success: false,
        error: err.response?.data?.message || err.message || 'Falha ao reiniciar container.',
      }
    } finally {
      actionInProgress.value[idOrName] = null
    }
  }

  async function fetchLogs(idOrName: string, tail: number = 100) {
    try {
      const res = await dockerApi.logs(idOrName, tail)
      return res.logs
    } catch (err: any) {
      console.error(`Failed to fetch logs for ${idOrName}:`, err)
      return `Erro ao obter logs: ${err.response?.data?.message || err.message}`
    }
  }

  function setAutoRefresh(enabled: boolean, intervalMs = 8000) {
    autoRefresh.value = enabled
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
    if (enabled) {
      refreshTimer = setInterval(() => {
        loadContainers(true)
      }, intervalMs)
    }
  }

  function clearAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
    autoRefresh.value = false
  }

  return {
    containers,
    meta,
    loading,
    error,
    actionInProgress,
    searchQuery,
    selectedProjectFilter,
    selectedStatusFilter,
    autoRefresh,
    availableProjects,
    filteredContainers,
    loadContainers,
    start,
    stop,
    restart,
    fetchLogs,
    setAutoRefresh,
    clearAutoRefresh,
  }
})
