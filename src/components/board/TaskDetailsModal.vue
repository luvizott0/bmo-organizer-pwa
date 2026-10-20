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

          <!-- Terminal Window Shell -->
          <div class="rounded-xs border-2 border-[#27272a] overflow-hidden shadow-inner" style="background-color: #0c0d10 !important;">
            <!-- Terminal Header Bar -->
            <div class="px-3 py-1.5 bg-[#181920] border-b border-[#27272a] flex items-center justify-between text-[10px] font-mono select-none">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span>
                <span class="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></span>
                <span class="ml-1.5 text-zinc-300 font-bold">bmo-ai-agent@sandbox:~</span>
              </div>
              <span class="text-zinc-500 font-mono text-[9px]">{{ task.task_code }}</span>
            </div>

            <!-- Terminal Output Area -->
            <div
              ref="terminalScrollRef"
              class="p-3 text-zinc-100 font-mono text-[11px] max-h-56 overflow-y-auto space-y-1.5 leading-relaxed select-text"
              style="background-color: #0c0d10 !important;"
            >
              <div v-if="aiSummary" class="text-emerald-400 font-bold border-b border-zinc-800 pb-1.5 mb-1.5">
                » {{ aiSummary }}
              </div>
              <div class="space-y-1">
                <template v-if="aiLogs.length > 0">
                  <div v-for="(log, i) in aiLogs" :key="i" class="leading-relaxed">
                    <span class="text-cyan-400 font-bold select-none">➜ </span>
                    <span class="text-zinc-100">{{ log }}</span>
                  </div>
                </template>
                <div v-else class="text-zinc-500 italic">
                  Nenhum log registrado ainda. A execução começará assim que a tarefa entrar em progresso.
                </div>
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

        <!-- Comments & Review Feedback Section -->
        <div class="space-y-3 pt-3 border-t-2 border-[#D8CDC5]">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-[#422d16] uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare class="w-4 h-4 text-[#a66130]" />
              Comentários & Feedback de Teste
              <span class="text-[10px] px-1.5 py-0.2 rounded-2xs bg-[#f8f6f1] border border-[#D8CDC5] text-[#847062] font-mono">
                {{ taskComments.length }}
              </span>
            </span>
          </div>

          <!-- Explanation Banner on AI iteration -->
          <div class="p-2.5 rounded-xs bg-[#fefce8] border border-[#fef08a] text-[11px] font-sans text-[#854d0e] flex items-start gap-2">
            <Info class="w-4 h-4 text-[#ca8a04] shrink-0 mt-0.5" />
            <div class="leading-relaxed">
              <strong>Como corrigir problemas com IA:</strong> Encontrou algum bug ou erro no teste? Adicione um comentário detalhando o problema e clique no botão <span class="font-mono font-bold text-[#b45309]">[RETORNAR P/ EM PROGRESSO]</span>. O Agente de IA analisará as alterações já feitas na branch e os comentários para corrigir.
            </div>
          </div>

          <!-- Comments Feed -->
          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div v-if="loadingComments" class="text-xs font-mono text-[#847062] py-3 text-center animate-pulse">
              Carregando comentários...
            </div>
            <div v-else-if="taskComments.length === 0" class="p-4 text-center rounded-xs bg-[#f8f6f1] border border-[#D8CDC5] text-xs font-mono text-[#847062] italic">
              Nenhum comentário adicionado ainda.
            </div>
            <div
              v-else
              v-for="comment in taskComments"
              :key="comment.id"
              class="p-3 rounded-xs border text-xs space-y-1.5 shadow-2xs"
              :class="comment.author_type === 'ai' ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-white border-[#D8CDC5]'"
            >
              <div class="flex items-center justify-between text-[11px] font-mono">
                <div class="flex items-center gap-1.5 font-bold" :class="comment.author_type === 'ai' ? 'text-[#15803d]' : 'text-[#422d16]'">
                  <Bot v-if="comment.author_type === 'ai'" class="w-3.5 h-3.5 text-[#16a34a]" />
                  <User v-else class="w-3.5 h-3.5 text-[#a66130]" />
                  <span>{{ comment.author_name }}</span>
                  <span v-if="comment.author_type === 'ai'" class="text-[9px] px-1 py-0.2 bg-[#16a34a]/15 rounded-2xs text-[#16a34a]">IA</span>
                </div>
                <div class="flex items-center gap-2 text-[#847062] text-[10px]">
                  <span>{{ formatCommentDate(comment.created_at) }}</span>
                  <button
                    @click="deleteComment(comment.id)"
                    class="hover:text-red-600 transition-colors cursor-pointer"
                    title="Excluir comentário"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </div>
              <p class="text-xs text-[#333333] font-sans whitespace-pre-wrap leading-relaxed">
                {{ comment.content }}
              </p>
            </div>
          </div>

          <!-- Add Comment Box -->
          <div class="space-y-2 pt-1">
            <textarea
              v-model="newCommentText"
              rows="2"
              placeholder="Descreva o problema encontrado nos testes ou o que precisa ser ajustado..."
              class="retro-input w-full text-xs font-sans p-2 bg-[#fdf8f3] border border-[#D8CDC5] rounded-xs focus:outline-none focus:border-[#a66130]"
              :disabled="submittingComment"
              @keydown.ctrl.enter="submitComment"
            ></textarea>
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono text-[#847062]">Pressione Ctrl+Enter para enviar</span>
              <button
                type="button"
                @click="submitComment"
                :disabled="!newCommentText.trim() || submittingComment"
                class="retro-button text-xs py-1 px-3 disabled:opacity-50"
              >
                <Send class="w-3 h-3 mr-1" />
                <span>{{ submittingComment ? 'ENVIANDO...' : 'ENVIAR COMENTÁRIO' }}</span>
              </button>
            </div>
          </div>
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
          <!-- Return to In Progress (available if in review, reviewed or done) -->
          <button
            v-if="['review', 'reviewed', 'done'].includes(task.status)"
            @click="handleStatusChange('in_progress')"
            class="retro-button-secondary py-1.5 px-3 border border-[#D8CDC5] text-[#b45309] hover:bg-[#fef3c7] flex items-center gap-1.5 cursor-pointer font-bold"
            title="Retornar para Em Progresso para que a IA execute as correções da tarefa"
          >
            <RotateCcw class="w-3.5 h-3.5 text-[#b45309]" />
            <span>RETORNAR P/ EM PROGRESSO</span>
          </button>

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
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import type { Task, TaskStatus, TaskType, TaskPriority, TargetScope, AssigneeType, TaskComment } from '@/types'
import { useProjectsStore } from '@/stores/projects'
import { useModalStore } from '@/stores/modal'
import { taskCommentsApi, tasksApi } from '@/api/client'
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
  MessageSquare,
  Send,
  User,
  RotateCcw,
  Info,
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
const modalStore = useModalStore()

const copied = ref(false)
const isEditing = ref(false)
const saving = ref(false)

const terminalScrollRef = ref<HTMLElement | null>(null)
const taskComments = ref<TaskComment[]>([])
const newCommentText = ref('')
const loadingComments = ref(false)
const submittingComment = ref(false)

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

    if (newTask) {
      if (newTask.comments && Array.isArray(newTask.comments)) {
        taskComments.value = [...newTask.comments]
      } else {
        loadComments(newTask.id)
      }
      nextTick(() => {
        if (terminalScrollRef.value) {
          terminalScrollRef.value.scrollTop = terminalScrollRef.value.scrollHeight
        }
      })
    } else {
      taskComments.value = []
    }

    if (props.isOpen && newTask && newTask.status === 'in_progress') {
      startPolling(newTask.id)
    } else {
      stopPolling()
    }
  },
  { immediate: true }
)

let pollTimer: ReturnType<typeof setInterval> | null = null

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function startPolling(taskId: number) {
  stopPolling()
  pollTimer = setInterval(async () => {
    try {
      const updated = await tasksApi.get(taskId)
      if (props.task && props.task.id === taskId) {
        Object.assign(props.task, updated)
        if (updated.comments && Array.isArray(updated.comments)) {
          taskComments.value = [...updated.comments]
        }
        if (updated.status !== 'in_progress') {
          stopPolling()
        }
        nextTick(() => {
          if (terminalScrollRef.value) {
            terminalScrollRef.value.scrollTop = terminalScrollRef.value.scrollHeight
          }
        })
      }
    } catch {
      // ignore
    }
  }, 2500)
}

onUnmounted(() => {
  stopPolling()
})

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
    await modalStore.warning('Título Obrigatório', 'Por favor, informe o título da tarefa antes de salvar.')
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
    await modalStore.error('Erro ao Salvar Tarefa', err?.response?.data?.message || err?.message || 'Falha na requisição.')
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

watch(aiLogs, () => {
  nextTick(() => {
    if (terminalScrollRef.value) {
      terminalScrollRef.value.scrollTop = terminalScrollRef.value.scrollHeight
    }
  })
})

async function loadComments(taskId: number) {
  try {
    loadingComments.value = true
    const comments = await taskCommentsApi.list(taskId)
    taskComments.value = comments
  } catch (err) {
    console.error('Erro ao carregar comentários:', err)
  } finally {
    loadingComments.value = false
  }
}

async function submitComment() {
  if (!props.task || !newCommentText.value.trim() || submittingComment.value) return

  try {
    submittingComment.value = true
    const comment = await taskCommentsApi.create(props.task.id, newCommentText.value.trim())
    taskComments.value.push(comment)
    newCommentText.value = ''
  } catch (err: any) {
    await modalStore.error('Erro ao Adicionar Comentário', err?.response?.data?.message || err?.message || 'Falha na requisição.')
  } finally {
    submittingComment.value = false
  }
}

async function deleteComment(commentId: number) {
  if (!props.task) return
  const confirmed = await modalStore.confirm({
    title: 'Excluir Comentário',
    message: 'Deseja realmente remover este comentário da tarefa?',
    type: 'danger',
    confirmText: 'EXCLUIR',
    cancelText: 'CANCELAR',
  })
  if (!confirmed) return

  try {
    await taskCommentsApi.delete(props.task.id, commentId)
    taskComments.value = taskComments.value.filter((c) => c.id !== commentId)
  } catch (err: any) {
    await modalStore.error('Erro ao Excluir Comentário', err?.response?.data?.message || err?.message || 'Falha na requisição.')
  }
}

function formatCommentDate(dateStr?: string) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}
</script>
