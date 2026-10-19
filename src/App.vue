<template>
  <div class="flex h-screen w-screen overflow-hidden bg-[#f8f6f1] text-[#333333] font-sans">
    <AppSidebar />
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f8f6f1]">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useProjectsStore } from '@/stores/projects'
import { useCalendarStore } from '@/stores/calendar'

const projectsStore = useProjectsStore()
const calendarStore = useCalendarStore()

onMounted(async () => {
  await Promise.all([
    projectsStore.loadProjects(),
    projectsStore.loadTasks(),
    calendarStore.loadReminders(),
  ])
})
</script>
