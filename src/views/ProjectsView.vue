<template>
  <div class="h-full flex flex-col overflow-hidden bg-[#f8f6f1]">
    <AppHeader>
      <template #actions>
        <button
          @click="openCreateModal"
          class="retro-button"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>CADASTRAR PROJETO</span>
        </button>
      </template>
    </AppHeader>

    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-6xl mx-auto space-y-5">
        <!-- Sub-navigation Tabs -->
        <div class="flex items-center gap-2 border-b border-[#D8CDC5] pb-3">
          <RouterLink
            to="/projects"
            class="px-3 py-1.5 rounded-xs font-mono text-xs font-bold uppercase transition-all border flex items-center gap-1.5"
            :class="$route.path === '/projects'
              ? 'bg-[#a66130] text-white border-[#a66130] shadow-2xs'
              : 'bg-white text-[#7d5628] border-[#D8CDC5] hover:bg-[#e8c9a5]'"
          >
            <FolderGit2 class="w-3.5 h-3.5" />
            <span>Projetos & Repositórios</span>
          </RouterLink>

          <RouterLink
            to="/docker"
            class="px-3 py-1.5 rounded-xs font-mono text-xs font-bold uppercase transition-all border flex items-center gap-1.5"
            :class="$route.path === '/docker'
              ? 'bg-[#a66130] text-white border-[#a66130] shadow-2xs'
              : 'bg-white text-[#7d5628] border-[#D8CDC5] hover:bg-[#e8c9a5]'"
          >
            <Boxes class="w-3.5 h-3.5 text-[#16a34a]" />
            <span>Containers Docker (Máquina)</span>
          </RouterLink>
        </div>

        <div>
          <h2 class="section-marker text-lg mb-1">PROJETOS & REPOSITÓRIOS</h2>
          <p class="text-xs text-[#847062] font-sans">
            Cada projeto possui uma sigla única (ex: <span class="font-mono font-bold text-[#a66130]">CST-001</span>) e pode vincular repositórios Frontend, Backend ou ambos para o Agente de IA do BMO.
          </p>
        </div>

        <!-- Projects Grid in Retro Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            v-for="project in projectsStore.projects"
            :key="project.id"
            class="retro-card flex flex-col justify-between"
          >
            <div>
              <!-- Retro Card Header -->
              <div class="retro-card-header flex items-center justify-between" :style="{ backgroundColor: project.color || '#a66130' }">
                <div class="flex items-center gap-2 truncate">
                  <span>[{{ project.prefix }}]</span>
                  <span class="truncate">{{ project.name }}</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <span class="text-[10px] opacity-90 mr-1">
                    {{ project.tasks_count ?? 0 }} TAREFAS
                  </span>
                  <button
                    @click.stop="openEditModal(project)"
                    title="Editar Projeto"
                    class="p-1 hover:bg-white/20 rounded-xs transition-colors cursor-pointer text-white"
                  >
                    <Pencil class="w-3 h-3" />
                  </button>
                  <button
                    @click.stop="confirmDelete(project)"
                    title="Excluir Projeto"
                    class="p-1 hover:bg-red-500/30 rounded-xs transition-colors cursor-pointer text-white"
                  >
                    <Trash2 class="w-3 h-3" />
                  </button>
                </div>
              </div>

              <!-- Body -->
              <div class="p-4 space-y-3 font-sans">
                <p v-if="project.description" class="text-xs text-[#847062] line-clamp-2 leading-relaxed">
                  {{ project.description }}
                </p>

                <!-- Repositories Badge List -->
                <div class="space-y-1.5 text-xs font-mono text-[#5f4120]">
                  <!-- Backend Repo -->
                  <div v-if="project.backend_repo" class="flex items-center gap-1.5 truncate p-1.5 rounded-xs bg-[#f8f6f1] border border-[#D8CDC5]">
                    <Server class="w-3.5 h-3.5 text-[#2563eb] shrink-0" />
                    <span class="text-[10px] font-bold px-1 py-0.2 bg-[#2563eb]/10 text-[#2563eb] rounded-2xs">API</span>
                    <span class="truncate text-[11px]">{{ project.backend_repo }}</span>
                  </div>

                  <!-- Frontend Repo -->
                  <div v-if="project.frontend_repo" class="flex items-center gap-1.5 truncate p-1.5 rounded-xs bg-[#f8f6f1] border border-[#D8CDC5]">
                    <Layout class="w-3.5 h-3.5 text-[#16a34a] shrink-0" />
                    <span class="text-[10px] font-bold px-1 py-0.2 bg-[#16a34a]/10 text-[#16a34a] rounded-2xs">PWA</span>
                    <span class="truncate text-[11px]">{{ project.frontend_repo }}</span>
                  </div>

                  <!-- Fallback Legacy GitHub Repo -->
                  <div v-if="!project.backend_repo && !project.frontend_repo && project.github_repo" class="flex items-center gap-1.5 truncate p-1.5 rounded-xs bg-[#f8f6f1] border border-[#D8CDC5]">
                    <Github class="w-3.5 h-3.5 text-[#a66130] shrink-0" />
                    <span class="truncate text-[11px]">{{ project.github_repo }}</span>
                  </div>

                  <div class="flex flex-wrap items-center gap-1.5 text-[10px] text-[#847062] pt-1">
                    <span class="px-1.5 py-0.5 rounded-xs bg-[#fdf8f3] border border-[#D8CDC5]">Base: {{ project.base_branch || 'develop' }}</span>
                    <span v-if="project.frontend_test_cmd || project.test_command" class="px-1.5 py-0.5 rounded-xs bg-[#fdf8f3] border border-[#D8CDC5] truncate">
                      {{ project.frontend_test_cmd || project.test_command }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-3 border-t border-[#D8CDC5] bg-[#fdf8f3] flex items-center justify-between text-xs font-mono">
              <span class="text-[#847062]">Próx: {{ project.prefix }}-{{ String((project.last_task_number || 0) + 1).padStart(3, '0') }}</span>
              <button
                @click="openBoard(project.id)"
                class="retro-button retro-button-sm cursor-pointer"
              >
                ABRIR BOARD
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Cadastrar / Editar Projeto -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="w-full max-w-xl retro-card shadow-lg p-0 text-[#333333] bg-white my-6">
        <div class="retro-card-header flex items-center justify-between" :style="{ backgroundColor: form.color || '#a66130' }">
          <span>{{ editingProjectId ? 'EDITAR PROJETO' : 'CADASTRAR NOVO PROJETO' }}</span>
          <button @click="isModalOpen = false" class="text-white/80 hover:text-white cursor-pointer font-mono font-bold">
            [X]
          </button>
        </div>

        <form @submit.prevent="handleSaveProject" class="p-5 space-y-4 font-sans max-h-[85vh] overflow-y-auto">
          <!-- Error alert -->
          <div
            v-if="submitError"
            class="p-2.5 bg-[#fdf0ea] border-2 border-[#d9534f] text-[#c9302c] rounded-xs flex items-center gap-2 text-xs font-mono"
          >
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ submitError }}</span>
          </div>

          <!-- Main Info -->
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">» NOME DO PROJETO</label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Ex: CapyShowTime"
                class="retro-input"
              />
            </div>

            <div>
              <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">
                » SIGLA (PREFIX)
              </label>
              <input
                v-model="form.prefix"
                type="text"
                required
                maxlength="6"
                :disabled="Boolean(editingProjectId)"
                placeholder="Ex: CST"
                class="retro-input font-mono uppercase font-bold text-[#a66130] disabled:opacity-60 disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">» COR DO TEMA</label>
            <div class="flex items-center gap-1.5 pt-1">
              <button
                v-for="c in ['#a66130', '#7d5628', '#b07a3b', '#16a34a', '#dc2626', '#2563eb', '#847062']"
                :key="c"
                type="button"
                @click="form.color = c"
                class="w-6 h-6 rounded-xs border-2 transition-transform cursor-pointer"
                :style="{ backgroundColor: c }"
                :class="form.color === c ? 'scale-110 border-[#333333]' : 'border-white'"
              ></button>
            </div>
          </div>

          <!-- Section: Backend (API) Repository -->
          <div class="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-xs space-y-2.5">
            <h4 class="text-xs font-bold font-mono text-[#1e40af] flex items-center gap-1.5">
              <Server class="w-3.5 h-3.5 text-[#2563eb]" />
              REPOSITÓRIO BACKEND (API)
            </h4>

            <div class="space-y-2 font-mono">
              <div>
                <label class="block text-[10px] font-bold text-[#1e40af] mb-0.5">REPOSITÓRIO NO GITHUB</label>
                <input
                  v-model="form.backend_repo"
                  type="text"
                  placeholder="Ex: luvizott0/capihouse-api"
                  class="retro-input text-xs"
                />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-bold text-[#1e40af] mb-0.5">COMANDO DE TESTE API</label>
                  <input
                    v-model="form.backend_test_cmd"
                    type="text"
                    placeholder="php artisan test"
                    class="retro-input text-xs"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-[#1e40af] mb-0.5">ARQUIVO DE REGRAS</label>
                  <input
                    v-model="form.backend_instructions_file"
                    type="text"
                    placeholder="AGENTS.md"
                    class="retro-input text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Frontend (PWA / Web) Repository -->
          <div class="p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xs space-y-2.5">
            <h4 class="text-xs font-bold font-mono text-[#166534] flex items-center gap-1.5">
              <Layout class="w-3.5 h-3.5 text-[#16a34a]" />
              REPOSITÓRIO FRONTEND (PWA / WEB)
            </h4>

            <div class="space-y-2 font-mono">
              <div>
                <label class="block text-[10px] font-bold text-[#166534] mb-0.5">REPOSITÓRIO NO GITHUB</label>
                <input
                  v-model="form.frontend_repo"
                  type="text"
                  placeholder="Ex: luvizott0/capyshowtime-pwa"
                  class="retro-input text-xs"
                />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-bold text-[#166534] mb-0.5">COMANDO DE TESTE/BUILD</label>
                  <input
                    v-model="form.frontend_test_cmd"
                    type="text"
                    placeholder="npm run build"
                    class="retro-input text-xs"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-[#166534] mb-0.5">ARQUIVO DE REGRAS</label>
                  <input
                    v-model="form.frontend_instructions_file"
                    type="text"
                    placeholder="AGENTS.md"
                    class="retro-input text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Section: Base Branch & General Settings -->
          <div class="p-3 bg-[#fdf8f3] border border-[#D8CDC5] rounded-xs space-y-2.5 font-mono">
            <h4 class="text-xs font-bold text-[#5f4120] flex items-center gap-1.5">
              <Bot class="w-3.5 h-3.5 text-[#a66130]" />
              DIRETRIZES GERAIS DO PROJETO
            </h4>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[10px] font-bold text-[#847062] mb-0.5">BRANCH BASE INTEGRAÇÃO</label>
                <input
                  v-model="form.base_branch"
                  type="text"
                  placeholder="develop"
                  class="retro-input text-xs"
                />
              </div>
              <div>
                <label class="block text-[10px] font-bold text-[#847062] mb-0.5">REPO ÚNICO / LEGADO (OPCIONAL)</label>
                <input
                  v-model="form.github_repo"
                  type="text"
                  placeholder="Caso seja repo único"
                  class="retro-input text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">» DESCRIÇÃO</label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Resumo do projeto..."
              class="retro-input"
            ></textarea>
          </div>

          <div class="p-2.5 bg-[#f8f6f1] border border-[#D8CDC5] text-[11px] text-[#5f4120] font-mono">
            Exemplo de ID: <span class="text-[#a66130] font-bold">{{ (form.prefix || 'PRJ').toUpperCase() }}-001</span>
          </div>

          <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-[#D8CDC5]">
            <button
              type="button"
              @click="isModalOpen = false"
              class="retro-button-secondary font-mono text-xs px-3 py-1.5 rounded-xs"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="retro-button disabled:opacity-60"
            >
              {{ isSubmitting ? 'SALVANDO...' : (editingProjectId ? 'SALVAR ALTERAÇÕES' : 'CRIAR PROJETO') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProjectsStore } from '@/stores/projects'
import { useModalStore } from '@/stores/modal'
import type { Project } from '@/types'
import AppHeader from '@/components/layout/AppHeader.vue'
import { Plus, Github, Server, Layout, Bot, AlertCircle, Pencil, Trash2, Boxes, FolderGit2 } from 'lucide-vue-next'

const projectsStore = useProjectsStore()
const modalStore = useModalStore()
const router = useRouter()

const isModalOpen = ref(false)
const editingProjectId = ref<number | null>(null)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const form = ref({
  name: '',
  prefix: '',
  github_repo: '',
  backend_repo: '',
  backend_test_cmd: 'php artisan test',
  backend_instructions_file: 'AGENTS.md',
  frontend_repo: '',
  frontend_test_cmd: 'npm run build',
  frontend_instructions_file: 'AGENTS.md',
  base_branch: 'develop',
  test_command: 'npm run build',
  description: '',
  color: '#a66130',
})

function openBoard(projectId: number) {
  projectsStore.selectedProjectId = projectId
  router.push('/board')
}

function openCreateModal() {
  editingProjectId.value = null
  submitError.value = null
  form.value = {
    name: '',
    prefix: '',
    github_repo: '',
    backend_repo: '',
    backend_test_cmd: 'php artisan test',
    backend_instructions_file: 'AGENTS.md',
    frontend_repo: '',
    frontend_test_cmd: 'npm run build',
    frontend_instructions_file: 'AGENTS.md',
    base_branch: 'develop',
    test_command: 'npm run build',
    description: '',
    color: '#a66130',
  }
  isModalOpen.value = true
}

function openEditModal(project: Project) {
  editingProjectId.value = project.id
  submitError.value = null
  form.value = {
    name: project.name,
    prefix: project.prefix,
    github_repo: project.github_repo || '',
    backend_repo: project.backend_repo || '',
    backend_test_cmd: project.backend_test_cmd || 'php artisan test',
    backend_instructions_file: project.backend_instructions_file || 'AGENTS.md',
    frontend_repo: project.frontend_repo || '',
    frontend_test_cmd: project.frontend_test_cmd || 'npm run build',
    frontend_instructions_file: project.frontend_instructions_file || 'AGENTS.md',
    base_branch: project.base_branch || 'develop',
    test_command: project.test_command || 'npm run build',
    description: project.description || '',
    color: project.color || '#a66130',
  }
  isModalOpen.value = true
}

async function confirmDelete(project: Project) {
  const confirmed = await modalStore.confirm({
    title: 'Excluir Projeto',
    message: `Tem certeza que deseja excluir o projeto "${project.name}" ([${project.prefix}])?\n\nTodas as tarefas associadas a este projeto serão permanentemente excluídas.`,
    type: 'danger',
    confirmText: 'SIM, EXCLUIR PROJETO',
    cancelText: 'CANCELAR',
  })
  if (!confirmed) return

  try {
    await projectsStore.deleteProject(project.id)
    await modalStore.success('Projeto Excluído', `O projeto ${project.name} foi removido com sucesso.`)
  } catch (err: any) {
    console.error('Error deleting project:', err)
    await modalStore.error('Erro ao excluir projeto', err.response?.data?.message || err.message)
  }
}

async function handleSaveProject() {
  submitError.value = null
  isSubmitting.value = true
  try {
    const payload = {
      name: form.value.name,
      prefix: form.value.prefix.toUpperCase(),
      github_repo: form.value.github_repo || null,
      backend_repo: form.value.backend_repo || null,
      backend_test_cmd: form.value.backend_test_cmd || null,
      backend_instructions_file: form.value.backend_instructions_file || null,
      frontend_repo: form.value.frontend_repo || null,
      frontend_test_cmd: form.value.frontend_test_cmd || null,
      frontend_instructions_file: form.value.frontend_instructions_file || null,
      base_branch: form.value.base_branch || 'develop',
      test_command: form.value.frontend_test_cmd || form.value.test_command || null,
      description: form.value.description || null,
      color: form.value.color,
    }

    if (editingProjectId.value) {
      await projectsStore.updateProject(editingProjectId.value, payload)
    } else {
      await projectsStore.addProject(payload)
    }

    isModalOpen.value = false
  } catch (err: any) {
    console.error('Error saving project:', err)
    submitError.value =
      err.response?.data?.message ||
      err.response?.data?.errors?.prefix?.[0] ||
      err.response?.data?.errors?.name?.[0] ||
      'Erro ao salvar projeto. Verifique os dados ou sua conexão.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
