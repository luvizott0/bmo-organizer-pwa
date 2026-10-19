<template>
  <div class="h-full flex flex-col overflow-hidden bg-[#f8f6f1]">
    <AppHeader>
      <template #actions>
        <button
          @click="isModalOpen = true"
          class="retro-button"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>CADASTRAR PROJETO</span>
        </button>
      </template>
    </AppHeader>

    <div class="flex-1 overflow-y-auto p-6">
      <div class="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 class="section-marker text-lg mb-1">PROJETOS & REPOSITÓRIOS</h2>
          <p class="text-xs text-[#847062] font-sans">
            Cada projeto possui uma sigla única (ex: <span class="font-mono font-bold text-[#a66130]">CST-001</span>) e configurações para o Agente de IA do Homelab BMO.
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
                <div class="flex items-center gap-2">
                  <span>[{{ project.prefix }}]</span>
                  <span class="truncate">{{ project.name }}</span>
                </div>
                <span class="text-[10px] opacity-90">
                  {{ project.tasks_count ?? 0 }} TAREFAS
                </span>
              </div>

              <!-- Body -->
              <div class="p-4 space-y-3 font-sans">
                <p v-if="project.description" class="text-xs text-[#847062] line-clamp-2 leading-relaxed">
                  {{ project.description }}
                </p>

                <!-- Details -->
                <div class="space-y-1.5 text-xs font-mono text-[#5f4120]">
                  <div v-if="project.github_repo" class="flex items-center gap-1.5 truncate p-1.5 rounded-xs bg-[#f8f6f1] border border-[#D8CDC5]">
                    <Github class="w-3.5 h-3.5 text-[#a66130] shrink-0" />
                    <span class="truncate text-[11px]">{{ project.github_repo }}</span>
                  </div>

                  <div class="flex items-center gap-1.5 text-[10px] text-[#847062] pt-1">
                    <span class="px-1.5 py-0.5 rounded-xs bg-[#fdf8f3] border border-[#D8CDC5]">Base: {{ project.base_branch || 'develop' }}</span>
                    <span v-if="project.test_command" class="px-1.5 py-0.5 rounded-xs bg-[#fdf8f3] border border-[#D8CDC5] truncate">
                      {{ project.test_command }}
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

    <!-- Modal: Cadastrar Projeto -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div class="w-full max-w-lg retro-card shadow-lg p-0 text-[#333333] bg-white my-6">
        <div class="retro-card-header flex items-center justify-between">
          <span>CADASTRAR NOVO PROJETO</span>
          <button @click="isModalOpen = false" class="text-white/80 hover:text-white cursor-pointer font-mono font-bold">
            [X]
          </button>
        </div>

        <form @submit.prevent="handleCreateProject" class="p-5 space-y-4 font-sans">
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
                placeholder="Ex: CST"
                class="retro-input font-mono uppercase font-bold text-[#a66130]"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">» REPOSITÓRIO GITHUB</label>
              <input
                v-model="form.github_repo"
                type="text"
                placeholder="Ex: luvizott0/capyshowtime-pwa"
                class="retro-input font-mono"
              />
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
          </div>

          <!-- Section: AI Context -->
          <div class="p-3 bg-[#fdf8f3] border border-[#D8CDC5] rounded-xs space-y-2.5">
            <h4 class="text-xs font-bold font-mono text-[#5f4120] flex items-center gap-1.5">
              <Bot class="w-3.5 h-3.5 text-[#a66130]" />
              CONTEXTO PARA AGENTE DE IA (BMO HOMELAB)
            </h4>

            <div class="grid grid-cols-2 gap-2 font-mono">
              <div>
                <label class="block text-[10px] font-bold text-[#847062] mb-0.5">BRANCH BASE</label>
                <input
                  v-model="form.base_branch"
                  type="text"
                  placeholder="develop"
                  class="retro-input text-xs"
                />
              </div>

              <div>
                <label class="block text-[10px] font-bold text-[#847062] mb-0.5">COMANDO DE TESTES</label>
                <input
                  v-model="form.test_command"
                  type="text"
                  placeholder="npm run test"
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
              {{ isSubmitting ? 'CRIANDO...' : 'CRIAR PROJETO' }}
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
import { Plus, Github, Bot, AlertCircle } from 'lucide-vue-next'

const projectsStore = useProjectsStore()
const router = useRouter()

const isModalOpen = ref(false)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const form = ref({
  name: '',
  prefix: '',
  github_repo: '',
  base_branch: 'develop',
  test_command: 'npm run test',
  description: '',
  color: '#a66130',
})

function openBoard(projectId: number) {
  projectsStore.selectedProjectId = projectId
  router.push('/board')
}

async function handleCreateProject() {
  submitError.value = null
  isSubmitting.value = true
  try {
    await projectsStore.addProject({
      name: form.value.name,
      prefix: form.value.prefix.toUpperCase(),
      github_repo: form.value.github_repo,
      base_branch: form.value.base_branch,
      test_command: form.value.test_command,
      description: form.value.description,
      color: form.value.color,
    })
    isModalOpen.value = false
    form.value = {
      name: '',
      prefix: '',
      github_repo: '',
      base_branch: 'develop',
      test_command: 'npm run test',
      description: '',
      color: '#a66130',
    }
  } catch (err: any) {
    console.error('Error creating project:', err)
    submitError.value =
      err.response?.data?.message ||
      err.response?.data?.errors?.prefix?.[0] ||
      err.response?.data?.errors?.name?.[0] ||
      'Erro ao criar projeto. Verifique os dados ou se você está autenticado.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

