<template>
  <div class="h-full flex flex-col overflow-hidden bg-[#f8f6f1]">
    <AppHeader>
      <template #actions>
        <div class="flex items-center gap-2">
          <!-- Auto-refresh Toggle -->
          <button
            @click="toggleAutoRefresh"
            class="px-2.5 py-1.5 rounded-xs font-mono text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer"
            :class="dockerStore.autoRefresh
              ? 'bg-[#16a34a]/15 text-[#16a34a] border-[#16a34a]'
              : 'bg-[#fdf8f3] text-[#847062] border-[#D8CDC5] hover:text-[#422d16]'"
            title="Alternar atualização automática a cada 8s"
          >
            <span
              class="w-2 h-2 rounded-full"
              :class="dockerStore.autoRefresh ? 'bg-[#16a34a] animate-pulse' : 'bg-[#847062]'"
            ></span>
            <span>AUTO-SYNC {{ dockerStore.autoRefresh ? '[ON]' : '[OFF]' }}</span>
          </button>

          <!-- Refresh Button -->
          <button
            @click="refresh"
            :disabled="dockerStore.loading"
            class="retro-button"
            title="Atualizar lista de containers"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': dockerStore.loading }" />
            <span>ATUALIZAR</span>
          </button>
        </div>
      </template>
    </AppHeader>

    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-7xl mx-auto space-y-5">
        <!-- Title & Subtitle -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 class="section-marker text-lg mb-1">PROJETOS & CONTAINERS DOCKER</h2>
            <p class="text-xs text-[#847062] font-sans">
              Gerencie todos os serviços e containers ativos no servidor Homelab BMO. Controle inicialização, parada e reinício em tempo real.
            </p>
          </div>

          <!-- Quick Metrics Bar -->
          <div class="flex items-center gap-2 shrink-0">
            <div class="px-3 py-1.5 bg-white border-2 border-[#D8CDC5] rounded-xs font-mono text-xs shadow-2xs">
              <span class="text-[#847062] mr-1.5">TOTAL:</span>
              <span class="font-bold text-[#422d16]">{{ dockerStore.meta.total }}</span>
            </div>
            <div class="px-3 py-1.5 bg-[#dcfce7] border-2 border-[#86efac] rounded-xs font-mono text-xs shadow-2xs flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
              <span class="text-[#15803d] font-bold">{{ dockerStore.meta.running }} ATIVOS</span>
            </div>
            <div class="px-3 py-1.5 bg-[#fee2e2] border-2 border-[#fca5a5] rounded-xs font-mono text-xs shadow-2xs flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-[#dc2626]"></span>
              <span class="text-[#b91c1c] font-bold">{{ dockerStore.meta.stopped }} PARADOS</span>
            </div>
          </div>
        </div>

        <!-- Filter & Search Controls -->
        <div class="p-3 bg-white border-2 border-[#D8CDC5] rounded-xs shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div class="flex-1 relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#847062]" />
            <input
              v-model="dockerStore.searchQuery"
              type="text"
              placeholder="Buscar por nome do container, projeto, imagem ou porta..."
              class="w-full pl-9 pr-3 py-1.5 bg-[#fdf8f3] border border-[#D8CDC5] rounded-xs font-mono text-xs text-[#422d16] focus:outline-none focus:border-[#a66130]"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Project Filter Dropdown -->
            <div class="flex items-center gap-1.5">
              <span class="text-[11px] font-mono font-bold text-[#847062]">PROJETO:</span>
              <select
                v-model="dockerStore.selectedProjectFilter"
                class="px-2.5 py-1.5 bg-[#fdf8f3] border border-[#D8CDC5] rounded-xs font-mono text-xs font-bold text-[#422d16] focus:outline-none focus:border-[#a66130]"
              >
                <option value="all">TODOS OS PROJETOS</option>
                <option
                  v-for="proj in dockerStore.availableProjects"
                  :key="proj"
                  :value="proj"
                >
                  {{ proj.toUpperCase() }}
                </option>
              </select>
            </div>

            <!-- Status Tabs -->
            <div class="inline-flex rounded-xs border border-[#D8CDC5] bg-[#f8f6f1] p-0.5 font-mono text-xs">
              <button
                @click="dockerStore.selectedStatusFilter = 'all'"
                class="px-2.5 py-1 rounded-2xs font-bold transition-all cursor-pointer"
                :class="dockerStore.selectedStatusFilter === 'all'
                  ? 'bg-[#a66130] text-white shadow-2xs'
                  : 'text-[#7d5628] hover:text-[#422d16]'"
              >
                TODOS
              </button>
              <button
                @click="dockerStore.selectedStatusFilter = 'running'"
                class="px-2.5 py-1 rounded-2xs font-bold transition-all cursor-pointer"
                :class="dockerStore.selectedStatusFilter === 'running'
                  ? 'bg-[#16a34a] text-white shadow-2xs'
                  : 'text-[#7d5628] hover:text-[#16a34a]'"
              >
                ATIVOS
              </button>
              <button
                @click="dockerStore.selectedStatusFilter = 'stopped'"
                class="px-2.5 py-1 rounded-2xs font-bold transition-all cursor-pointer"
                :class="dockerStore.selectedStatusFilter === 'stopped'
                  ? 'bg-[#dc2626] text-white shadow-2xs'
                  : 'text-[#7d5628] hover:text-[#dc2626]'"
              >
                PARADOS
              </button>
            </div>
          </div>
        </div>

        <!-- Feedback Alert Messages -->
        <div v-if="dockerStore.error" class="p-3 bg-red-50 border-2 border-red-300 rounded-xs text-xs font-mono text-red-800 flex items-center justify-between">
          <span>⚠️ {{ dockerStore.error }}</span>
          <button @click="refresh" class="underline font-bold hover:text-red-950">Tentar Novamente</button>
        </div>

        <div v-if="feedbackMsg" class="p-2.5 bg-emerald-50 border-2 border-emerald-300 rounded-xs text-xs font-mono text-emerald-800 flex items-center justify-between">
          <span>✓ {{ feedbackMsg }}</span>
          <button @click="feedbackMsg = null" class="text-xs font-bold hover:text-emerald-950">✕</button>
        </div>

        <!-- Loading State Skeleton -->
        <div v-if="dockerStore.loading && dockerStore.containers.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-for="i in 6" :key="i" class="retro-card p-5 space-y-4 animate-pulse">
            <div class="h-6 bg-[#D8CDC5]/50 rounded-xs"></div>
            <div class="h-4 bg-[#D8CDC5]/30 rounded-xs w-3/4"></div>
            <div class="h-4 bg-[#D8CDC5]/30 rounded-xs w-1/2"></div>
            <div class="h-8 bg-[#D8CDC5]/40 rounded-xs"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="dockerStore.filteredContainers.length === 0"
          class="retro-card p-12 text-center space-y-3"
        >
          <div class="w-12 h-12 mx-auto rounded-full bg-[#f8f6f1] border-2 border-[#D8CDC5] flex items-center justify-center text-[#847062]">
            <Boxes class="w-6 h-6" />
          </div>
          <h3 class="font-mono font-bold text-sm text-[#422d16]">Nenhum container encontrado</h3>
          <p class="text-xs text-[#847062] font-sans max-w-sm mx-auto">
            Nenhum serviço corresponde aos filtros atuais. Tente alterar o termo de busca ou o filtro de projeto.
          </p>
          <button
            @click="resetFilters"
            class="retro-button mt-2"
          >
            LIMPAR FILTROS
          </button>
        </div>

        <!-- Containers Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="container in dockerStore.filteredContainers"
            :key="container.id"
            class="retro-card flex flex-col justify-between transition-all hover:shadow-xs hover:-translate-y-0.5"
            :class="{ 'border-emerald-600/40': container.is_running, 'border-red-400/40': !container.is_running }"
          >
            <div>
              <!-- Card Header -->
              <div
                class="retro-card-header flex items-center justify-between"
                :class="container.is_running ? 'bg-[#3b2d22]' : 'bg-[#5f4120]'"
              >
                <div class="flex items-center gap-2 truncate pr-2">
                  <span
                    class="w-2.5 h-2.5 rounded-full shrink-0"
                    :class="container.is_running ? 'bg-[#22c55e] animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-[#ef4444] shadow-[0_0_6px_#ef4444]'"
                  ></span>
                  <span class="truncate font-mono font-bold text-xs text-white" :title="container.name">
                    {{ container.name }}
                  </span>
                </div>

                <!-- Project Badge -->
                <span
                  class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-2xs uppercase shrink-0 border"
                  :class="getProjectBadgeClass(container.project)"
                >
                  {{ container.project }}
                </span>
              </div>

              <!-- Card Body -->
              <div class="p-4 space-y-3 font-sans">
                <!-- Status Badge -->
                <div class="flex items-center justify-between text-xs font-mono">
                  <div class="flex items-center gap-1.5">
                    <span
                      class="px-2 py-0.5 rounded-2xs text-[11px] font-bold border flex items-center gap-1"
                      :class="container.is_running
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-red-50 text-red-800 border-red-300'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="container.is_running ? 'bg-emerald-600' : 'bg-red-600'"></span>
                      {{ container.is_running ? 'ATIVO' : 'PARADO' }}
                    </span>
                    <span v-if="container.health" class="text-[10px] text-[#847062]">
                      [{{ container.health }}]
                    </span>
                  </div>

                  <span class="text-[10px] text-[#847062] truncate max-w-[150px]" :title="container.status">
                    {{ container.status }}
                  </span>
                </div>

                <!-- Docker Image -->
                <div class="flex items-start gap-1.5 p-2 bg-[#f8f6f1] border border-[#D8CDC5] rounded-xs text-xs font-mono">
                  <Layers class="w-3.5 h-3.5 text-[#a66130] shrink-0 mt-0.5" />
                  <div class="truncate leading-tight">
                    <div class="text-[9px] uppercase text-[#847062]">Imagem</div>
                    <div class="truncate text-[11px] font-bold text-[#422d16]" :title="container.image">
                      {{ container.image }}
                    </div>
                  </div>
                </div>

                <!-- Ports (if available) -->
                <div v-if="container.ports && container.ports.length > 0" class="space-y-1">
                  <div class="text-[10px] font-mono uppercase text-[#847062] flex items-center gap-1">
                    <Network class="w-3 h-3 text-[#2563eb]" />
                    <span>Portas Vinculadas</span>
                  </div>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="port in container.ports.slice(0, 3)"
                      :key="port"
                      class="px-1.5 py-0.5 bg-blue-50 border border-blue-200 text-blue-800 font-mono text-[10px] rounded-2xs"
                    >
                      {{ port }}
                    </span>
                    <span
                      v-if="container.ports.length > 3"
                      class="text-[10px] font-mono text-[#847062] self-center"
                    >
                      +{{ container.ports.length - 3 }}
                    </span>
                  </div>
                </div>

                <!-- Last Update / Created Information -->
                <div class="pt-2 border-t border-[#D8CDC5]/60 flex items-center justify-between text-[10px] font-mono text-[#847062]">
                  <div class="flex items-center gap-1">
                    <Clock class="w-3 h-3" />
                    <span>Último Estado:</span>
                  </div>
                  <span class="font-bold text-[#422d16] truncate max-w-[160px]" :title="container.last_updated || container.created_at || ''">
                    {{ container.last_updated || container.created_at || 'Desconhecido' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Actions Footer -->
            <div class="p-3 bg-[#fdf8f3] border-t-2 border-[#D8CDC5] flex items-center justify-between gap-1.5">
              <!-- Logs Button -->
              <button
                @click="openLogs(container)"
                class="px-2 py-1 bg-white hover:bg-[#e8c9a5] border border-[#D8CDC5] rounded-xs font-mono text-[11px] font-bold text-[#5f4120] transition-colors flex items-center gap-1 cursor-pointer"
                title="Visualizar logs do container"
              >
                <Terminal class="w-3.5 h-3.5" />
                <span>LOGS</span>
              </button>

              <!-- State Controls (Start / Stop / Restart) -->
              <div class="flex items-center gap-1.5">
                <!-- Start Button (shown if stopped) -->
                <button
                  v-if="!container.is_running"
                  @click="handleStart(container)"
                  :disabled="isProcessing(container.name)"
                  class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs font-mono text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Iniciar Container"
                >
                  <RefreshCw v-if="isProcessing(container.name)" class="w-3 h-3 animate-spin" />
                  <Play v-else class="w-3 h-3 fill-current" />
                  <span>INICIAR</span>
                </button>

                <!-- Restart Button (shown if running) -->
                <button
                  v-if="container.is_running"
                  @click="handleRestart(container)"
                  :disabled="isProcessing(container.name)"
                  class="px-2.5 py-1 bg-[#d97706] hover:bg-[#b45309] text-white rounded-xs font-mono text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Reiniciar Container"
                >
                  <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': isProcessing(container.name) }" />
                  <span>REINICIAR</span>
                </button>

                <!-- Stop Button (shown if running) -->
                <button
                  v-if="container.is_running"
                  @click="handleStop(container)"
                  :disabled="isProcessing(container.name)"
                  class="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-xs font-mono text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Parar Container"
                >
                  <Square class="w-3 h-3 fill-current" />
                  <span>PARAR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logs Modal -->
    <div
      v-if="showLogsModal && selectedContainerForLogs"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="bg-[#18181b] border-2 border-[#3f3f46] rounded-xs max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        <!-- Terminal Header -->
        <div class="px-4 py-3 bg-[#27272a] border-b border-[#3f3f46] flex items-center justify-between text-zinc-200">
          <div class="flex items-center gap-2">
            <Terminal class="w-4 h-4 text-emerald-400" />
            <span class="font-bold text-white">LOGS: {{ selectedContainerForLogs.name }}</span>
            <span class="text-[10px] text-zinc-400">({{ selectedContainerForLogs.image }})</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="refreshCurrentLogs"
              :disabled="loadingLogs"
              class="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 rounded-2xs text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <RefreshCw class="w-3 h-3" :class="{ 'animate-spin': loadingLogs }" />
              <span>ATUALIZAR</span>
            </button>
            <button
              @click="copyLogs"
              class="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-600 rounded-2xs text-[11px] font-bold transition-colors cursor-pointer"
            >
              {{ copied ? 'COPIADO!' : 'COPIAR' }}
            </button>
            <button
              @click="closeLogsModal"
              class="p-1 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-2xs transition-colors cursor-pointer"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Terminal Output -->
        <div
          ref="terminalOutputRef"
          class="flex-1 p-4 overflow-y-auto bg-black text-emerald-400 font-mono text-[11px] leading-relaxed select-text whitespace-pre-wrap break-all min-h-[300px]"
        >
          <div v-if="loadingLogs" class="text-zinc-500 animate-pulse">Carregando logs do container...</div>
          <div v-else-if="!currentLogsContent" class="text-zinc-500">Nenhum log recente retornado para este container.</div>
          <div v-else>{{ currentLogsContent }}</div>
        </div>

        <!-- Terminal Footer -->
        <div class="px-4 py-2 bg-[#27272a] border-t border-[#3f3f46] flex items-center justify-between text-[11px] text-zinc-400">
          <span>Últimas 100 linhas</span>
          <span>Status: {{ selectedContainerForLogs.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useDockerStore } from '@/stores/docker'
import type { DockerContainer } from '@/types'
import {
  Boxes,
  RefreshCw,
  Search,
  Layers,
  Network,
  Clock,
  Terminal,
  Play,
  Square,
  X,
} from 'lucide-vue-next'

const dockerStore = useDockerStore()
const feedbackMsg = ref<string | null>(null)

// Logs modal state
const showLogsModal = ref(false)
const selectedContainerForLogs = ref<DockerContainer | null>(null)
const currentLogsContent = ref<string>('')
const loadingLogs = ref(false)
const copied = ref(false)
const terminalOutputRef = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  await dockerStore.loadContainers()
})

onUnmounted(() => {
  dockerStore.clearAutoRefresh()
})

async function refresh() {
  await dockerStore.loadContainers()
}

function toggleAutoRefresh() {
  dockerStore.setAutoRefresh(!dockerStore.autoRefresh)
}

function resetFilters() {
  dockerStore.searchQuery = ''
  dockerStore.selectedProjectFilter = 'all'
  dockerStore.selectedStatusFilter = 'all'
}

function isProcessing(name: string): boolean {
  return !!dockerStore.actionInProgress[name]
}

async function handleStart(container: DockerContainer) {
  const res = await dockerStore.start(container.name)
  if (res.success) {
    feedbackMsg.value = `Container ${container.name} iniciado com sucesso!`
    setTimeout(() => (feedbackMsg.value = null), 4000)
  } else {
    alert(`Erro ao iniciar ${container.name}: ${res.error}`)
  }
}

async function handleStop(container: DockerContainer) {
  if (!confirm(`Deseja realmente parar o container "${container.name}"?`)) {
    return
  }
  const res = await dockerStore.stop(container.name)
  if (res.success) {
    feedbackMsg.value = `Container ${container.name} parado com sucesso.`
    setTimeout(() => (feedbackMsg.value = null), 4000)
  } else {
    alert(`Erro ao parar ${container.name}: ${res.error}`)
  }
}

async function handleRestart(container: DockerContainer) {
  const res = await dockerStore.restart(container.name)
  if (res.success) {
    feedbackMsg.value = `Container ${container.name} reiniciado com sucesso!`
    setTimeout(() => (feedbackMsg.value = null), 4000)
  } else {
    alert(`Erro ao reiniciar ${container.name}: ${res.error}`)
  }
}

async function openLogs(container: DockerContainer) {
  selectedContainerForLogs.value = container
  showLogsModal.value = true
  await refreshCurrentLogs()
}

async function refreshCurrentLogs() {
  if (!selectedContainerForLogs.value) return
  loadingLogs.value = true
  currentLogsContent.value = await dockerStore.fetchLogs(selectedContainerForLogs.value.name, 100)
  loadingLogs.value = false
  await nextTick()
  if (terminalOutputRef.value) {
    terminalOutputRef.value.scrollTop = terminalOutputRef.value.scrollHeight
  }
}

async function copyLogs() {
  if (!currentLogsContent.value) return
  await navigator.clipboard.writeText(currentLogsContent.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

function closeLogsModal() {
  showLogsModal.value = false
  selectedContainerForLogs.value = null
  currentLogsContent.value = ''
}

function getProjectBadgeClass(project: string): string {
  const p = project.toLowerCase()
  if (p === 'bmo') return 'bg-amber-100 text-amber-900 border-amber-300'
  if (p === 'capihouse') return 'bg-orange-100 text-orange-900 border-orange-300'
  if (p === 'capyshowtime') return 'bg-purple-100 text-purple-900 border-purple-300'
  if (p === 'capyflix') return 'bg-rose-100 text-rose-900 border-rose-300'
  if (p === 'evolution') return 'bg-green-100 text-green-900 border-green-300'
  if (p === 'database') return 'bg-blue-100 text-blue-900 border-blue-300'
  if (p === 'network') return 'bg-cyan-100 text-cyan-900 border-cyan-300'
  return 'bg-stone-100 text-stone-800 border-stone-300'
}
</script>
