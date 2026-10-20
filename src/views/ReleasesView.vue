<template>
  <div class="space-y-6">
    <!-- View Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#D8CDC5]">
      <div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-xs bg-[#a66130]"></span>
          <h1 class="text-xl font-bold font-mono tracking-tight text-[#422d16]">
            CENTRAL DE RELEASES & DEPLOYS
          </h1>
        </div>
        <p class="text-xs text-[#847062] font-mono mt-0.5">
          Agrupamento de tarefas validadas, deploy no Sandbox Homelab e promoção para Produção Oficial.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <!-- Project Filter -->
        <select
          v-model="selectedProjectId"
          @change="loadReleases"
          class="retro-input text-xs py-1.5 px-3 font-mono cursor-pointer"
        >
          <option :value="null">[TODOS OS PROJETOS]</option>
          <option
            v-for="p in projectsStore.projects"
            :key="p.id"
            :value="p.id"
          >
            {{ p.prefix }} - {{ p.name }}
          </option>
        </select>

        <!-- New Release Button -->
        <button
          @click="openCreateModal"
          class="retro-button text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus class="w-4 h-4" />
          <span>NOVA RELEASE</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center">
      <Loader2 class="w-8 h-8 animate-spin mx-auto text-[#a66130]" />
      <p class="mt-3 text-xs font-mono text-[#847062]">[CARREGANDO RELEASES...]</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="releases.length === 0"
      class="retro-card p-12 text-center bg-white space-y-4 max-w-lg mx-auto my-8"
    >
      <div class="w-12 h-12 rounded-sm bg-[#fdf8f3] border-2 border-[#D8CDC5] flex items-center justify-center mx-auto text-[#a66130]">
        <Rocket class="w-6 h-6" />
      </div>
      <div>
        <h3 class="font-mono font-bold text-sm text-[#422d16]">NENHUMA RELEASE REGISTRADA</h3>
        <p class="text-xs text-[#847062] mt-1 font-sans">
          Crie uma nova release para agrupar tarefas aprovadas nos previews isolados e disparar o deploy no Sandbox Homelab.
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="retro-button text-xs py-2 px-4 mx-auto flex items-center gap-1.5 cursor-pointer"
      >
        <Plus class="w-4 h-4" />
        <span>CRIAR PRIMEIRA RELEASE</span>
      </button>
    </div>

    <!-- Releases List -->
    <div v-else class="space-y-6">
      <div
        v-for="rel in releases"
        :key="rel.id"
        class="retro-card bg-white p-0 overflow-hidden shadow-xs border-2 border-[#D8CDC5]"
      >
        <!-- Release Card Header -->
        <div class="p-4 bg-[#fdf8f3] border-b-2 border-[#D8CDC5] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div class="flex items-center gap-3 flex-wrap">
            <span class="font-mono font-bold text-sm px-2.5 py-1 rounded-xs bg-[#422d16] text-white shadow-2xs">
              {{ rel.version }}
            </span>

            <span
              v-if="rel.project"
              class="font-mono text-xs font-bold px-2 py-0.5 rounded-xs border text-[#422d16]"
              :style="{ backgroundColor: rel.project.color ? rel.project.color + '20' : '#f8f6f1', borderColor: rel.project.color || '#D8CDC5' }"
            >
              {{ rel.project.prefix }} - {{ rel.project.name }}
            </span>

            <h2 class="font-mono font-bold text-sm text-[#422d16]">
              {{ rel.title }}
            </h2>

            <span
              class="font-mono text-[11px] font-bold px-2 py-0.5 rounded-xs uppercase border"
              :class="releaseStatusBadge(rel.status)"
            >
              {{ releaseStatusLabel(rel.status) }}
            </span>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center gap-2 self-end md:self-auto">
            <!-- Sandbox Deploy Action -->
            <button
              v-if="rel.status === 'draft' || rel.status === 'sandbox'"
              @click="deploySandbox(rel)"
              :disabled="deployingId === rel.id"
              class="retro-button text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              :title="rel.status === 'draft' ? 'Mergeia tarefas na branch release do GitHub' : 'Atualiza branch release'"
            >
              <Loader2 v-if="deployingId === rel.id" class="w-3.5 h-3.5 animate-spin" />
              <Rocket v-else class="w-3.5 h-3.5" />
              <span>{{ rel.status === 'sandbox' ? 'RE-DEPLOY SANDBOX' : 'DEPLOY NO SANDBOX' }}</span>
            </button>

            <!-- Test on Sandbox Link -->
            <a
              v-if="rel.status === 'sandbox' || rel.status === 'production'"
              :href="getSandboxDomain(rel)"
              target="_blank"
              class="retro-button-secondary text-xs py-1.5 px-2.5 flex items-center gap-1 border border-[#D8CDC5] bg-white hover:bg-[#e8c9a5]"
            >
              <span>ABRIR SANDBOX</span>
              <ExternalLink class="w-3 h-3" />
            </a>

            <!-- Production Promotion Action -->
            <button
              v-if="rel.status === 'sandbox'"
              @click="deployProduction(rel)"
              :disabled="deployingId === rel.id"
              class="retro-button text-xs py-1.5 px-3 bg-[#16a34a] hover:bg-[#15803d] border-[#16a34a] text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="deployingId === rel.id" class="w-3.5 h-3.5 animate-spin" />
              <CheckCircle2 v-else class="w-3.5 h-3.5" />
              <span>PROMOVER PARA PRODUÇÃO</span>
            </button>

            <!-- Delete draft release -->
            <button
              v-if="rel.status === 'draft'"
              @click="deleteRelease(rel.id)"
              class="text-[#847062] hover:text-[#dc2626] p-1.5 rounded-xs transition-colors cursor-pointer"
              title="Excluir rascunho de release"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Release Details & Tasks -->
        <div class="p-5 space-y-4">
          <p v-if="rel.description" class="text-xs text-[#5f4120] font-sans leading-relaxed">
            {{ rel.description }}
          </p>

          <!-- Included Tasks Section -->
          <div>
            <div class="flex items-center justify-between pb-2 border-b border-[#D8CDC5] text-xs font-mono font-bold text-[#847062]">
              <span>TAREFAS VINCULADAS [{{ rel.tasks?.length ?? 0 }}]</span>
              <span>BRANCHES A MERGEAR</span>
            </div>

            <div v-if="rel.tasks && rel.tasks.length > 0" class="divide-y divide-[#D8CDC5]/60">
              <div
                v-for="t in rel.tasks"
                :key="t.id"
                class="py-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div class="flex items-center gap-2.5 truncate">
                  <span class="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded-xs bg-[#f8f6f1] text-[#a66130] border border-[#D8CDC5]">
                    {{ t.task_code }}
                  </span>
                  <span class="truncate font-medium text-[#422d16]">{{ t.title }}</span>
                  <span
                    class="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase border"
                    :class="t.status === 'done' ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' : 'bg-[#fefce8] text-[#ca8a04] border-[#fef08a]'"
                  >
                    {{ t.status }}
                  </span>
                </div>

                <div class="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                  <span class="text-[#847062] truncate max-w-[200px]">
                    {{ t.branch_name || 'feat/' + t.task_code }}
                  </span>
                  <a
                    v-if="t.preview_url || t.ai_logs?.preview_url"
                    :href="t.preview_url || t.ai_logs?.preview_url"
                    target="_blank"
                    class="text-[#16a34a] hover:underline font-bold flex items-center gap-0.5"
                  >
                    <span>preview</span>
                    <ExternalLink class="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
            <div v-else class="py-4 text-center text-xs font-mono text-[#847062] italic">
              [Nenhuma tarefa vinculada a esta release]
            </div>
          </div>

          <!-- Execution Logs Section (Collapsible) -->
          <div v-if="rel.logs && rel.logs.length > 0" class="pt-2">
            <details class="group rounded-xs overflow-hidden border border-[#D8CDC5]">
              <summary class="px-3 py-2 bg-[#f8f6f1] text-xs font-mono font-bold text-[#5f4120] flex items-center justify-between cursor-pointer hover:bg-[#e8c9a5]">
                <span class="flex items-center gap-1.5">
                  <Terminal class="w-3.5 h-3.5 text-[#a66130]" />
                  LOGS DE DEPLOY & MERGE [{{ rel.logs.length }} eventos]
                </span>
                <span class="text-[10px] text-[#847062] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div class="bg-[#1a1410] p-3 text-xs font-mono text-[#4ade80] max-h-40 overflow-y-auto space-y-1">
                <div v-for="(logLine, lIdx) in rel.logs" :key="lIdx" class="leading-relaxed">
                  {{ logLine }}
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Release Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto"
      @click.self="isModalOpen = false"
    >
      <div class="w-full max-w-xl retro-card shadow-xl p-0 text-[#333333] bg-white my-6 overflow-hidden">
        <div class="retro-card-header flex items-center justify-between">
          <span class="truncate font-mono font-bold text-xs uppercase tracking-wider">
            CRIAR NOVA RELEASE
          </span>
          <button
            @click="isModalOpen = false"
            class="text-white/80 hover:text-white cursor-pointer font-mono font-bold"
          >
            [X]
          </button>
        </div>

        <form @submit.prevent="submitRelease" class="p-6 space-y-4 text-xs font-sans">
          <!-- Project Selection -->
          <div class="space-y-1">
            <label class="block font-mono font-bold text-[#422d16] uppercase text-[11px]">
              Projeto
            </label>
            <select
              v-model="form.project_id"
              required
              @change="loadAvailableTasks"
              class="w-full retro-input font-mono text-xs py-2 px-3"
            >
              <option :value="undefined" disabled>Selecione um projeto...</option>
              <option
                v-for="p in projectsStore.projects"
                :key="p.id"
                :value="p.id"
              >
                {{ p.prefix }} - {{ p.name }}
              </option>
            </select>
          </div>

          <!-- Version & Title -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="block font-mono font-bold text-[#422d16] uppercase text-[11px]">
                Versão (Tag)
              </label>
              <input
                v-model="form.version"
                type="text"
                required
                placeholder="v1.0.1"
                class="w-full retro-input font-mono text-xs py-2 px-3"
              />
            </div>
            <div class="sm:col-span-2 space-y-1">
              <label class="block font-mono font-bold text-[#422d16] uppercase text-[11px]">
                Título da Release
              </label>
              <input
                v-model="form.title"
                type="text"
                required
                placeholder="Sprint Outubro: Ajuste de episódios"
                class="w-full retro-input font-mono text-xs py-2 px-3"
              />
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-1">
            <label class="block font-mono font-bold text-[#422d16] uppercase text-[11px]">
              Notas / Descrição
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="Descreva as principais alterações ou contexto desta release..."
              class="w-full retro-input font-sans text-xs p-3 leading-relaxed"
            ></textarea>
          </div>

          <!-- Task Selection Checklist -->
          <div class="space-y-2 pt-2 border-t border-[#D8CDC5]">
            <div class="flex items-center justify-between">
              <label class="font-mono font-bold text-[#422d16] uppercase text-[11px]">
                Selecionar Tarefas para Esta Release
              </label>
              <button
                type="button"
                @click="selectAllAvailableTasks"
                class="text-[10px] font-mono text-[#a66130] hover:underline cursor-pointer"
              >
                [Selecionar Todas]
              </button>
            </div>

            <div class="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xs border border-[#D8CDC5] bg-[#fdf8f3]">
              <template v-if="availableTasks.length > 0">
                <label
                  v-for="task in availableTasks"
                  :key="task.id"
                  class="flex items-center gap-2.5 p-2 rounded-xs bg-white border border-[#D8CDC5] cursor-pointer hover:bg-[#f8f6f1]"
                >
                  <input
                    type="checkbox"
                    :value="task.id"
                    v-model="form.task_ids"
                    class="rounded-xs text-[#a66130] focus:ring-[#a66130]"
                  />
                  <span class="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded-xs bg-[#f8f6f1] text-[#a66130] border border-[#D8CDC5]">
                    {{ task.task_code }}
                  </span>
                  <span class="truncate text-xs font-medium text-[#422d16] flex-1">
                    {{ task.title }}
                  </span>
                  <span
                    class="font-mono text-[9px] uppercase px-1.5 py-0.2 rounded-xs border shrink-0"
                    :class="task.status === 'review' ? 'bg-[#fefce8] text-[#ca8a04] border-[#fef08a]' : 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]'"
                  >
                    {{ task.status }}
                  </span>
                </label>
              </template>
              <div v-else class="py-6 text-center text-xs font-mono text-[#847062] italic">
                {{ form.project_id ? '[Nenhuma tarefa disponível para seleção neste projeto]' : '[Selecione um projeto primeiro]' }}
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="pt-3 border-t border-[#D8CDC5] flex items-center justify-end gap-2.5">
            <button
              type="button"
              @click="isModalOpen = false"
              class="retro-button-secondary text-xs py-2 px-4 cursor-pointer"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="retro-button text-xs py-2 px-5 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
              <span>SALVAR RELEASE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import { useModalStore } from '@/stores/modal'
import { releasesApi, tasksApi } from '@/api/client'
import type { Release, ReleaseStatus, Task } from '@/types'
import {
  Rocket,
  Plus,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Terminal,
  Trash2,
} from 'lucide-vue-next'

const projectsStore = useProjectsStore()
const modalStore = useModalStore()

const releases = ref<Release[]>([])
const loading = ref(false)
const saving = ref(false)
const deployingId = ref<number | null>(null)
const selectedProjectId = ref<number | null>(null)

const isModalOpen = ref(false)
const availableTasks = ref<Task[]>([])

const form = ref<{
  project_id: number | undefined
  version: string
  title: string
  description: string
  task_ids: number[]
}>({
  project_id: undefined,
  version: '',
  title: '',
  description: '',
  task_ids: [],
})

async function loadReleases() {
  loading.value = true
  try {
    const params: { project_id?: number } = {}
    if (selectedProjectId.value) {
      params.project_id = selectedProjectId.value
    }
    releases.value = await releasesApi.list(params)
  } catch (err) {
    console.error('Erro ao carregar releases:', err)
  } finally {
    loading.value = false
  }
}

async function loadAvailableTasks() {
  if (!form.value.project_id) {
    availableTasks.value = []
    return
  }
  try {
    const allTasks = await tasksApi.list({ project_id: form.value.project_id })
    // Only show tasks that are ready (reviewed, done, review, or todo)
    availableTasks.value = allTasks.filter(t => t.status === 'reviewed' || t.status === 'done' || t.status === 'review' || t.status === 'todo')
  } catch (err) {
    console.error('Erro ao buscar tarefas:', err)
  }
}

function selectAllAvailableTasks() {
  form.value.task_ids = availableTasks.value.map(t => t.id)
}

function openCreateModal() {
  form.value = {
    project_id: projectsStore.selectedProjectId || (projectsStore.projects[0]?.id ?? undefined),
    version: 'v1.0.' + (releases.value.length + 1),
    title: '',
    description: '',
    task_ids: [],
  }
  isModalOpen.value = true
  if (form.value.project_id) {
    loadAvailableTasks()
  }
}

async function submitRelease() {
  if (!form.value.project_id) return
  saving.value = true
  try {
    await releasesApi.create({
      project_id: form.value.project_id,
      version: form.value.version,
      title: form.value.title,
      description: form.value.description,
      task_ids: form.value.task_ids,
    })
    isModalOpen.value = false
    await loadReleases()
  } catch (err: any) {
    console.error('Erro ao salvar release:', err)
    await modalStore.error('Erro ao salvar release', err.response?.data?.message || 'Verifique os dados informados e tente novamente.')
  } finally {
    saving.value = false
  }
}

async function deploySandbox(rel: Release) {
  const confirmed = await modalStore.confirm({
    title: `Deploy no Sandbox - ${rel.version}`,
    message: `Deseja disparar o deploy da Release ${rel.version} no Sandbox Homelab?\n\nTodas as branches das tarefas vinculadas serão mergeadas na branch 'release'.`,
    type: 'warning',
    confirmText: 'DISPARAR DEPLOY',
    cancelText: 'CANCELAR',
  })
  if (!confirmed) return

  deployingId.value = rel.id
  try {
    const resp = await releasesApi.deploySandbox(rel.id)
    await modalStore.success('Deploy Disparado!', resp.message || 'Deploy no Sandbox disparado com sucesso!')
    await loadReleases()
  } catch (err: any) {
    console.error('Erro ao fazer deploy no sandbox:', err)
    const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message
    await modalStore.error('Falha no Deploy do Sandbox', errorMsg)
  } finally {
    deployingId.value = null
  }
}

async function deployProduction(rel: Release) {
  const confirmed = await modalStore.confirm({
    title: `PROMOÇÃO PARA PRODUÇÃO - ${rel.version}`,
    message: `ATENÇÃO: Deseja promover a Release ${rel.version} para PRODUÇÃO OFICIAL?\n\nIsso realizará o merge da branch 'release' na 'main' e disparará o deploy automático na Oracle Cloud + Cloudflare Pages!`,
    type: 'danger',
    confirmText: 'SIM, PROMOVER PRODUÇÃO',
    cancelText: 'CANCELAR',
  })
  if (!confirmed) return

  deployingId.value = rel.id
  try {
    const resp = await releasesApi.deployProduction(rel.id)
    await modalStore.success('Promoção Concluída!', resp.message || 'Promoção para Produção realizada com sucesso!')
    await loadReleases()
  } catch (err: any) {
    console.error('Erro ao promover para produção:', err)
    const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message
    await modalStore.error('Falha na Promoção para Produção', errorMsg)
  } finally {
    deployingId.value = null
  }
}

async function deleteRelease(id: number) {
  const confirmed = await modalStore.confirm({
    title: 'Excluir Release',
    message: 'Deseja realmente excluir este rascunho de release? As tarefas associadas permanecerão preservadas.',
    type: 'danger',
    confirmText: 'EXCLUIR RASCUNHO',
    cancelText: 'CANCELAR',
  })
  if (!confirmed) return

  try {
    await releasesApi.delete(id)
    await loadReleases()
  } catch (err: any) {
    console.error('Erro ao excluir release:', err)
    await modalStore.error('Erro ao excluir release', err.response?.data?.message || err.message)
  }
}

function releaseStatusBadge(status: ReleaseStatus) {
  switch (status) {
    case 'sandbox':
      return 'bg-[#fefce8] text-[#ca8a04] border-[#fef08a]'
    case 'production':
      return 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]'
    case 'cancelled':
      return 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]'
    default:
      return 'bg-[#f8f6f1] text-[#847062] border-[#D8CDC5]'
  }
}

function releaseStatusLabel(status: ReleaseStatus) {
  switch (status) {
    case 'sandbox':
      return 'SANDBOX ATIVO'
    case 'production':
      return 'PRODUÇÃO OFICIAL'
    case 'cancelled':
      return 'CANCELADO'
    default:
      return 'RASCUNHO'
  }
}

function getSandboxDomain(rel: Release) {
  const prefix = rel.project?.prefix
  if (prefix === 'CST') return 'http://capyshowtime.bmo'
  if (prefix === 'CPH') return 'http://capihouse.bmo'
  return 'http://organizer.bmo'
}

onMounted(async () => {
  await projectsStore.loadProjects()
  await loadReleases()
})
</script>
