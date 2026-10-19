<template>
  <header class="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-7 flex items-center justify-between select-none shrink-0 shadow-2xs">
    <div class="flex items-center gap-3">
      <div v-if="projectsStore.selectedProject && $route.path === '/board'" class="flex items-center gap-2.5">
        <span
          class="w-3 h-3 rounded-full shadow-2xs shrink-0"
          :style="{ backgroundColor: projectsStore.selectedProject.color || '#4f46e5' }"
        ></span>
        <span class="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
          {{ projectsStore.selectedProject.prefix }}
        </span>
        <h1 class="text-base font-extrabold text-slate-900 tracking-tight">
          {{ projectsStore.selectedProject.name }}
        </h1>
        <a
          v-if="projectsStore.selectedProject.github_repo"
          :href="githubUrl"
          target="_blank"
          class="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors ml-1 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 font-mono font-medium shadow-2xs"
        >
          <Github class="w-3.5 h-3.5" />
          <span>{{ projectsStore.selectedProject.github_repo }}</span>
          <ExternalLink class="w-3 h-3 opacity-60" />
        </a>
      </div>

      <div v-else-if="$route.path === '/calendar'" class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <CalendarIcon class="w-4 h-4 stroke-[2.2]" />
        </div>
        <div>
          <h1 class="text-base font-extrabold text-slate-900 tracking-tight">Agenda & Rotina da Casa</h1>
          <p class="text-[11px] text-slate-400 font-medium">Sincronizado com WhatsApp e BMO</p>
        </div>
      </div>

      <div v-else class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
          <FolderGit2 class="w-4 h-4 stroke-[2.2]" />
        </div>
        <div>
          <h1 class="text-base font-extrabold text-slate-900 tracking-tight">Projetos & Repositórios</h1>
          <p class="text-[11px] text-slate-400 font-medium">Configurações para desenvolvimento e agentes de IA</p>
        </div>
      </div>
    </div>

    <!-- Actions Area -->
    <div class="flex items-center gap-3">
      <button
        @click="refreshData"
        class="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all border border-slate-200 shadow-2xs cursor-pointer"
        title="Atualizar dados"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin text-indigo-600': loading }" />
      </button>

      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useCalendarStore } from '@/stores/calendar'
import { Github, ExternalLink, RefreshCw, Calendar as CalendarIcon, FolderGit2 } from 'lucide-vue-next'

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
