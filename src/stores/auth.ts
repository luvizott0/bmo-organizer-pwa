import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/client'
import type { User, Workspace } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(
    localStorage.getItem('bmo_token') || localStorage.getItem('flux_auth_token') || null
  )
  const activeWorkspaceId = ref<string | null>(
    localStorage.getItem('bmo_workspace_id') || localStorage.getItem('flux_active_workspace_id') || null
  )
  const user = ref<User | null>(null)
  const workspaces = ref<Workspace[]>([])
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  function setAuth(authToken: string, userData: User, workspaceList: Workspace[] = []) {
    token.value = authToken
    user.value = userData
    workspaces.value = workspaceList

    localStorage.setItem('bmo_token', authToken)
    localStorage.setItem('flux_auth_token', authToken)

    if (workspaceList[0]?.id && !activeWorkspaceId.value) {
      const firstId = String(workspaceList[0].id)
      activeWorkspaceId.value = firstId
      localStorage.setItem('bmo_workspace_id', firstId)
      localStorage.setItem('flux_active_workspace_id', firstId)
    }

  }

  function clearAuth() {
    token.value = null
    user.value = null
    workspaces.value = []
    activeWorkspaceId.value = null
    localStorage.removeItem('bmo_token')
    localStorage.removeItem('flux_auth_token')
    localStorage.removeItem('bmo_workspace_id')
    localStorage.removeItem('flux_active_workspace_id')
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const response = await api.post<{
        message: string
        user: User
        workspaces: Workspace[]
        token: string
      }>('/auth/login', {
        email,
        password,
        device_name: 'bmo-organizer-pwa',
      })

      const data = response.data
      setAuth(data.token, data.user, data.workspaces)
      return data
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await api.post('/auth/logout')
      }
    } catch (e) {
      console.warn('Erro ao deslogar da API:', e)
    } finally {
      clearAuth()
    }
  }

  async function fetchMe() {
    if (!token.value) return false
    try {
      const response = await api.get<{
        user: User
        workspaces: Workspace[]
      }>('/auth/me')
      user.value = response.data.user
      workspaces.value = response.data.workspaces
      return true
    } catch (err: any) {
      if (err.response?.status === 401) {
        clearAuth()
      }
      return false
    }
  }

  return {
    token,
    user,
    workspaces,
    activeWorkspaceId,
    loading,
    isAuthenticated,
    login,
    logout,
    fetchMe,
    setAuth,
    clearAuth,
  }
})
