<template>
  <div
    v-if="isOpen && task"
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div class="w-full max-w-2xl retro-card shadow-xl p-0 text-[#333333] bg-white my-6 overflow-hidden">
      <!-- Modal Header -->
      <div class="retro-card-header flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="font-mono font-bold text-sm bg-white/20 px-2 py-0.5 rounded-xs">
            {{ task.task_code }}
          </span>
          <span class="truncate text-xs font-mono uppercase tracking-wider">DETALHES DA TAREFA</span>
        </div>
        <button
          @click="$emit('close')"
          class="text-white/80 hover:text-white cursor-pointer font-mono font-bold px-1.5 py-0.5 rounded-xs hover:bg-white/10 transition-colors"
        >
          [X]
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-6 space-y-5 max-h-[80vh] overflow-y-auto font-sans">
        <!-- Title and Badges -->
        <div>
          <div class="flex items-center gap-2 mb-2 flex-wrap">
            <!-- Status Badge -->
            <span
              class="font-mono text-xs font-bold px-2 py-0.5 rounded-xs uppercase border"
              :class="statusBadgeClass(task.status)"
            >
              {{ statusLabel(task.status) }}
            </span>

            <!-- Priority Badge -->
            <span
              class="font-mono text-xs font-bold px-2 py-0.5 rounded-xs uppercase border"
              :class="priorityBadgeClass(task.priority)"
            >
              Prioridade: {{ priorityLabel(task.priority) }}
            </span>

            <!-- Assignee Badge -->
            <span
              v-if="task.assignee_type === 'ai'"
              class="font-mono text-xs font-bold px-2 py-0.5 rounded-xs bg-[#fdf8f3] text-[#a66130] border border-[#D8CDC5] flex items-center gap-1.5"
            >
              <Bot class="w-3.5 h-3.5" />
              Agente de IA (BMO Autônomo)
            </span>
            <span
              v-else
              class="font-mono text-xs font-bold px-2 py-0.5 rounded-xs bg-[#f8f6f1] text-[#847062] border border-[#D8CDC5]"
            >
              Desenvolvimento Manual
            </span>
          </div>

          <h2 class="text-base font-bold text-[#422d16] font-mono leading-snug">
            {{ task.title }}
          </h2>
        </div>

        <!-- Description -->
        <div class="p-3.5 rounded-xs bg-[#fdf8f3] border border-[#D8CDC5] space-y-1">
          <div class="text-[10px] font-mono font-bold text-[#847062] uppercase tracking-wider">
            » Descrição / Especificação
          </div>
          <p v-if="task.description" class="text-xs text-[#422d16] whitespace-pre-wrap leading-relaxed">
            {{ task.description }}
          </p>
          <p v-else class="text-xs text-[#847062] italic font-mono">
            [Nenhuma descrição fornecida]
          </p>
        </div>

        <!-- Technical Metadata -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <!-- Project & GitHub Repo -->
          <div class="p-2.5 rounded-xs bg-[#f8f6f1] border border-[#D8CDC5] space-y-1">
            <span class="text-[10px] text-[#847062] block font-bold">REPOSITÓRIO GITHUB</span>
            <a
              v-if="task.project?.github_repo"
              :href="`https://github.com/${task.project.github_repo}`"
              target="_blank"
              class="text-[#a66130] hover:underline flex items-center gap-1 font-bold truncate"
            >
              <Github class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">{{ task.project.github_repo }}</span>
              <ExternalLink class="w-3 h-3 shrink-0" />
            </a>
            <span v-else class="text-[#847062] italic">Não vinculado</span>
          </div>

          <!-- Git Branch -->
          <div class="p-2.5 rounded-xs bg-[#f8f6f1] border border-[#D8CDC5] space-y-1">
            <span class="text-[10px] text-[#847062] block font-bold">BRANCH GIT</span>
            <div class="flex items-center justify-between gap-1">
              <span class="truncate text-[#5f4120] font-bold text-[11px]">
                {{ task.branch_name || 'feat/' + task.task_code }}
              </span>
              <button
                @click="copyText(task.branch_name || 'feat/' + task.task_code)"
                class="hover:text-[#a66130] p-1 rounded-xs transition-colors cursor-pointer shrink-0"
                title="Copiar branch"
              >
                <Check v-if="copied" class="w-3.5 h-3.5 text-[#16a34a]" />
                <Copy v-else class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- AI Progress & Live Logs Section -->
        <div v-if="task.assignee_type === 'ai'" class="space-y-3 pt-2 border-t border-[#D8CDC5]">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold font-mono text-[#5f4120] flex items-center gap-1.5">
              <Bot class="w-4 h-4 text-[#a66130]" />
              PAINEL DE EXECUÇÃO DO AGENTE DE IA
            </h3>
            <span
              v-if="task.status === 'in_progress'"
              class="font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#fdf8f3] text-[#a66130] border border-[#a66130] flex items-center gap-1 animate-pulse"
            >
              <Loader2 class="w-3 h-3 animate-spin" />
              EM EXECUÇÃO
            </span>
            <span
              v-else-if="task.status === 'review' || task.status === 'done'"
              class="font-mono text-[10px] font-bold px-2 py-0.5 rounded-xs bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] flex items-center gap-1"
            >
              <CheckCircle2 class="w-3 h-3" />
              FINALIZADO
            </span>
          </div>

          <!-- AI Summary Box -->
          <div
            v-if="aiSummary"
            class="p-3.5 rounded-xs bg-[#fdf8f3] border-2 border-[#a66130] space-y-1.5 shadow-2xs"
          >
            <div class="flex items-center gap-1.5 text-xs font-mono font-bold text-[#a66130]">
              <Sparkles class="w-3.5 h-3.5" />
              RESUMO DA IMPLEMENTAÇÃO (GEMINI):
            </div>
            <p class="text-xs text-[#422d16] leading-relaxed">
              {{ aiSummary }}
            </p>
          </div>

          <!-- Terminal Output / Execution Logs -->
          <div class="rounded-xs overflow-hidden border-2 border-[#1a1410] shadow-sm">
            <div class="bg-[#1a1410] px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-[#a8a29e]">
              <div class="flex items-center gap-2">
                <Terminal class="w-3.5 h-3.5 text-[#a66130]" />
                <span class="font-bold text-white">bmo-ai-worker.log</span>
              </div>
              <span class="text-[10px] text-[#78716c]">FastAPI + Gemini REST</span>
            </div>
            <div class="bg-[#0f0c0a] p-3 text-xs font-mono text-[#4ade80] max-h-48 overflow-y-auto space-y-1 leading-relaxed">
              <template v-if="aiLogs.length > 0">
                <div v-for="(log, idx) in aiLogs" :key="idx" class="flex gap-2">
                  <span class="text-[#78716c] select-none text-[11px]">&gt;</span>
                  <span>{{ log }}</span>
                </div>
              </template>
              <div v-else class="text-[#78716c] italic">
                Nenhum log registrado ainda. A execução começará assim que a tarefa entrar em progresso.
              </div>
            </div>
          </div>
        </div>

        <!-- Isolated Task Preview Box (when in review or preview available) -->
        <div
          v-if="task.status === 'review' || task.preview_url || task.ai_logs?.preview_url"
          class="p-3.5 rounded-xs bg-[#fdf8f3] border-2 border-[#16a34a] flex items-center justify-between text-xs font-mono"
        >
          <div class="space-y-0.5">
            <div class="font-bold text-[#15803d] flex items-center gap-1.5">
              <Sparkles class="w-4 h-4 text-[#16a34a]" />
              PREVIEW ISOLADO DA TAREFA
            </div>
            <p class="text-[11px] text-[#847062] font-sans">
              Ambiente de teste dedicado executando a branch diretamente (<code class="text-[#15803d] font-bold">{{ task.task_code.toLowerCase() }}.preview.bmo</code>).
            </p>
          </div>
          <a
            :href="previewUrl"
            target="_blank"
            class="retro-button text-xs py-1.5 px-3 bg-[#16a34a] hover:bg-[#15803d] border-[#16a34a] text-white shrink-0 flex items-center gap-1.5 shadow-xs"
          >
            <span>ABRIR PREVIEW</span>
            <ExternalLink class="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <!-- Modal Actions Footer -->
      <div class="p-4 bg-[#fdf8f3] border-t-2 border-[#D8CDC5] flex items-center justify-between font-mono text-xs">
        <div>
          <button
            @click="$emit('close')"
            class="retro-button-secondary py-1.5 px-3"
          >
            FECHAR
          </button>
        </div>

        <!-- Dynamic Action Buttons according to status -->
        <div class="flex items-center gap-2">
          <!-- When in Todo -->
          <button
            v-if="task.status === 'todo'"
            @click="handleStatusChange('in_progress')"
            class="retro-button py-1.5 px-3.5 flex items-center gap-1.5"
          >
            <Play class="w-3.5 h-3.5 fill-current" />
            <span>{{ task.assignee_type === 'ai' ? 'DISPARAR IA AGORA' : 'INICIAR TAREFA' }}</span>
          </button>

          <!-- When in In Progress -->
          <button
            v-if="task.status === 'in_progress'"
            @click="handleStatusChange('review')"
            class="retro-button-secondary py-1.5 px-3 border border-[#D8CDC5] bg-white hover:bg-[#e8c9a5]"
          >
            MOVER PARA REVISÃO ➔
          </button>

          <!-- When in Review -->
          <button
            v-if="task.status === 'review'"
            @click="handleStatusChange('reviewed')"
            class="retro-button py-1.5 px-3.5 bg-[#0284c7] hover:bg-[#0369a1] border-[#0284c7] text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Check class="w-3.5 h-3.5" />
            <span>APROVAR & MOVER PARA REVISADO ➔</span>
          </button>

          <!-- When in Reviewed -->
          <div
            v-if="task.status === 'reviewed'"
            class="text-[#0284c7] flex items-center gap-1.5 font-bold"
          >
            <Loader2 class="w-3.5 h-3.5 animate-spin" />
            <span>MERGEANDO NO DEVELOP...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Task, TaskStatus } from '@/types'
import {
  Bot,
  Github,
  GitBranch,
  Copy,
  Check,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Terminal,
  Loader2,
  Play,
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  task: Task | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update-status', taskId: number, newStatus: TaskStatus): void
}>()

const copied = ref(false)

const aiSummary = computed(() => {
  return props.task?.ai_logs?.summary || null
})

const aiLogs = computed<string[]>(() => {
  const logs = props.task?.ai_logs?.logs
  if (Array.isArray(logs)) return logs
  return []
})

const previewUrl = computed(() => {
  if (props.task?.preview_url) return props.task.preview_url
  if (props.task?.ai_logs?.preview_url) return props.task.ai_logs.preview_url
  if (props.task?.task_code) {
    return `http://${props.task.task_code.toLowerCase()}.preview.bmo`
  }
  return '#'
})

const sandboxUrl = computed(() => {
  const prefix = props.task?.project?.prefix
  if (prefix === 'CST') return 'http://capyshowtime.bmo'
  if (prefix === 'CPH') return 'http://capihouse.bmo'
  return 'http://organizer.bmo'
})

function copyText(text: string) {
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function handleStatusChange(status: TaskStatus) {
  if (props.task) {
    emit('update-status', props.task.id, status)
    emit('close')
  }
}

function statusLabel(status: TaskStatus) {
  switch (status) {
    case 'backlog':
      return 'Backlog'
    case 'todo':
      return 'A Fazer'
    case 'in_progress':
      return 'Em Progresso'
    case 'review':
      return 'Em Revisão'
    case 'reviewed':
      return 'Revisado'
    case 'done':
      return 'Concluído'
  }
}

function statusBadgeClass(status: TaskStatus) {
  switch (status) {
    case 'backlog':
      return 'bg-[#f8f6f1] text-[#847062] border-[#D8CDC5]'
    case 'todo':
      return 'bg-[#fdf8f3] text-[#a66130] border-[#D8CDC5]'
    case 'in_progress':
      return 'bg-[#fffbeb] text-[#b07a3b] border-[#fde68a]'
    case 'review':
      return 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]'
    case 'reviewed':
      return 'bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd]'
    case 'done':
      return 'bg-[#f0fdf4] text-[#16a34a] border-[#16a34a]'
  }
}

function priorityLabel(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'Urgente'
    case 'high':
      return 'Alta'
    case 'medium':
      return 'Média'
    case 'low':
      return 'Baixa'
    default:
      return priority
  }
}

function priorityBadgeClass(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]'
    case 'high':
      return 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]'
    case 'low':
      return 'bg-[#f8f6f1] text-[#847062] border-[#D8CDC5]'
    default:
      return 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]'
  }
}
</script>
