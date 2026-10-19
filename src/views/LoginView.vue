<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8f6f1]">
    <div class="w-full max-w-md">
      <!-- Retro Card Container -->
      <div class="retro-card overflow-hidden shadow-md">
        <!-- Retro Header -->
        <div class="retro-card-header flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#f8f6f1] inline-block animate-pulse"></span>
            <span>BMO ORGANIZER :: AUTENTICAÇÃO</span>
          </div>
          <span class="text-[10px] opacity-80 font-mono">BMO-CORE v1.0</span>
        </div>

        <!-- Card Body -->
        <div class="p-6 sm:p-8 space-y-6 bg-white">
          <div class="text-center space-y-2">
            <div class="inline-flex items-center justify-center w-14 h-14 rounded-xs bg-[#fdf8f3] border-2 border-[#a66130] text-[#a66130] shadow-2xs mb-1">
              <Boxes class="w-7 h-7" />
            </div>
            <h1 class="text-xl font-bold font-mono text-[#422d16] tracking-tight">
              BMO ORGANIZER
            </h1>
            <p class="text-xs text-[#847062] font-sans">
              Entre com sua conta BMO para gerenciar projetos, boards Kanban e rotinas.
            </p>
          </div>

          <!-- Error Alert -->
          <div
            v-if="errorMessage"
            class="p-3 bg-[#fdf0ea] border-2 border-[#d9534f] text-[#c9302c] rounded-xs flex items-center gap-2 text-xs font-mono"
          >
            <AlertCircle class="w-4 h-4 shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="space-y-1.5">
              <label class="block text-xs font-mono font-bold text-[#422d16]">
                E-MAIL ::
              </label>
              <div class="relative">
                <Mail class="w-4 h-4 text-[#847062] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  v-model="email"
                  type="email"
                  required
                  placeholder="usuario@bmo.local"
                  class="retro-input w-full pl-9"
                />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-mono font-bold text-[#422d16]">
                SENHA ::
              </label>
              <div class="relative">
                <Lock class="w-4 h-4 text-[#847062] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  v-model="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  class="retro-input w-full pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="retro-button w-full justify-center py-2.5 mt-2 text-xs font-bold"
            >
              <LogIn class="w-4 h-4" />
              <span>{{ isSubmitting ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA' }}</span>
            </button>
          </form>

          <!-- Footer Info -->
          <div class="pt-2 border-t border-[#D8CDC5] text-center">
            <p class="text-[11px] font-mono text-[#847062]">
              Homelab Sandbox BMO • Integrado à API
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProjectsStore } from '@/stores/projects'
import { useCalendarStore } from '@/stores/calendar'
import { Boxes, Mail, Lock, LogIn, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const projectsStore = useProjectsStore()
const calendarStore = useCalendarStore()

const email = ref('')
const password = ref('')
const errorMessage = ref<string | null>(null)
const isSubmitting = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Preencha seu e-mail e senha.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = null

  try {
    await authStore.login(email.value, password.value)
    await Promise.allSettled([
      projectsStore.loadProjects(),
      projectsStore.loadTasks(),
      calendarStore.loadReminders(),
    ])
    const redirect = (route.query.redirect as string) || '/projects'
    router.push(redirect)
  } catch (err: any) {
    console.error('Login error:', err)
    errorMessage.value =
      err.response?.data?.message ||
      err.response?.data?.errors?.email?.[0] ||
      'Credenciais inválidas. Verifique seu e-mail e senha.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

