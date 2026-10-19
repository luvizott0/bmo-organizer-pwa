<template>
  <!-- Full-screen dedicated layout for Login -->
  <div v-if="isAuthRoute || !authStore.isAuthenticated" class="min-h-screen w-screen bg-[#f8f6f1] flex flex-col justify-center items-center">
    <RouterView />
  </div>

  <!-- Authenticated App Shell with Sidebar -->
  <div v-else class="flex h-screen w-screen overflow-hidden bg-[#f8f6f1] text-[#333333] font-sans">
    <AppSidebar />
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8f6f1]">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { useCalendarStore } from '@/stores/calendar'

const route = useRoute()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const calendarStore = useCalendarStore()

const isAuthRoute = computed(() => route.name === 'login' || route.path === '/login')

async function loadAppData() {
  if (!authStore.isAuthenticated) return
  try {
    await Promise.all([
      projectsStore.loadProjects(),
      projectsStore.loadTasks(),
      calendarStore.loadReminders(),
    ])
  } catch (err) {
    console.error('Failed to load initial app data:', err)
  }
}

onMounted(async () => {
  if (authStore.isAuthenticated && !isAuthRoute.value) {
    await loadAppData()
  }
})

// Trigger load only when user becomes authenticated
watch(
  () => authStore.isAuthenticated,
  async (authenticated) => {
    if (authenticated && !isAuthRoute.value) {
      await loadAppData()
    }
  }
)
</script>
