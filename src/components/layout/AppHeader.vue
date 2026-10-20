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
      <!-- Quota Indicator Widget -->
      <div
        v-if="quota && (quota.limit_5h || quota.limit_weekly)"
        class="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-white border border-[#D8CDC5] rounded-xs font-mono text-xs shadow-2xs group relative cursor-pointer"
        :title="quotaTooltip"
      >
        <!-- 5-hour limit -->
        <div class="flex items-center gap-1.5">
          <span class="text-[#847062] font-semibold flex items-center gap-1">
            <Zap class="w-3 h-3 text-[#a66130]" />
            5h:
          </span>
          <span class="font-bold" :class="getQuotaColorClass(quota.limit_5h?.remaining_percentage)">
            {{ quota.limit_5h ? `${quota.limit_5h.remaining_percentage}%` : '100%' }}
          </span>
        </div>

        <span class="text-[#D8CDC5]">|</span>

        <!-- Weekly limit -->
        <div class="flex items-center gap-1.5">
          <span class="text-[#847062] font-semibold flex items-center gap-1">
            <Calendar class="w-3 h-3 text-[#847062]" />
            Semanal:
          </span>
          <span class="font-bold" :class="getQuotaColorClass(quota.limit_weekly?.remaining_percentage)">
            {{ quota.limit_weekly ? `${quota.limit_weekly.remaining_percentage}%` : '100%' }}
          </span>
        </div>

        <!-- Tooltip Hover Popover -->
        <div class="absolute right-0 top-full mt-2 hidden group-hover:block z-50 w-64 bg-[#fdf8f3] border-2 border-[#D8CDC5] rounded-xs p-3 shadow-md text-xs font-mono text-[#422d16]">
          <div class="font-bold border-b border-[#D8CDC5] pb-1.5 mb-2 flex items-center justify-between text-[#a66130]">
            <span>COTAS IA / GEMINI</span>
            <span class="text-[10px] text-[#847062]">{{ quota.user_tier || 'Google AI' }}</span>
          </div>
          
          <div class="space-y-2">
            <div>
              <div class="flex justify-between font-bold">
                <span>Limite 5 Horas:</span>
                <span :class="getQuotaColorClass(quota.limit_5h?.remaining_percentage)">
                  {{ quota.limit_5h ? `${quota.limit_5h.remaining_percentage}%` : '100%' }}
                </span>
              </div>
              <div class="text-[11px] text-[#847062]">
                Reset: {{ formatReset(quota.limit_5h?.reset_time) }}
              </div>
            </div>

            <div class="border-t border-[#D8CDC5]/60 pt-1.5">
              <div class="flex justify-between font-bold">
                <span>Limite Semanal:</span>
                <span :class="getQuotaColorClass(quota.limit_weekly?.remaining_percentage)">
                  {{ quota.limit_weekly ? `${quota.limit_weekly.remaining_percentage}%` : '100%' }}
                </span>
              </div>
              <div class="text-[11px] text-[#847062]">
                Reset: {{ formatReset(quota.limit_weekly?.reset_time) }}
              </div>
            </div>

            <div v-if="quota.updated_at" class="border-t border-[#D8CDC5]/60 pt-1 text-[10px] text-[#847062]/80 text-right">
              Atualizado: {{ formatRelativeTime(quota.updated_at) }}
            </div>
          </div>
        </div>
      </div>

      <button
        @click="refreshData"
        class="retro-button-secondary font-mono text-xs px-2.5 py-1.5 rounded-xs border border-[#D8CDC5] flex items-center gap-1.5 cursor-pointer bg-white hover:bg-[#e8c9a5]"
        title="Atualizar dados"
      >
        <RefreshCw class="w-3.5 h-3.5 text-[#a66130]" :class="{ 'animate-spin': loading }" />
        <span class="hidden sm:inline">[SYNC]</span>
      </button>

      <button
        @click="handleLogout"
        class="retro-button-secondary font-mono text-xs px-2.5 py-1.5 rounded-xs border border-[#D8CDC5] flex items-center gap-1.5 cursor-pointer bg-white hover:bg-[#fdf0ea]"
        title="Encerrar sessão"
      >
        <LogOut class="w-3.5 h-3.5 text-[#847062]" />
        <span class="hidden sm:inline">[SAIR]</span>
      </button>

      <slot name="actions" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useCalendarStore } from '@/stores/calendar'
import { useAuthStore } from '@/stores/auth'
import { systemApi } from '@/api/client'
import type { QuotaStatus } from '@/types'
import { Github, ExternalLink, RefreshCw, LogOut, Zap, Calendar } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const calendarStore = useCalendarStore()
const loading = ref(false)
const quota = ref<QuotaStatus | null>(null)

async function loadQuota() {
  try {
    quota.value = await systemApi.getQuota()
  } catch (err) {
    console.warn('Erro ao carregar cotas:', err)
  }
}

onMounted(() => {
  loadQuota()
})

function getQuotaColorClass(pct?: number) {
  if (pct === undefined || pct === null) return 'text-[#2e7d32]'
  if (pct > 50) return 'text-[#2e7d32]'
  if (pct > 20) return 'text-[#f57c00]'
  return 'text-[#c62828]'
}

function formatReset(dateStr?: string) {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
      (d.getDate() !== new Date().getDate() ? ` (${d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })})` : '')
  } catch {
    return dateStr
  }
}

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return ''
  try {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (diff < 1) return 'agora'
    if (diff === 1) return 'há 1 min'
    if (diff < 60) return `há ${diff} min`
    return `há ${Math.floor(diff / 60)}h`
  } catch {
    return ''
  }
}

const quotaTooltip = computed(() => {
  if (!quota.value) return 'Cotas do Gemini'
  return `5h: ${quota.value.limit_5h?.remaining_percentage ?? 100}% | Semanal: ${quota.value.limit_weekly?.remaining_percentage ?? 100}%`
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

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
      loadQuota(),
    ])
  } finally {
    loading.value = false
  }
}
</script>
