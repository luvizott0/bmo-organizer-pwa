import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ModalType = 'info' | 'success' | 'warning' | 'danger' | 'error'

export interface AlertOptions {
  title?: string
  message: string
  type?: ModalType
  details?: string
  okText?: string
}

export interface ConfirmOptions {
  title?: string
  message: string
  type?: ModalType
  details?: string
  confirmText?: string
  cancelText?: string
}

export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false)
  const isConfirm = ref(false)
  const type = ref<ModalType>('info')
  const title = ref('')
  const message = ref('')
  const details = ref<string | undefined>(undefined)
  const confirmText = ref('OK')
  const cancelText = ref('CANCELAR')

  let resolvePromise: ((value: boolean) => void) | null = null

  function alert(opts: string | AlertOptions): Promise<void> {
    return new Promise((resolve) => {
      const parsed: AlertOptions = typeof opts === 'string' ? { message: opts } : opts
      isConfirm.value = false
      type.value = parsed.type || 'info'
      title.value = parsed.title || defaultTitleFor(type.value)
      message.value = parsed.message
      details.value = parsed.details
      confirmText.value = parsed.okText || 'OK'
      isOpen.value = true

      resolvePromise = () => {
        isOpen.value = false
        resolve()
      }
    })
  }

  function confirm(opts: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      isConfirm.value = true
      type.value = opts.type || 'warning'
      title.value = opts.title || defaultTitleFor(type.value)
      message.value = opts.message
      details.value = opts.details
      confirmText.value = opts.confirmText || (opts.type === 'danger' ? 'SIM, CONFIRMAR' : 'CONFIRMAR')
      cancelText.value = opts.cancelText || 'CANCELAR'
      isOpen.value = true

      resolvePromise = (result: boolean) => {
        isOpen.value = false
        resolve(result)
      }
    })
  }

  function success(titleText: string, msg: string, det?: string) {
    return alert({ title: titleText, message: msg, type: 'success', details: det })
  }

  function error(titleText: string, msg: string, det?: string) {
    return alert({ title: titleText, message: msg, type: 'error', details: det })
  }

  function warning(titleText: string, msg: string, det?: string) {
    return alert({ title: titleText, message: msg, type: 'warning', details: det })
  }

  function info(titleText: string, msg: string, det?: string) {
    return alert({ title: titleText, message: msg, type: 'info', details: det })
  }

  function handleConfirm() {
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
    isOpen.value = false
  }

  function handleCancel() {
    if (resolvePromise) {
      resolvePromise(false)
      resolvePromise = null
    }
    isOpen.value = false
  }

  function defaultTitleFor(t: ModalType): string {
    switch (t) {
      case 'danger':
      case 'error':
        return 'ATENÇÃO'
      case 'warning':
        return 'AVISO'
      case 'success':
        return 'SUCESSO'
      case 'info':
      default:
        return 'INFORMAÇÃO'
    }
  }

  return {
    isOpen,
    isConfirm,
    type,
    title,
    message,
    details,
    confirmText,
    cancelText,
    alert,
    confirm,
    success,
    error,
    warning,
    info,
    handleConfirm,
    handleCancel,
  }
})
