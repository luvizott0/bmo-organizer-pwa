<template>
  <div class="h-full flex flex-col overflow-hidden bg-[#f8fafc]">
    <AppHeader>
      <template #actions>
        <button
          @click="isNewTaskModalOpen = true"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all duration-150 cursor-pointer"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span>Nova Tarefa</span>
        </button>
      </template>
    </AppHeader>

    <!-- Empty Project State -->
    <div v-if="!projectsStore.selectedProject" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div class="w-16 h-16 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 mb-4">
        <FolderPlus class="w-8 h-8 stroke-[1.5]" />
      </div>
      <h2 class="text-lg font-extrabold text-slate-900 mb-1">Nenhum projeto selecionado</h2>
      <p class="text-xs text-slate-500 max-w-sm mb-5">Selecione um projeto na barra lateral ou cadastre um novo projeto para visualizar o board.</p>
      <RouterLink
        to="/projects"
        class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all"
      >
        Cadastrar Projeto
      </RouterLink>
    </div>

    <!-- Kanban Area -->
    <div v-else class="flex-1 overflow-x-auto p-6 flex gap-5 select-none">
      <div
        v-for="col in columns"
        :key="col.id"
        class="w-80 flex-shrink-0 flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200/70 shadow-2xs transition-all"
        @dragover.prevent
        @dragenter.prevent="dragOverColumn = col.id"
        @dragleave="dragOverColumn === col.id ? dragOverColumn = null : null"
        @drop="onDrop(col.id)"
        :class="{ 'ring-2 ring-indigo-500/40 bg-indigo-50/20 border-indigo-200': dragOverColumn === col.id }"
      >
        <!-- Column Header -->
        <div class="p-3.5 flex items-center justify-between border-b border-slate-200/60">
          <div class="flex items-center gap-2.5">
            <span class="w-2.5 h-2.5 rounded-full shadow-2xs" :class="col.dotColor"></span>
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-700">
              {{ col.title }}
            </h2>
          </div>
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-2xs">
            {{ (projectsStore.tasksByStatus[col.id] || []).length }}
          </span>
        </div>

        <!-- Task Cards Area -->
        <div class="flex-1 overflow-y-auto p-3 space-y-3">
          <div
            v-for="task in projectsStore.tasksByStatus[col.id] || []"
            :key="task.id"
            draggable="true"
            @dragstart="onDragStart(task)"
            class="group p-4 rounded-2xl bg-white hover:bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-150 cursor-grab active:cursor-grabbing shadow-xs hover:shadow-md"
          >
            <!-- Card Header: Code & Badges -->
            <div class="flex items-center justify-between mb-2.5">
              <span class="font-mono text-xs font-bold text-indigo-600 px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 shadow-2xs">
                {{ task.task_code }}
              </span>

              <div class="flex items-center gap-1.5">
                <span
                  v-if="task.assignee_type === 'ai'"
                  class="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 shadow-2xs"
                  title="Desenvolvido pelo Agente de IA"
                >
                  <Bot class="w-3 h-3 stroke-[2.2]" />
                  IA
                </span>
                <span
                  v-else
                  class="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60"
                >
                  <User class="w-3 h-3 stroke-[2.2]" />
                  Dev
                </span>

                <span
                  class="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border"
                  :class="priorityBadgeClass(task.priority)"
                >
                  {{ task.priority }}
                </span>
              </div>
            </div>

            <!-- Title -->
            <h3 class="text-xs font-bold text-slate-900 leading-snug mb-1.5">
              {{ task.title }}
            </h3>

            <!-- Description excerpt -->
            <p v-if="task.description" class="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
              {{ task.description }}
            </p>

            <!-- Branch info -->
            <div
              v-if="task.branch_name"
              class="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px] font-mono text-slate-600 hover:text-slate-900 transition-colors"
            >
              <div class="flex items-center gap-1.5 truncate">
                <GitBranch class="w-3 h-3 text-indigo-500 shrink-0 stroke-[2.2]" />
                <span class="truncate">{{ task.branch_name }}</span>
              </div>
              <button
                @click.stop="copyBranch(task.branch_name)"
                class="hover:text-indigo-600 p-0.5 transition-colors cursor-pointer"
                title="Copiar branch"
              >
                <Copy class="w-3 h-3" />
              </button>
            </div>

            <!-- AI Progress or Summary Box -->
            <div
              v-if="task.ai_logs && (task.ai_logs.logs?.length || task.ai_logs.summary)"
              class="mt-2.5 p-2 rounded-xl text-[11px] font-mono border"
              :class="task.status === 'in_progress' ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-slate-50 text-slate-600 border-slate-200'"
            >
              <div class="flex items-center justify-between font-bold text-[10px] uppercase mb-1">
                <span class="flex items-center gap-1">
                  <Bot class="w-3 h-3 text-purple-600" />
                  {{ task.status === 'in_progress' ? 'IA Desenvolvendo...' : 'Resumo da IA' }}
                </span>
                <span v-if="task.status === 'in_progress'" class="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
              </div>
              <p v-if="task.ai_logs.summary" class="text-[10px] text-slate-700 font-sans line-clamp-2">
                {{ task.ai_logs.summary }}
              </p>
              <p v-else-if="task.ai_logs.logs?.length" class="text-[10px] truncate opacity-80">
                {{ task.ai_logs.logs[task.ai_logs.logs.length - 1] }}
              </p>
            </div>

            <!-- Sandbox ready card -->
            <div
              v-if="task.status === 'review'"
              class="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between"
            >
              <span class="flex items-center gap-1.5 font-bold">
                <Sparkles class="w-3.5 h-3.5 text-amber-600" />
                Pronto no Sandbox
              </span>
              <a
                :href="sandboxUrl"
                target="_blank"
                class="font-bold underline hover:text-amber-900 text-[11px]"
              >
                Testar no .bmo ↗
              </a>
            </div>
          </div>

          <!-- Empty Column placeholder -->
          <div
            v-if="(projectsStore.tasksByStatus[col.id] || []).length === 0"
            class="h-32 flex flex-col items-center justify-center text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-2xl font-medium"
          >
            Nenhuma tarefa aqui
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Nova Tarefa -->
    <div
      v-if="isNewTaskModalOpen"
      class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl p-6 text-slate-900">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-2.5">
            <span class="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              {{ projectsStore.selectedProject?.prefix }}
            </span>
            <h2 class="text-base font-extrabold text-slate-900">Nova Tarefa para {{ projectsStore.selectedProject?.name }}</h2>
          </div>
          <button @click="isNewTaskModalOpen = false" class="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleCreateTask" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Título da Tarefa</label>
            <input
              v-model="newTask.title"
              type="text"
              required
              placeholder="Ex: Implementar visualização de episódios recentes"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors shadow-2xs"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">
              Especificação / Prompt para o Agente ou Desenvolvedor
            </label>
            <textarea
              v-model="newTask.description"
              rows="3"
              placeholder="Explique o objetivo, arquivos ou regras de negócio para execução..."
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 transition-colors shadow-2xs"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Prioridade</label>
              <select
                v-model="newTask.priority"
                class="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 shadow-2xs font-medium"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Responsável Inicial</label>
              <select
                v-model="newTask.assignee_type"
                class="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 shadow-2xs font-medium"
              >
                <option value="user">Humano (Dev)</option>
                <option value="ai">Agente de IA (Autônomo)</option>
              </select>
            </div>
          </div>

          <!-- Preview Pill -->
          <div class="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-slate-600 space-y-1 font-mono">
            <div>Código Único: <span class="text-indigo-600 font-bold">{{ projectsStore.selectedProject?.prefix }}-{{ String((projectsStore.selectedProject?.last_task_number ?? 0) + 1).padStart(3, '0') }}</span></div>
            <div>Branch Automática: <span class="text-indigo-600 font-semibold">feat/{{ projectsStore.selectedProject?.prefix }}-...</span></div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              @click="isNewTaskModalOpen = false"
              class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Criar Tarefa
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import type { Task, TaskStatus } from '@/types'
import AppHeader from '@/components/layout/AppHeader.vue'
import {
  Plus,
  Bot,
  User,
  GitBranch,
  Copy,
  Sparkles,
  FolderPlus,
  X,
} from 'lucide-vue-next'

const projectsStore = useProjectsStore()

const columns: { id: TaskStatus; title: string; dotColor: string }[] = [
  { id: 'backlog', title: 'Backlog', dotColor: 'bg-slate-400' },
  { id: 'todo', title: 'A Fazer', dotColor: 'bg-indigo-500' },
  { id: 'in_progress', title: 'Em Progresso (IA/Dev)', dotColor: 'bg-amber-500' },
  { id: 'review', title: 'Em Revisão (Sandbox)', dotColor: 'bg-purple-500' },
  { id: 'done', title: 'Concluído', dotColor: 'bg-emerald-500' },
]

const draggedTask = ref<Task | null>(null)
const dragOverColumn = ref<TaskStatus | null>(null)

const isNewTaskModalOpen = ref(false)
const isSubmitting = ref(false)

const newTask = ref({
  title: '',
  description: '',
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
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'high':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'low':
      return 'bg-slate-100 text-slate-600 border-slate-200'
    default:
      return 'bg-blue-50 text-blue-700 border-blue-200'
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
      priority: newTask.value.priority,
      assignee_type: newTask.value.assignee_type,
      status: 'todo',
    })
    isNewTaskModalOpen.value = false
    newTask.value = {
      title: '',
      description: '',
      priority: 'medium',
      assignee_type: 'user',
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
