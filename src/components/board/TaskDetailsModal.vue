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
          <span class="truncate text-xs font-mono uppercase tracking-wider">
            {{ isEditing ? 'EDITAR TAREFA' : 'DETALHES DA TAREFA' }}
          </span>
        </div>
        <div class="flex items-center gap-1.5">
          <template v-if="!isEditing">
            <button
              @click="startEditing"
              class="text-xs font-mono font-bold px-2 py-0.5 rounded-xs bg-white/20 hover:bg-white/30 text-white flex items-center gap-1 cursor-pointer transition-colors"
              title="Editar tarefa"
            >
              <Pencil class="w-3 h-3" />
              <span>EDITAR</span>
            </button>
            <button
              @click="promptDelete"
              class="text-xs font-mono font-bold px-2 py-0.5 rounded-xs bg-[#dc2626]/80 hover:bg-[#dc2626] text-white flex items-center gap-1 cursor-pointer transition-colors"
              title="Excluir tarefa"
            >
              <Trash2 class="w-3 h-3" />
              <span>EXCLUIR</span>
            </button>
          </template>
          <button
            @click="$emit('close')"
            class="text-white/80 hover:text-white cursor-pointer font-mono font-bold px-1.5 py-0.5 rounded-xs hover:bg-white/10 transition-colors ml-1"
          >
            [X]
          </button>
        </div>
      </div>

      <!-- Edit Mode Form -->
      <form v-if="isEditing" @submit.prevent="saveEditing" class="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
        <div>
          <label class="block text-xs font-mono font-bold text-[#422d16] mb-1">
            TÍTULO DA TAREFA ::
          </label>
          <input
            v-model="editForm.title"
            type="text"
            required
            class="retro-input w-full font-mono text-xs"
            placeholder="Ex: Adicionar endpoint de listagem"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-mono font-bold text-[#422d16] mb-1">
              TIPO ::
            </label>
            <select v-model="editForm.type" class="retro-input w-full font-mono text-xs cursor-pointer">
              <option value="feature">✨ Feature</option>
              <option value="bugfix">🐛 Bugfix</option>
              <option value="hotfix">🔥 Hotfix</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-mono font-bold text-[#422d16] mb-1">
              PRIORIDADE ::
            </label>
            <select v-model="editForm.priority" class="retro-input w-full font-mono text-xs cursor-pointer">
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-mono font-bold text-[#422d16] mb-1">
              COLUNA (STATUS) ::
            </label>
            <select v-model="editForm.status" class="retro-input w-full font-mono text-xs cursor-pointer">
              <option value="todo">A Fazer</option>
              <option value="in_progress">Em Progresso</option>
              <option value="review">Em Revisão</option>
              <option value="reviewed">Revisado</option>
              <option value="done">Concluído</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-mono font-bold text-[#422d16] mb-1">
              RESPONSÁVEL ::
            </label>
            <select v-model="editForm.assignee_type" class="retro-input w-full font-mono text-xs cursor-pointer">
              <option value="ai">🤖 Agente de IA</option>
              <option value="user">👤 Manual (Dev)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-mono font-bold text-[#422d16] mb-1">
              ESCOPO DO REPOSITÓRIO ::
            </label>
            <select v-model="editForm.target_scope" class="retro-input w-full font-mono text-xs cursor-pointer">
              <option value="auto">⚡ Auto (IA Detecta)</option>
              <option value="backend">⚙️ Backend (API)</option>
              <option value="frontend">💻 Frontend (PWA)</option>
              <option value="fullstack">🌐 Fullstack (Ambos)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-mono font-bold text-[#422d16] mb-1">
            DESCRIÇÃO / ESPECIFICAÇÃO ::
          </label>
          <textarea
            v-model="editForm.description"
            rows="6"
            class="retro-input w-full text-xs font-sans"
            placeholder="Descreva os requisitos e detalhes da tarefa..."
          ></textarea>
        </div>
      </form>

      <!-- View Mode Body -->
      <div v-else class="p-6 space-y-5 max-h-[80vh] overflow-y-auto font-sans">
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

            <!-- Task Type Badge -->
            <span
              class="font-mono text-xs font-bold px-2 py-0.5 rounded-xs uppercase border"
              :class="task.type === 'hotfix' ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca] animate-pulse' : (task.type === 'bugfix' ? 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]' : 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]')"
            >
              {{ task.type === 'hotfix' ? '🔥 HOTFIX (Merge na Main)' : (task.type === 'bugfix' ? '🐛 BUGFIX' : '✨ FEATURE') }}
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

            <span
              v-if="task.target_scope && task.target_scope !== 'auto'"
              class="font-mono text-xs font-bold px-2 py-0.5 rounded-xs border uppercase flex items-center gap-1"
              :class="task.target_scope === 'backend' ? 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]' : (task.target_scope === 'frontend' ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]' : 'bg-[#faf5ff] text-[#7e22ce] border-[#e9d5ff]')"
            >
              {{ task.target_scope === 'fullstack' ? '🌐 FULLSTACK' : (task.target_scope === 'backend' ? '⚙️ BACKEND (API)' : '💻 FRONTEND (UI)') }}
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
          <!-- Project & Repositories -->
          <div class="p-2.5 rounded-xs bg-[#f8f6f1] border border-[#D8CDC5] space-y-1.5">
            <span class="text-[10px] text-[#847062] block font-bold">REPOSITÓRIOS VINCULADOS</span>
            <div v-if="task.project?.backend_repo" class="text-[11px] truncate flex items-center gap-1">
              <span class="text-[#1d4ed8] font-bold">API:</span>
              <span class="truncate">{{ task.project.backend_repo }}</span>
            </div>
            <div v-if="task.project?.frontend_repo" class="text-[11px] truncate flex items-center gap-1">
              <span class="text-[#15803d] font-bold">PWA:</span>
              <span class="truncate">{{ task.project.frontend_repo }}</span>
            </div>
            <div v-if="!task.project?.backend_repo && !task.project?.frontend_repo && task.project?.github_repo" class="text-[11px] truncate flex items-center gap-1">
              <Github class="w-3 h-3 text-[#847062]" />
              <span class="truncate">{{ task.project.github_repo }}</span>
            </div>
          </div>

          <!-- Base Branches -->
          <div class="p-2.5 rounded-xs bg-[#f8f6f1] border border-[#D8CDC5] space-y-1.5">
            <span class="text-[10px] text-[#847062] block font-bold">BRANCH BASE DE MERGE</span>
            <div class="text-[11px] flex items-center gap-1.5 text-[#422d16]">
              <GitBranch class="w-3.5 h-3.5 text-[#a66130]" />
              <span class="font-bold">
                {{ task.type === 'hotfix' ? 'main' : (task.project?.base_branch || 'develop') }}
              </span>
              <span v-if="task.type === 'hotfix'" class="text-[9px] text-[#dc2626] font-bold">
                [PRODUÇÃO DIRETA]
              </span>
            </div>
          </div>
        </div>

        <!-- Git Feature Branch Info -->
        <div v-if="task.branch_name" class="p-3 rounded-xs bg-[#fdf8f3] border border-[#D8CDC5] text-xs font-mono space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-[#847062] uppercase tracking-wider flex items-center gap-1.5">
              <GitBranch class="w-3.5 h-3.5 text-[#a66130]" />
              Branch de Desenvolvimento
            </span>
            <button
              @click="copyText(task.branch_name)"
              class="text-[10px] font-bold text-[#a66130] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Copy class="w-3 h-3" />
              <span>{{ copied ? 'COPIADO!' : 'COPIAR' }}</span>
            </button>
          </div>
          <div class="p-2 rounded-xs bg-[#ffffff] border border-[#D8CDC5] text-[#422d16] font-bold break-all select-all">
            {{ task.branch_name }}
          </div>
        </div>

        <!-- AI Agent Terminal Logs -->
        <div v-if="task.assignee_type === 'ai'" class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold text-[#847062] uppercase tracking-wider flex items-center gap-1.5">
              <Terminal class="w-3.5 h-3.5 text-[#a66130]" />
              Progresso do Agente Autônomo
            </span>
            <span
              v-if="task.status === 'in_progress'"
              class="text-[10px] font-mono text-[#a66130] font-bold flex items-center gap-1 animate-pulse"
            >
              <Loader2 class="w-3 h-3 animate-spin" />
              EXECUTANDO NO SANDBOX...
            </span>
          </div>

          <div class="retro-card p-3 bg-[#1e1e1e] text-[#d4d4d4] font-mono text-[11px] rounded-xs border-2 border-[#333333] shadow-inner max-h-56 overflow-y-auto space-y-1.5">
            <div v-if="aiSummary" class="text-[#a6e22e] font-bold border-b border-[#333333] pb-1.5 mb-1.5">
              » {{ aiSummary }}
            </div>
            <div class="space-y-1">
              <template v-if="aiLogs.length > 0">
                <div v-for="(log, i) in aiLogs" :key="i" class="leading-relaxed">
                  <span class="text-[#66d9ef] select-none">➜ </span>
                  <span class="text-[#f8f8f2]">{{ log }}</span>
                </div>
              </template>
              <div v-else class="text-[#78716c] italic">
                Nenhum log registrado ainda. A execução começará assim que a tarefa entrar em progresso.
              </div>
            </div>
          </div>
        </div>

        <!-- Isolated Task Preview Box -->
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
      <div v-if="isEditing" class="p-4 bg-[#fdf8f3] border-t-2 border-[#D8CDC5] flex items-center justify-between font-mono text-xs">
        <button
          type="button"
          @click="cancelEditing"
          class="retro-button-secondary py-1.5 px-3"
        >
          CANCELAR
        </button>
        <button
          type="button"
          @click="saveEditing"
          :disabled="saving"
          class="retro-button py-1.5 px-4 flex items-center gap-1.5"
        >
          <Check class="w-3.5 h-3.5" />
          <span>{{ saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES' }}</span>
        </button>
      </div>

      <div v-else class="p-4 bg-[#fdf8f3] border-t-2 border-[#D8CDC5] flex items-center justify-between font-mono text-xs">
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
import { ref, computed, watch } from 'vue'
import type { Task, TaskStatus, TaskType, TaskPriority, TargetScope, AssigneeType } from '@/types'
import { useProjectsStore } from '@/stores/projects'
import {
  Bot,
  Github,
  GitBranch,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Terminal,
  Loader2,
  Play,
  Pencil,
  Trash2,
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  task: Task | null
  initEdit?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update-status', taskId: number, newStatus: TaskStatus): void
  (e: 'delete', task: Task): void
}>()

const projectsStore = useProjectsStore()

const copied = ref(false)
const isEditing = ref(false)
const saving = ref(false)

const editForm = ref({
  title: '',
  description: '',
  type: 'feature' as TaskType,
  priority: 'medium' as TaskPriority,
  status: 'todo' as TaskStatus,
  target_scope: 'auto' as TargetScope,
  assignee_type: 'ai' as AssigneeType,
})

watch(
  () => props.task,
  (newTask) => {
    if (newTask && props.initEdit) {
      startEditing()
    } else {
      isEditing.value = false
    }
  },
  { immediate: true }
)

function startEditing() {
  if (!props.task) return
  editForm.value = {
    title: props.task.title,
    description: props.task.description || '',
    type: (props.task.type || 'feature') as TaskType,
    priority: (props.task.priority || 'medium') as TaskPriority,
    status: props.task.status === 'backlog' ? 'todo' : props.task.status,
    target_scope: (props.task.target_scope || 'auto') as TargetScope,
    assignee_type: props.task.assignee_type || 'ai',
  }
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
}

async function saveEditing() {
  if (!props.task) return
  if (!editForm.value.title.trim()) {
    alert('O título da tarefa é obrigatório.')
    return
  }

  try {
    saving.value = true
    await projectsStore.updateTask(props.task.id, {
      title: editForm.value.title.trim(),
      description: editForm.value.description.trim() || null,
      type: editForm.value.type,
      priority: editForm.value.priority,
      status: editForm.value.status,
      target_scope: editForm.value.target_scope,
      assignee_type: editForm.value.assignee_type,
    })
    isEditing.value = false
  } catch (err: any) {
    alert(`Erro ao salvar tarefa: ${err?.message || 'Falha na requisição'}`)
  } finally {
    saving.value = false
  }
}

function promptDelete() {
  if (props.task) {
    emit('delete', props.task)
  }
}

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
