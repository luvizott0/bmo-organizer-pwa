<template>
  <header class="h-16 border-b-2 border-[#D8CDC5] bg-[#fdf8f3] px-6 flex items-center justify-between select-none shrink-0 shadow-2xs">
    <div class="flex items-center gap-3">
      <div v-if="projectsStore.selectedProject && $route.path === '/board'" class="flex items-center gap-2">
        <span class="section-marker text-sm uppercase">PROJETO</span>
        <span
          class="w-2.5 h-2.5 rounded-xs shrink-0"
          :style="{ backgroundColor: projectsStore.selectedProject.color || '#a66130' }"
        ></span>
        <span class="font-mono text-xs font-bold px-1.5 py-0.5 rounded-xs bg-[#ffffff] text-[#a66130] border border-[#D8CDC5]">
          {{ projectsStore.selectedProject.prefix }}
        </span>
        <h1 class="text-sm font-bold font-mono text-[#422d16]">
          {{ projectsStore.selectedProject.name }}
        </h1>
        <a
          v-if="projectsStore.selectedProject.github_repo"
          :href="githubUrl"
          target="_blank"
          class="text-xs text-[#847062] hover:text-[#a66130] flex items-center gap-1 transition-colors ml-2 bg-[#ffffff] px-2 py-0.5 rounded-xs border border-[#D8CDC5] font-mono"
        >
          <Github class="w-3.5 h-3.5" />
          <span>{{ projectsStore.selectedProject.github_repo }}</span>
          <ExternalLink class="w-3 h-3 opacity-60" />
        </a>
      </div>

      <div v-else-if="$route.path === '/calendar'" class="flex items-center gap-2">
        <span class="section-marker text-sm uppercase">AGENDA & ROTINA</span>
        <span class="text-xs font-mono text-[#847062]">[Sincronizado BMO & WhatsApp]</span>
      </div>

      <div v-else class="flex items-center gap-2">
        <span class="section-marker text-sm uppercase">GERENCIADOR DE PROJETOS</span>
      </div>
    </div>

    <!-- Actions Area -->
    <div class="flex items-center gap-3">
      <button
        @click="refreshData"
        class="retro-button-secondary font-mono text-xs px-2.5 py-1.5 rounded-xs border border-[#D8CDC5] flex items-center gap-1.5 cursor-pointer bg-white hover:bg-[#e8c9a5]"
        title="Atualizar dados"
      >
        <RefreshCw class="w-3.5 h-3.5 text-[#a66130]" :class="{ 'animate-spin': loading }" />
        <span class="hidden sm:inline">[SYNC]</span>
      </button>

      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useCalendarStore } from '@/stores/calendar'
import { Github, ExternalLink, RefreshCw } from 'lucide-vue-next'

const projectsStore = useProjectsStore()
const calendarStore = useCalendarStore()
const loading = ref(false)

const githubUrl = computed(() => {
  const repo = projectsStore.selectedProject?.github_repo
  if (!repo) return '#'
  if (repo.startsWith('http')) return repo
  return `https://github.com/${repo}`
})

async function refreshData() {
  loading.value = true
  try {
    await Promise.all([
      projectsStore.loadProjects(),
      projectsStore.loadTasks(),
      calendarStore.loadReminders(),
    ])
  } finally {
    loading.value = false
  }
}
</script>
