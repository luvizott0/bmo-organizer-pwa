<template>
  <aside class="w-64 min-h-screen bg-[#fdf8f3] border-r-2 border-[#D8CDC5] px-4 py-5 flex flex-col justify-between select-none shrink-0 shadow-xs">
    <!-- Top Brand & Navigation -->
    <div class="space-y-5">
      <!-- CapiHouse Style Brand Header -->
      <div class="flex items-center gap-2.5 px-1 pb-3 border-b border-[#D8CDC5]">
        <div class="w-8 h-8 rounded-sm bg-[#a66130] flex items-center justify-center text-white font-mono font-bold text-sm shadow-xs">
          B
        </div>
        <div class="leading-tight">
          <div class="font-mono text-sm font-bold tracking-tight text-[#422d16] flex items-center gap-1.5">
            BMO<span class="text-[#a66130]">/</span>ORGANIZER
          </div>
          <div class="text-[10px] font-mono uppercase tracking-wider text-[#847062]">
            Desk Workspace
          </div>
        </div>
      </div>

      <!-- Main Navigation Tabs in CapiHouse NavTab Style -->
      <nav class="space-y-1.5">
        <RouterLink
          to="/board"
          class="flex items-center gap-2.5 px-3 py-2 rounded-xs font-mono text-xs font-bold uppercase transition-all duration-150 border"
          :class="$route.path === '/board'
            ? 'bg-[#a66130] text-white border-[#a66130] shadow-2xs'
            : 'bg-[#f8f6f1] text-[#7d5628] border-[#D8CDC5] hover:bg-[#e8c9a5] hover:text-[#422d16]'"
        >
          <KanbanSquare class="w-4 h-4" />
          <span>Kanban Board</span>
        </RouterLink>

        <RouterLink
          to="/calendar"
          class="flex items-center gap-2.5 px-3 py-2 rounded-xs font-mono text-xs font-bold uppercase transition-all duration-150 border"
          :class="$route.path === '/calendar'
            ? 'bg-[#a66130] text-white border-[#a66130] shadow-2xs'
            : 'bg-[#f8f6f1] text-[#7d5628] border-[#D8CDC5] hover:bg-[#e8c9a5] hover:text-[#422d16]'"
        >
          <CalendarDays class="w-4 h-4" />
          <span>Calendário & Rotina</span>
        </RouterLink>

        <RouterLink
          to="/projects"
          class="flex items-center gap-2.5 px-3 py-2 rounded-xs font-mono text-xs font-bold uppercase transition-all duration-150 border"
          :class="$route.path === '/projects'
            ? 'bg-[#a66130] text-white border-[#a66130] shadow-2xs'
            : 'bg-[#f8f6f1] text-[#7d5628] border-[#D8CDC5] hover:bg-[#e8c9a5] hover:text-[#422d16]'"
        >
          <FolderGit2 class="w-4 h-4" />
          <span>Projetos</span>
        </RouterLink>

        <RouterLink
          to="/releases"
          class="flex items-center gap-2.5 px-3 py-2 rounded-xs font-mono text-xs font-bold uppercase transition-all duration-150 border"
          :class="$route.path === '/releases'
            ? 'bg-[#a66130] text-white border-[#a66130] shadow-2xs'
            : 'bg-[#f8f6f1] text-[#7d5628] border-[#D8CDC5] hover:bg-[#e8c9a5] hover:text-[#422d16]'"
        >
          <Rocket class="w-4 h-4" />
          <span>Releases & Deploy</span>
        </RouterLink>
      </nav>

      <!-- Projects Section -->
      <div class="pt-3 border-t border-[#D8CDC5]">
        <div class="px-1 pb-2 flex items-center justify-between section-marker text-xs">
          <span>PROJETOS</span>
          <span class="text-[11px] font-mono text-[#847062]">[{{ projectsStore.projects.length }}]</span>
        </div>

        <div class="space-y-1.5 max-h-[40vh] overflow-y-auto pr-0.5">
          <button
            v-for="project in projectsStore.projects"
            :key="project.id"
            @click="selectProject(project.id)"
            class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-xs text-xs text-left transition-all duration-150 cursor-pointer border"
            :class="projectsStore.selectedProjectId === project.id
              ? 'bg-[#ffffff] text-[#422d16] font-bold border-[#a66130] shadow-xs'
              : 'bg-[#f8f6f1] text-[#5f4120] border-[#D8CDC5] hover:bg-[#e8c9a5]'"
          >
            <div class="flex items-center gap-2 truncate">
              <span
                class="w-2 h-2 rounded-xs shrink-0"
                :style="{ backgroundColor: project.color || '#a66130' }"
              ></span>
              <span class="font-mono text-[10px] font-bold px-1 py-0.2 rounded-xs bg-[#f8f6f1] text-[#a66130] border border-[#D8CDC5]">
                {{ project.prefix }}
              </span>
              <span class="truncate font-sans font-medium text-xs">{{ project.name }}</span>
            </div>
            <span class="text-[10px] font-mono text-[#847062]">
              {{ project.tasks_count ?? 0 }}
            </span>
          </button>

          <div v-if="projectsStore.projects.length === 0" class="py-4 px-1 text-center text-xs text-[#847062] font-mono italic">
            [nenhum projeto]
          </div>
        </div>
      </div>
    </div>

    <!-- Homelab Footer -->
    <div class="pt-3 border-t border-[#D8CDC5]">
      <div class="p-2.5 rounded-xs bg-[#ffffff] border border-[#D8CDC5] flex items-center justify-between text-xs font-mono">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
          <span class="font-bold text-[#422d16]">HOMELAB.BMO</span>
        </div>
        <span class="text-[10px] text-[#847062]">[ONLINE]</span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useProjectsStore } from '@/stores/projects'
import { useRouter } from 'vue-router'
import { KanbanSquare, CalendarDays, FolderGit2, Rocket } from 'lucide-vue-next'

const projectsStore = useProjectsStore()
const router = useRouter()

function selectProject(id: number) {
  projectsStore.selectedProjectId = id
  if (router.currentRoute.value.path !== '/board') {
    router.push('/board')
  }
}
</script>
