<template>
  <aside class="w-64 min-h-screen bg-white border-r border-slate-200/80 px-5 py-6 flex flex-col justify-between select-none shrink-0 shadow-xs">
    <!-- Top Brand & Navigation -->
    <div class="space-y-6">
      <!-- BMO Logo -->
      <div class="flex items-center gap-3 px-2">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-indigo-200">
          B
        </div>
        <div class="leading-none">
          <div class="flex items-center gap-1.5">
            <span class="font-extrabold text-lg tracking-tight text-slate-900">BMO</span>
            <span class="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">Desk</span>
          </div>
          <span class="text-[11px] font-medium text-slate-400">Projetos & Rotina</span>
        </div>
      </div>

      <!-- Main Navigation Links -->
      <nav class="space-y-1">
        <RouterLink
          to="/board"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150',
            $route.path === '/board'
              ? 'bg-indigo-50/90 text-indigo-600 shadow-2xs border border-indigo-100/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          ]"
        >
          <KanbanSquare class="w-4 h-4 stroke-[2.2]" />
          <span>Kanban Board</span>
        </RouterLink>

        <RouterLink
          to="/calendar"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150',
            $route.path === '/calendar'
              ? 'bg-indigo-50/90 text-indigo-600 shadow-2xs border border-indigo-100/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          ]"
        >
          <CalendarDays class="w-4 h-4 stroke-[2.2]" />
          <span>Calendário & Rotina</span>
        </RouterLink>

        <RouterLink
          to="/projects"
          :class="[
            'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150',
            $route.path === '/projects'
              ? 'bg-indigo-50/90 text-indigo-600 shadow-2xs border border-indigo-100/50'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          ]"
        >
          <FolderGit2 class="w-4 h-4 stroke-[2.2]" />
          <span>Gerenciar Projetos</span>
        </RouterLink>
      </nav>

      <!-- Projects Section -->
      <div class="pt-4 border-t border-slate-100">
        <div class="px-2 pb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Seus Projetos</span>
          <span class="text-xs font-mono font-bold text-slate-500">{{ projectsStore.projects.length }}</span>
        </div>

        <div class="space-y-1 max-h-[42vh] overflow-y-auto pr-1">
          <button
            v-for="project in projectsStore.projects"
            :key="project.id"
            @click="selectProject(project.id)"
            class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-all duration-150 cursor-pointer"
            :class="projectsStore.selectedProjectId === project.id
              ? 'bg-slate-100/90 text-slate-900 font-bold border border-slate-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'"
          >
            <div class="flex items-center gap-2 truncate">
              <span
                class="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                :style="{ backgroundColor: project.color || '#4f46e5' }"
              ></span>
              <span class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-indigo-600 border border-slate-200/80 shadow-2xs">
                {{ project.prefix }}
              </span>
              <span class="truncate">{{ project.name }}</span>
            </div>
            <span class="text-[11px] font-mono font-semibold text-slate-400">
              {{ project.tasks_count ?? 0 }}
            </span>
          </button>

          <div v-if="projectsStore.projects.length === 0" class="py-4 px-2 text-center text-xs text-slate-400 italic">
            Nenhum projeto ainda.
          </div>
        </div>
      </div>
    </div>

    <!-- Homelab Footer -->
    <div class="pt-4 border-t border-slate-100">
      <div class="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="font-bold text-slate-800">Homelab BMO</span>
        </div>
        <span class="text-[11px] font-mono font-bold text-slate-400">Online</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useProjectsStore } from '@/stores/projects'
import { useRouter } from 'vue-router'
import { KanbanSquare, CalendarDays, FolderGit2 } from 'lucide-vue-next'

const projectsStore = useProjectsStore()
const router = useRouter()

function selectProject(id: number) {
  projectsStore.selectedProjectId = id
  if (router.currentRoute.value.path !== '/board') {
    router.push('/board')
  }
}
</script>
