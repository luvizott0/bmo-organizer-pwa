<template>
  <Transition
    enter-active-class="transition-opacity duration-150 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-100 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modalStore.isOpen"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 select-none overflow-y-auto"
      @click.self="onBackdropClick"
    >
      <div
        class="w-full max-w-md retro-card shadow-2xl p-0 text-[#333333] bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        tabindex="-1"
        @keydown.esc="onEsc"
        @keydown.enter.prevent="modalStore.handleConfirm"
      >
        <!-- Header -->
        <div :class="['retro-card-header text-white flex items-center justify-between', headerBgClass]">
          <div class="flex items-center gap-2">
            <component :is="headerIcon" class="w-4 h-4 shrink-0" />
            <span class="font-mono text-xs font-bold uppercase tracking-wider truncate">
              {{ headerLabel }}
            </span>
          </div>
          <button
            @click="modalStore.handleCancel"
            class="text-white/80 hover:text-white cursor-pointer font-mono font-bold px-1.5 py-0.5 rounded-xs hover:bg-white/10 transition-colors ml-2"
            title="Fechar"
          >
            [X]
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 font-sans text-center">
          <!-- Icon Badge -->
          <div :class="['w-12 h-12 rounded-full border-2 flex items-center justify-center mx-auto shadow-xs', iconBadgeClass]">
            <component :is="bodyIcon" class="w-6 h-6 shrink-0" />
          </div>

          <!-- Title & Message -->
          <div class="space-y-1.5">
            <h3 class="font-mono text-sm font-bold text-[#422d16]">
              {{ modalStore.title }}
            </h3>
            <p class="text-xs text-[#5f4120] font-sans leading-relaxed whitespace-pre-line text-left bg-[#fdf8f3] p-3 rounded-xs border border-[#D8CDC5]">
              {{ modalStore.message }}
            </p>
          </div>

          <!-- Technical Details (if any) -->
          <div
            v-if="modalStore.details"
            class="p-2.5 bg-[#261f18] text-[#e8c9a5] border border-[#422d16] rounded-xs text-[11px] font-mono text-left max-h-36 overflow-y-auto"
          >
            <div class="text-[10px] text-[#847062] uppercase tracking-wider mb-1 font-bold">DETALHES TÉCNICOS:</div>
            <pre class="whitespace-pre-wrap break-all">{{ modalStore.details }}</pre>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-3 bg-[#fdf8f3] border-t-2 border-[#D8CDC5] flex items-center justify-end gap-2 font-mono text-xs">
          <!-- Cancel Button (Only in Confirm Mode) -->
          <button
            v-if="modalStore.isConfirm"
            type="button"
            @click="modalStore.handleCancel"
            class="retro-button-secondary py-1.5 px-3.5 cursor-pointer"
          >
            {{ modalStore.cancelText }}
          </button>

          <!-- Confirm / OK Button -->
          <button
            type="button"
            @click="modalStore.handleConfirm"
            :class="['retro-button py-1.5 px-4 cursor-pointer text-white flex items-center gap-1.5 shadow-xs', confirmButtonClass]"
            autofocus
          >
            <span>{{ modalStore.confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
} from 'lucide-vue-next'
import { useModalStore } from '@/stores/modal'

const modalStore = useModalStore()

const headerBgClass = computed(() => {
  switch (modalStore.type) {
    case 'danger':
    case 'error':
      return 'bg-[#dc2626]'
    case 'warning':
      return 'bg-[#d97706]'
    case 'success':
      return 'bg-[#16a34a]'
    case 'info':
    default:
      return 'bg-[#a66130]'
  }
})

const headerLabel = computed(() => {
  if (modalStore.isConfirm) {
    return 'CONFIRMAÇÃO NECESSÁRIA'
  }
  switch (modalStore.type) {
    case 'danger':
    case 'error':
      return 'ERRO DO SISTEMA'
    case 'warning':
      return 'AVISO'
    case 'success':
      return 'SUCESSO'
    case 'info':
    default:
      return 'INFORMAÇÃO'
  }
})

const headerIcon = computed(() => {
  switch (modalStore.type) {
    case 'danger':
    case 'error':
      return XCircle
    case 'warning':
      return AlertTriangle
    case 'success':
      return CheckCircle2
    case 'info':
    default:
      return Info
  }
})

const bodyIcon = computed(() => {
  switch (modalStore.type) {
    case 'danger':
    case 'error':
      return AlertTriangle
    case 'warning':
      return AlertCircle
    case 'success':
      return CheckCircle2
    case 'info':
    default:
      return Info
  }
})

const iconBadgeClass = computed(() => {
  switch (modalStore.type) {
    case 'danger':
    case 'error':
      return 'bg-[#fef2f2] border-[#fecaca] text-[#dc2626]'
    case 'warning':
      return 'bg-[#fffbeb] border-[#fde68a] text-[#d97706]'
    case 'success':
      return 'bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]'
    case 'info':
    default:
      return 'bg-[#fdf8f3] border-[#D8CDC5] text-[#a66130]'
  }
})

const confirmButtonClass = computed(() => {
  switch (modalStore.type) {
    case 'danger':
    case 'error':
      return 'bg-[#dc2626] hover:bg-[#b91c1c] border-[#dc2626]'
    case 'warning':
      return 'bg-[#d97706] hover:bg-[#b45309] border-[#d97706]'
    case 'success':
      return 'bg-[#16a34a] hover:bg-[#15803d] border-[#16a34a]'
    case 'info':
    default:
      return 'bg-[#a66130] hover:bg-[#7d5628] border-[#a66130]'
  }
})

function onBackdropClick() {
  if (modalStore.isConfirm) {
    modalStore.handleCancel()
  } else {
    modalStore.handleConfirm()
  }
}

function onEsc() {
  modalStore.handleCancel()
}

function handleKeydown(e: KeyboardEvent) {
  if (!modalStore.isOpen) return
  if (e.key === 'Escape') {
    modalStore.handleCancel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>
