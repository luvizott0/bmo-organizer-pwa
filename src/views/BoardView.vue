<template>
  <div class="h-full flex flex-col overflow-hidden bg-[#f8f6f1]">
    <AppHeader>
      <template #actions>
        <button
          @click="isNewTaskModalOpen = true"
          class="retro-button"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>NOVA TAREFA</span>
        </button>
      </template>
    </AppHeader>

    <!-- Empty Project State -->
    <div v-if="!projectsStore.selectedProject" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div class="retro-card p-8 max-w-md w-full text-center">
        <div class="w-12 h-12 rounded-xs bg-[#fdf8f3] border-2 border-[#D8CDC5] flex items-center justify-center text-[#a66130] mx-auto mb-3">
          <FolderPlus class="w-6 h-6" />
        </div>
        <h2 class="font-mono text-base font-bold text-[#422d16] mb-1">» NENHUM PROJETO SELECIONADO</h2>
        <p class="text-xs text-[#847062] font-sans mb-4">Selecione um projeto na barra lateral ou cadastre um novo projeto para visualizar o board.</p>
        <RouterLink
          to="/projects"
          class="retro-button inline-flex"
        >
          CADASTRAR PROJETO
        </RouterLink>
      </div>
    </div>

    <!-- Kanban Columns Area -->
    <div v-else class="flex-1 overflow-x-auto p-5 flex gap-4 select-none">
      <div
        v-for="col in columns"
        :key="col.id"
        class="w-80 flex-shrink-0 flex flex-col retro-card bg-[#fdf8f3]"
        @dragover.prevent
        @dragenter.prevent="dragOverColumn = col.id"
        @dragleave="dragOverColumn === col.id ? dragOverColumn = null : null"
        @drop="onDrop(col.id)"
        :class="{ 'ring-2 ring-[#a66130] bg-[#f8f6f1]': dragOverColumn === col.id }"
      >
        <!-- Column Header in CapiHouse retro style -->
        <div class="retro-card-header flex items-center justify-between" :style="{ backgroundColor: col.headerColor }">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-white/80"></span>
            <span>{{ col.title }}</span>
          </div>
          <span class="font-mono text-xs opacity-90 font-bold">
            [{{ (projectsStore.tasksByStatus[col.id] || []).length }}]
          </span>
        </div>

        <!-- Task Cards Area -->
        <div class="flex-1 overflow-y-auto p-2.5 space-y-2.5">
          <div
            v-for="task in projectsStore.tasksByStatus[col.id] || []"
            :key="task.id"
            draggable="true"
            @dragstart="onDragStart(task)"
            @click="openTaskDetails(task)"
            class="p-3 bg-white border-2 border-[#D8CDC5] rounded-xs shadow-xs hover:border-[#a66130] hover:shadow-sm transition-all duration-150 cursor-pointer"

          >
            <!-- Line 1: Task Code, Edit & Delete Buttons -->
            <div class="flex items-center justify-between pb-1.5 border-b border-[#D8CDC5]/40 mb-1.5">
              <span class="font-mono text-xs font-bold text-[#a66130] px-1.5 py-0.5 rounded-xs bg-[#fdf8f3] border border-[#D8CDC5]">
                {{ task.task_code }}
              </span>

              <div class="flex items-center gap-1">
                <button
                  @click.stop="openTaskDetails(task, true)"
                  class="text-[#847062] hover:text-[#a66130] p-1 rounded-xs hover:bg-[#f8f6f1] transition-colors cursor-pointer"
                  title="Editar tarefa"
                >
                  <Pencil class="w-3.5 h-3.5" />
                </button>
                <button
                  @click.stop="promptDeleteTask(task)"
                  class="text-[#847062] hover:text-[#dc2626] p-1 rounded-xs hover:bg-[#fef2f2] transition-colors cursor-pointer"
                  title="Excluir tarefa"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Line 2: Badges (Assignee, Type, Target Scope, Priority) -->
            <div class="flex flex-wrap items-center gap-1.5 mb-2">
              <span
                v-if="task.assignee_type === 'ai'"
                class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-[#fdf8f3] text-[#7d5628] border border-[#D8CDC5] flex items-center gap-1"
                title="Desenvolvido pelo Agente de IA"
              >
                <Bot class="w-3 h-3 text-[#a66130]" />
                IA
              </span>
              <span
                v-else
                class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-xs bg-[#f8f6f1] text-[#847062] border border-[#D8CDC5]"
              >
                DEV
              </span>

              <!-- Task Type Badge (Hotfix, Bugfix, Feature) -->
              <span
                class="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-2xs border uppercase tracking-wider"
                :class="task.type === 'hotfix' ? 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca] animate-pulse' : (task.type === 'bugfix' ? 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]' : 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]')"
              >
                {{ task.type === 'hotfix' ? '🔥 HOTFIX' : (task.type === 'bugfix' ? '🐛 FIX' : '✨ FEAT') }}
              </span>

              <!-- Target Scope Badge -->
              <span
                v-if="task.target_scope && task.target_scope !== 'auto'"
                class="font-mono text-[9px] font-bold px-1 py-0.5 rounded-2xs border uppercase"
                :class="task.target_scope === 'backend' ? 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]' : (task.target_scope === 'frontend' ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]' : 'bg-[#faf5ff] text-[#7e22ce] border-[#e9d5ff]')"
              >
                {{ task.target_scope === 'fullstack' ? 'FULL' : (task.target_scope === 'backend' ? 'API' : 'UI') }}
              </span>

              <span
                class="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-xs uppercase border ml-auto"
                :class="priorityBadgeClass(task.priority)"
              >
                {{ task.priority }}
              </span>
            </div>

            <!-- Title -->
            <h3 class="text-xs font-bold font-sans text-[#333333] leading-snug mb-1.5">
              {{ task.title }}
            </h3>

            <!-- Description excerpt -->
            <p v-if="task.description" class="text-[11px] text-[#847062] line-clamp-2 mb-2 leading-relaxed font-sans">
              {{ task.description }}
            </p>

            <!-- Branch info -->
            <div
              v-if="task.branch_name"
              class="flex items-center justify-between px-2 py-1 rounded-xs bg-[#f8f6f1] border border-[#D8CDC5] text-[10px] font-mono text-[#5f4120]"
            >
              <div class="flex items-center gap-1 truncate">
                <GitBranch class="w-3 h-3 text-[#a66130] shrink-0" />
                <span class="truncate">{{ task.branch_name }}</span>
              </div>
              <button
                @click.stop="copyBranch(task.branch_name)"
                class="hover:text-[#a66130] p-0.5 transition-colors cursor-pointer"
                title="Copiar branch"
              >
                <Copy class="w-3 h-3" />
              </button>
            </div>

            <!-- AI Progress / Summary Box -->
            <div
              v-if="task.ai_logs && (task.ai_logs.logs?.length || task.ai_logs.summary)"
              class="mt-2 p-2 rounded-xs text-[10px] font-mono border"
              :class="task.status === 'in_progress' ? 'bg-[#fdf8f3] text-[#7d5628] border-[#a66130]' : 'bg-[#f8f6f1] text-[#847062] border-[#D8CDC5]'"
            >
              <div class="flex items-center justify-between font-bold text-[9px] uppercase mb-1">
                <span class="flex items-center gap-1">
                  <Bot class="w-3 h-3 text-[#a66130]" />
                  {{ task.status === 'in_progress' ? 'IA DESENVOLVENDO...' : 'RESUMO DA IA' }}
                </span>
                <span v-if="task.status === 'in_progress'" class="w-1.5 h-1.5 rounded-full bg-[#a66130] animate-pulse"></span>
              </div>
              <p v-if="task.ai_logs.summary" class="text-[10px] text-[#333333] font-sans line-clamp-2">
                {{ task.ai_logs.summary }}
              </p>
              <p v-else-if="task.ai_logs.logs?.length" class="text-[9px] truncate opacity-80">
                {{ task.ai_logs.logs[task.ai_logs.logs.length - 1] }}
              </p>
            </div>

            <!-- Isolated Preview ready card -->
            <div
              v-if="task.status === 'review' || task.preview_url || task.ai_logs?.preview_url"
              class="mt-2 p-2 rounded-xs bg-[#fdf8f3] border-2 border-[#16a34a] text-[11px] text-[#5f4120] flex items-center justify-between font-mono"
            >
              <span class="flex items-center gap-1 font-bold text-[10px] text-[#15803d]">
                <Sparkles class="w-3 h-3 text-[#16a34a]" />
                PREVIEW PRONTO
              </span>
              <a
                :href="task.preview_url || task.ai_logs?.preview_url || `http://${task.task_code.toLowerCase()}.preview.bmo`"
                target="_blank"
                @click.stop
                class="font-bold underline text-[#15803d] text-[10px] hover:text-[#166534]"
              >
                [ TESTAR PREVIEW ↗ ]
              </a>
            </div>


            <!-- Card Action Footer -->
            <div class="mt-2.5 pt-2 border-t border-[#D8CDC5] flex items-center justify-between">
              <!-- To Do -> In Progress -->
              <template v-if="task.status === 'todo' || task.status === 'backlog'">
                <span class="text-[10px] font-mono text-[#847062]">[A FAZER]</span>
                <button
                  @click.stop="projectsStore.updateTaskStatus(task.id, 'in_progress')"
                  class="retro-button text-[10px] py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                  :title="task.assignee_type === 'ai' ? 'Disparar Agente de IA para programar a tarefa' : 'Iniciar desenvolvimento manual'"
                >
                  <Play class="w-3 h-3 fill-current" />
                  <span>{{ task.assignee_type === 'ai' ? 'INICIAR IA' : 'INICIAR' }}</span>
                </button>
              </template>

              <!-- In Progress -> Review -->
              <template v-else-if="task.status === 'in_progress'">
                <span class="text-[10px] font-mono text-[#a66130] font-bold flex items-center gap-1">
                  <Loader2 v-if="task.assignee_type === 'ai'" class="w-3 h-3 animate-spin" />
                  <span>{{ task.assignee_type === 'ai' ? 'IA CODANDO...' : 'EM ANDAMENTO' }}</span>
                </span>
                <button
                  @click.stop="projectsStore.updateTaskStatus(task.id, 'review')"
                  class="retro-button-secondary text-[10px] py-1 px-2 border border-[#D8CDC5] bg-white hover:bg-[#e8c9a5] cursor-pointer"
                  title="Mover para revisão no Sandbox"
                >
                  <span>CONCLUIR ➔</span>
                </button>
              </template>

              <!-- Review -> Reviewed -->
              <template v-else-if="task.status === 'review'">
                <span class="text-[10px] font-mono text-[#7d5628] font-bold">EM REVISÃO</span>
                <button
                  @click.stop="projectsStore.updateTaskStatus(task.id, 'reviewed')"
                  class="retro-button text-[10px] py-1 px-2.5 bg-[#0284c7] hover:bg-[#0369a1] border-[#0284c7] text-white flex items-center gap-1 cursor-pointer"
                  title="Marcar como revisado e disparar merge automático no develop"
                >
                  <Check class="w-3 h-3" />
                  <span>REVISADO ➔</span>
                </button>
              </template>

              <!-- Reviewed -> Merging to develop -->
              <template v-else-if="task.status === 'reviewed'">
                <span class="text-[10px] font-mono text-[#0284c7] font-bold flex items-center gap-1.5 animate-pulse">
                  <Loader2 class="w-3 h-3 animate-spin" />
                  <span>MERGEANDO NO DEVELOP...</span>
                </span>
              </template>

              <!-- Done -->
              <template v-else-if="task.status === 'done'">
                <span class="text-[10px] font-mono text-[#16a34a] flex items-center gap-1 font-bold">
                  <CheckCircle2 class="w-3 h-3" />
                  CONCLUÍDO
                </span>
              </template>
            </div>
          </div>


          <!-- Empty Column placeholder -->
          <div
            v-if="(projectsStore.tasksByStatus[col.id] || []).length === 0"
            class="h-28 flex flex-col items-center justify-center text-[#847062] text-xs font-mono border-2 border-dashed border-[#D8CDC5] rounded-xs"
          >
            [ VAZIO ]
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Nova Tarefa -->
    <div
      v-if="isNewTaskModalOpen"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4"
    >
      <div class="w-full max-w-lg retro-card shadow-lg p-0 text-[#333333] bg-white">
        <div class="retro-card-header flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span>NOVA TAREFA // {{ projectsStore.selectedProject?.prefix }}</span>
          </div>
          <button @click="isNewTaskModalOpen = false" class="text-white/80 hover:text-white cursor-pointer font-mono font-bold">
            [X]
          </button>
        </div>

        <form @submit.prevent="handleCreateTask" class="p-5 space-y-4 font-sans">
          <div>
            <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">» TÍTULO DA TAREFA</label>
            <input
              v-model="newTask.title"
              type="text"
              required
              placeholder="Ex: Implementar visualização de episódios recentes"
              class="retro-input"
            />
          </div>

          <div>
            <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">
              » ESPECIFICAÇÃO / PROMPT PARA IA OU DEV
            </label>
            <textarea
              v-model="newTask.description"
              rows="3"
              placeholder="Descreva o que deve ser feito para guiar a execução do agente..."
              class="retro-input"
            ></textarea>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">» TIPO DE TAREFA</label>
              <select
                v-model="newTask.type"
                class="retro-input font-mono font-bold"
              >
                <option value="feature">✨ Feature (develop)</option>
                <option value="bugfix">🐛 Bugfix (develop)</option>
                <option value="hotfix">🔥 Hotfix (direto na main)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">» PRIORIDADE</label>
              <select
                v-model="newTask.priority"
                class="retro-input font-mono font-bold"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">» RESPONSÁVEL</label>
              <select
                v-model="newTask.assignee_type"
                class="retro-input font-mono font-bold"
              >
                <option value="user">Humano (Dev)</option>
                <option value="ai">Agente de IA (Autônomo)</option>
              </select>
            </div>
          </div>

          <!-- Preview Pill -->
          <div class="p-2.5 rounded-xs bg-[#fdf8f3] border border-[#D8CDC5] text-[11px] text-[#5f4120] space-y-1 font-mono">
            <div>ID Sequencial: <span class="text-[#a66130] font-bold">{{ projectsStore.selectedProject?.prefix }}-{{ String((projectsStore.selectedProject?.last_task_number ?? 0) + 1).padStart(3, '0') }}</span></div>
            <div>Branch Automática: <span class="text-[#5f4120]">feat/{{ projectsStore.selectedProject?.prefix }}-...</span></div>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-[#D8CDC5]">
            <button
              type="button"
              @click="isNewTaskModalOpen = false"
              class="retro-button-secondary font-mono text-xs px-3 py-1.5 rounded-xs"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="retro-button"
            >
              CRIAR TAREFA
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Task Details & AI Execution Logs Modal -->

    <TaskDetailsModal
      :is-open="isDetailsModalOpen"
      :task="selectedTaskForModal"
      :init-edit="initEditModal"
      @close="isDetailsModalOpen = false"
      @update-status="handleModalStatusChange"
      @delete="handleDeleteFromModal"
    />

    <!-- Retro Delete Confirmation Modal -->
    <div
      v-if="isDeleteModalOpen && taskToDelete"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 select-none"
      @click.self="isDeleteModalOpen = false"
    >
      <div class="w-full max-w-md retro-card shadow-2xl p-0 text-[#333333] bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <!-- Header -->
        <div class="retro-card-header bg-[#dc2626] text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Trash2 class="w-4 h-4" />
            <span class="font-mono text-xs font-bold uppercase tracking-wider">CONFIRMAR EXCLUSÃO</span>
          </div>
          <button
            @click="isDeleteModalOpen = false"
            class="text-white/80 hover:text-white cursor-pointer font-mono font-bold px-1.5 py-0.5 rounded-xs hover:bg-white/10"
          >
            [X]
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 font-sans text-center">
          <div class="w-12 h-12 rounded-full bg-[#fef2f2] border-2 border-[#fecaca] text-[#dc2626] flex items-center justify-center mx-auto">
            <AlertTriangle class="w-6 h-6" />
          </div>

          <div>
            <h3 class="font-mono text-sm font-bold text-[#422d16] mb-1">
              Excluir tarefa [{{ taskToDelete.task_code }}]?
            </h3>
            <p class="text-xs text-[#847062] font-mono font-semibold px-4 line-clamp-2">
              "{{ taskToDelete.title }}"
            </p>
          </div>

          <div class="p-3 bg-[#fdf8f3] border border-[#D8CDC5] rounded-xs text-[11px] text-[#847062] text-left space-y-1 font-mono">
            <div>⚠️ <span class="font-bold text-[#dc2626]">Atenção:</span> Esta ação é permanente.</div>
            <div>• A tarefa será removida do Kanban do BMO.</div>
            <div>• Quaisquer branches de teste vinculadas deixarão de ser associadas.</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-[#fdf8f3] border-t-2 border-[#D8CDC5] flex items-center justify-end gap-2.5 font-mono text-xs">
          <button
            type="button"
            @click="isDeleteModalOpen = false"
            class="retro-button-secondary py-1.5 px-3 cursor-pointer"
          >
            CANCELAR
          </button>
          <button
            type="button"
            @click="confirmDeleteTask"
            :disabled="isDeleting"
            class="retro-button py-1.5 px-4 bg-[#dc2626] hover:bg-[#b91c1c] border-[#dc2626] text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Loader2 v-if="isDeleting" class="w-3.5 h-3.5 animate-spin" />
            <Trash2 v-else class="w-3.5 h-3.5" />
            <span>{{ isDeleting ? 'EXCLUINDO...' : 'SIM, EXCLUIR TAREFA' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import type { Task, TaskStatus } from '@/types'
import AppHeader from '@/components/layout/AppHeader.vue'
import TaskDetailsModal from '@/components/board/TaskDetailsModal.vue'
import {
  Plus,
  Bot,
  GitBranch,
  Copy,
  Sparkles,
  FolderPlus,
  Play,
  Check,
  CheckCircle2,
  Loader2,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-vue-next'

const projectsStore = useProjectsStore()

const selectedTaskForModal = ref<Task | null>(null)
const isDetailsModalOpen = ref(false)
const initEditModal = ref(false)

const taskToDelete = ref<Task | null>(null)
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)

function openTaskDetails(task: Task, startEdit = false) {
  selectedTaskForModal.value = task
  initEditModal.value = startEdit
  isDetailsModalOpen.value = true
}

function promptDeleteTask(task: Task) {
  taskToDelete.value = task
  isDeleteModalOpen.value = true
}

function handleDeleteFromModal(task: Task) {
  isDetailsModalOpen.value = false
  promptDeleteTask(task)
}

async function confirmDeleteTask() {
  if (!taskToDelete.value) return

  try {
    isDeleting.value = true
    await projectsStore.deleteTask(taskToDelete.value.id)
    isDeleteModalOpen.value = false
    taskToDelete.value = null
  } catch (err: any) {
    alert(`Erro ao excluir tarefa: ${err?.message || 'Falha na requisição'}`)
  } finally {
    isDeleting.value = false
  }
}

async function handleModalStatusChange(taskId: number, newStatus: TaskStatus) {
  await projectsStore.updateTaskStatus(taskId, newStatus)
  const found = projectsStore.tasks.find((t) => t.id === taskId)
  if (found) {
    selectedTaskForModal.value = found
  }
}

// Keep selectedTaskForModal in sync with store tasks
watch(
  () => projectsStore.tasks,
  (newTasks) => {
    if (selectedTaskForModal.value) {
      const updated = newTasks.find((t) => t.id === selectedTaskForModal.value?.id)
      if (updated) {
        selectedTaskForModal.value = updated
      }
    }
  },
  { deep: true }
)

// Auto-refresh tasks every 4s if any AI task is in progress or reviewed
let pollInterval: any = null
onMounted(() => {
  pollInterval = setInterval(async () => {
    const hasActiveTasks = projectsStore.tasks.some(
      (t) => (t.status === 'in_progress' && t.assignee_type === 'ai') || t.status === 'reviewed'
    )
    if (hasActiveTasks) {
      await projectsStore.loadTasks()
    }
  }, 4000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})


const columns: { id: TaskStatus; title: string; headerColor: string }[] = [
  { id: 'todo', title: 'A FAZER', headerColor: '#a66130' },
  { id: 'in_progress', title: 'EM PROGRESSO', headerColor: '#b07a3b' },
  { id: 'review', title: 'EM REVISÃO', headerColor: '#7d5628' },
  { id: 'reviewed', title: 'REVISADO', headerColor: '#0284c7' },
  { id: 'done', title: 'CONCLUÍDO', headerColor: '#16a34a' },
]

const draggedTask = ref<Task | null>(null)
const dragOverColumn = ref<TaskStatus | null>(null)

const isNewTaskModalOpen = ref(false)
const isSubmitting = ref(false)

const newTask = ref({
  title: '',
  description: '',
  type: 'feature' as const,
  priority: 'medium',
  assignee_type: 'user',
})

const sandboxUrl = computed(() => {
  const p = projectsStore.selectedProject
  if (p?.prefix === 'CST') return 'http://capyshowtime.bmo'
  if (p?.prefix === 'CPH') return 'http://capihouse.bmo'
  return 'http://bmo.bmo'
})

function onDragStart(task: Task) {
  draggedTask.value = task
}

async function onDrop(newStatus: TaskStatus) {
  if (draggedTask.value && draggedTask.value.status !== newStatus) {
    const taskId = draggedTask.value.id
    await projectsStore.updateTaskStatus(taskId, newStatus)
  }
  draggedTask.value = null
  dragOverColumn.value = null
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

function copyBranch(branch: string) {
  navigator.clipboard.writeText(branch)
}

async function handleCreateTask() {
  if (!projectsStore.selectedProjectId) return
  isSubmitting.value = true
  try {
    await projectsStore.addTask({
      project_id: projectsStore.selectedProjectId,
      title: newTask.value.title,
      description: newTask.value.description,
      type: newTask.value.type,
      priority: newTask.value.priority,
      assignee_type: newTask.value.assignee_type,
      status: 'todo',
    })
    isNewTaskModalOpen.value = false
    newTask.value = {
      title: '',
      description: '',
      type: 'feature',
      priority: 'medium',
      assignee_type: 'user',
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
