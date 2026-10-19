<template>
  <div class="h-full flex flex-col overflow-hidden bg-[#f8fafc]">
    <AppHeader>
      <template #actions>
        <button
          @click="isModalOpen = true"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Projeto</span>
        </button>
      </template>
    </AppHeader>

    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Seus Projetos</h2>
          <p class="text-xs text-slate-500 font-medium">
            Cada projeto possui uma sigla única para tarefas (ex: <span class="font-mono font-bold text-indigo-600">CST-001</span>) e informações de contexto para agentes de IA (caminho local, branch base e testes).
          </p>
        </div>

        <!-- Projects Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="project in projectsStore.projects"
            :key="project.id"
            class="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-150 shadow-xs hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <!-- Top Row -->
              <div class="flex items-center justify-between mb-3.5">
                <div class="flex items-center gap-2.5">
                  <span
                    class="w-3.5 h-3.5 rounded-full shadow-2xs shrink-0"
                    :style="{ backgroundColor: project.color || '#4f46e5' }"
                  ></span>
                  <span class="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
                    {{ project.prefix }}
                  </span>
                </div>
                <span class="text-xs font-mono font-bold text-slate-400">
                  {{ project.tasks_count ?? 0 }} tarefas
                </span>
              </div>

              <!-- Title & Description -->
              <h3 class="text-base font-extrabold text-slate-900 mb-1.5">
                {{ project.name }}
              </h3>

              <p v-if="project.description" class="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-normal">
                {{ project.description }}
              </p>

              <!-- Project Metadata Details -->
              <div class="space-y-2 mb-5 text-xs text-slate-600 font-mono">
                <div v-if="project.github_repo" class="flex items-center gap-2 truncate p-2 rounded-xl bg-slate-50 border border-slate-200/60">
                  <Github class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span class="truncate text-[11px]">{{ project.github_repo }}</span>
                </div>

                <div v-if="project.local_path" class="flex items-center gap-2 truncate p-2 rounded-xl bg-slate-50 border border-slate-200/60" title="Diretório de trabalho para IAs e Runners">
                  <FolderCode class="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span class="truncate text-[11px] text-slate-700">{{ project.local_path }}</span>
                </div>

                <div class="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <span class="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-600">Base: {{ project.base_branch || 'develop' }}</span>
                  <span v-if="project.test_command" class="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-600 truncate" :title="project.test_command">
                    {{ project.test_command }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Card Bottom Bar -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="font-mono text-slate-400 font-medium">Próx: {{ project.prefix }}-{{ String((project.last_task_number || 0) + 1).padStart(3, '0') }}</span>
              <button
                @click="openBoard(project.id)"
                class="font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                Abrir Board →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Cadastrar Projeto -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-xl p-7 text-slate-900 my-8">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900">Cadastrar Novo Projeto</h2>
            <p class="text-xs text-slate-400 font-medium">Configure as informações gerais e diretrizes para automação de IA.</p>
          </div>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleCreateProject" class="space-y-4">
          <!-- Main Info -->
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Nome do Projeto</label>
              <input
                v-model="form.name"
                type="text"
                required
                placeholder="Ex: CapyShowTime"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 shadow-2xs"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">
                Sigla (Prefix)
              </label>
              <input
                v-model="form.prefix"
                type="text"
                required
                maxlength="6"
                placeholder="Ex: CST"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-mono uppercase font-bold text-indigo-600 focus:bg-white focus:outline-none focus:border-indigo-600 shadow-2xs"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Repositório GitHub</label>
              <input
                v-model="form.github_repo"
                type="text"
                placeholder="Ex: luviz/capyshowtime-pwa"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 shadow-2xs"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Cor de Destaque</label>
              <div class="flex items-center gap-2 pt-1.5">
                <button
                  v-for="c in ['#4f46e5', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#3b82f6']"
                  :key="c"
                  type="button"
                  @click="form.color = c"
                  class="w-7 h-7 rounded-full border-2 transition-transform shadow-2xs cursor-pointer"
                  :style="{ backgroundColor: c }"
                  :class="form.color === c ? 'scale-110 border-slate-900' : 'border-white'"
                ></button>
              </div>
            </div>
          </div>

          <!-- Section: AI Development Context -->
          <div class="pt-3 border-t border-slate-100">
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
              <Bot class="w-4 h-4 text-purple-600 stroke-[2.2]" />
              Contexto para Agentes de IA & Runners
            </h4>
            <p class="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Campos essenciais para que a IA e os runners saibam onde abrir o código, de qual branch partir e como testar.
            </p>

            <div class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Caminho Local do Repositório (Local Path)
                </label>
                <input
                  v-model="form.local_path"
                  type="text"
                  placeholder="Ex: c:\Users\Luviz\OneDrive\Documentos\9 - Projects\capihouse\capyshowtime-pwa"
                  class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Branch Base</label>
                  <input
                    v-model="form.base_branch"
                    type="text"
                    placeholder="develop"
                    class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Comando de Testes</label>
                  <input
                    v-model="form.test_command"
                    type="text"
                    placeholder="npm run test"
                    class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Arquivo de Regras</label>
                  <input
                    v-model="form.instructions_file"
                    type="text"
                    placeholder="AGENTS.md"
                    class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Descrição do Projeto</label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Resumo do propósito da aplicação..."
              class="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
            ></textarea>
          </div>

          <!-- Preview -->
          <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-mono">
            Exemplo de ID Gerado: <span class="text-indigo-600 font-bold">{{ (form.prefix || 'PRJ').toUpperCase() }}-001</span>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              @click="isModalOpen = false"
              class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Criar Projeto
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
import AppHeader from '@/components/layout/AppHeader.vue'
import { Plus, Github, FolderCode, Bot, X } from 'lucide-vue-next'

const projectsStore = useProjectsStore()
const router = useRouter()

const isModalOpen = ref(false)
const form = ref({
  name: '',
  prefix: '',
  github_repo: '',
  local_path: '',
  base_branch: 'develop',
  test_command: 'npm run test',
  instructions_file: 'AGENTS.md',
  description: '',
  color: '#4f46e5',
})

function openBoard(projectId: number) {
  projectsStore.selectedProjectId = projectId
  router.push('/board')
}

async function handleCreateProject() {
  await projectsStore.addProject({
    name: form.value.name,
    prefix: form.value.prefix.toUpperCase(),
    github_repo: form.value.github_repo,
    local_path: form.value.local_path,
    base_branch: form.value.base_branch,
    test_command: form.value.test_command,
    instructions_file: form.value.instructions_file,
    description: form.value.description,
    color: form.value.color,
  })
  isModalOpen.value = false
  form.value = {
    name: '',
    prefix: '',
    github_repo: '',
    local_path: '',
    base_branch: 'develop',
    test_command: 'npm run test',
    instructions_file: 'AGENTS.md',
    description: '',
    color: '#4f46e5',
  }
}
</script>
