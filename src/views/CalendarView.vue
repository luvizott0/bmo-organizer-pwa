<template>
  <div class="h-full flex flex-col overflow-hidden bg-[#f8fafc]">
    <AppHeader>
      <template #actions>
        <!-- View Switcher -->
        <div class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs font-bold">
          <button
            @click="calendarStore.currentView = 'month'"
            class="px-3.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
            :class="calendarStore.currentView === 'month' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          >
            Mês
          </button>
          <button
            @click="calendarStore.currentView = 'week'"
            class="px-3.5 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
            :class="calendarStore.currentView === 'week' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          >
            Semana
          </button>
        </div>

        <button
          @click="isModalOpen = true"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span>Novo Evento / Lembrete</span>
        </button>
      </template>
    </AppHeader>

    <!-- Calendar Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Grid Area -->
      <div class="flex-1 flex flex-col p-6 overflow-hidden">
        <!-- Calendar Nav -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-xl font-extrabold text-slate-900 capitalize tracking-tight">
              {{ monthTitle }}
            </h2>
            <button
              @click="goToToday"
              class="px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            >
              Hoje
            </button>
          </div>

          <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              @click="navigate(-1)"
              class="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <button
              @click="navigate(1)"
              class="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Month Grid -->
        <div v-if="calendarStore.currentView === 'month'" class="flex-1 flex flex-col border border-slate-200/80 rounded-3xl overflow-hidden bg-white shadow-xs">
          <!-- Weekday Labels -->
          <div class="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50/80 text-center text-xs font-bold text-slate-500 py-3 uppercase tracking-wider">
            <span v-for="day in weekDayNames" :key="day">{{ day }}</span>
          </div>

          <!-- Days Grid -->
          <div class="flex-1 grid grid-cols-7 grid-rows-5 gap-px bg-slate-200/60">
            <div
              v-for="cell in monthDays"
              :key="cell.dateKey"
              class="bg-white p-2.5 flex flex-col overflow-hidden transition-colors"
              :class="{
                'opacity-40 bg-slate-50/50': !cell.isCurrentMonth,
                'bg-indigo-50/20': cell.isToday,
              }"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span
                  class="text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center font-mono"
                  :class="cell.isToday ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-700'"
                >
                  {{ cell.dayNumber }}
                </span>
              </div>

              <!-- Events -->
              <div class="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
                <div
                  v-for="event in cell.events"
                  :key="event.id"
                  class="px-2 py-1 rounded-lg text-[11px] font-bold text-white truncate shadow-2xs"
                  :style="{ backgroundColor: event.color || '#4f46e5' }"
                  :title="event.title"
                >
                  {{ event.title }}
                </div>

                <div
                  v-for="rem in cell.reminders"
                  :key="rem.id"
                  class="px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border"
                  :class="rem.is_completed ? 'line-through text-slate-400 bg-slate-50 border-slate-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200/60'"
                  :title="rem.title"
                >
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="rem.is_completed ? 'bg-slate-400' : 'bg-emerald-500'"></span>
                  <span class="truncate">{{ rem.title }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Week Grid -->
        <div v-else class="flex-1 flex flex-col border border-slate-200/80 rounded-3xl overflow-hidden bg-white shadow-xs">
          <div class="grid grid-cols-7 flex-1 gap-px bg-slate-200/60">
            <div
              v-for="day in weekDays"
              :key="day.dateKey"
              class="bg-white p-3.5 flex flex-col"
              :class="{ 'bg-indigo-50/20': day.isToday }"
            >
              <div class="text-center pb-3 border-b border-slate-100 mb-3">
                <span class="text-xs font-bold text-slate-400 block uppercase tracking-wider">{{ day.weekday }}</span>
                <span
                  class="inline-block text-base font-extrabold font-mono px-2 py-0.5 rounded-full mt-0.5"
                  :class="day.isToday ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-800'"
                >
                  {{ day.dayNumber }}
                </span>
              </div>

              <div class="flex-1 overflow-y-auto space-y-2">
                <div
                  v-for="event in day.events"
                  :key="event.id"
                  class="p-2.5 rounded-xl text-xs font-bold text-white shadow-2xs"
                  :style="{ backgroundColor: event.color || '#4f46e5' }"
                >
                  <div class="truncate">{{ event.title }}</div>
                  <div v-if="event.start_at" class="text-[10px] opacity-90 font-mono mt-0.5">
                    {{ formatTime(event.start_at) }}
                  </div>
                </div>

                <div
                  v-for="rem in day.reminders"
                  :key="rem.id"
                  @click="calendarStore.toggleReminder(rem.id)"
                  class="p-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer border transition-colors shadow-2xs"
                  :class="rem.is_completed ? 'bg-slate-50 text-slate-400 border-slate-200 line-through' : 'bg-emerald-50 text-emerald-800 border-emerald-200/60 hover:bg-emerald-100/60'"
                >
                  <span class="truncate">{{ rem.title }}</span>
                  <CheckCircle2 class="w-4 h-4 shrink-0" :class="rem.is_completed ? 'text-slate-400' : 'text-emerald-600'" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidepanel: Rotina & WhatsApp -->
      <aside class="w-80 border-l border-slate-200/80 bg-white p-6 flex flex-col shrink-0 shadow-xs">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Bell class="w-4 h-4 stroke-[2.2]" />
            </div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800">
              Rotina & WhatsApp
            </h3>
          </div>
          <span class="text-[10px] font-bold font-mono text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
            Sincronizado
          </span>
        </div>

        <p class="text-xs text-slate-500 mb-5 leading-relaxed">
          Itens gerenciados pelo BMO e integrados com seu grupo de rotina do WhatsApp.
        </p>

        <!-- Reminders List -->
        <div class="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div
            v-for="rem in calendarStore.reminders"
            :key="rem.id"
            @click="calendarStore.toggleReminder(rem.id)"
            class="p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer flex items-start gap-3"
            :class="rem.is_completed ? 'bg-slate-50/70 border-slate-200 text-slate-400' : 'bg-white border-slate-200/90 hover:border-slate-300 text-slate-800 shadow-2xs hover:shadow-xs'"
          >
            <button class="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors">
              <CheckCircle2 class="w-4 h-4" :class="rem.is_completed ? 'text-emerald-500' : 'text-slate-300'" />
            </button>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold leading-snug" :class="{ 'line-through text-slate-400': rem.is_completed }">
                {{ rem.title }}
              </p>
              <div class="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
                <span>{{ formatDate(rem.due_at) }}</span>
                <span v-if="rem.notify_whatsapp" class="text-emerald-600 font-bold flex items-center gap-0.5">
                  <BellRing class="w-3 h-3" /> Zap
                </span>
              </div>
            </div>
          </div>

          <div v-if="calendarStore.reminders.length === 0" class="py-12 text-center text-xs text-slate-400 italic">
            Nenhum lembrete pendente na rotina.
          </div>
        </div>
      </aside>
    </div>

    <!-- Modal: Novo Evento / Lembrete -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-6 text-slate-900">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-extrabold text-slate-900">Criar na Agenda / Rotina</h2>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Type Selector -->
        <div class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
          <button
            type="button"
            @click="formType = 'event'"
            class="py-2 rounded-lg transition-all duration-150 cursor-pointer"
            :class="formType === 'event' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          >
            Evento com Horário
          </button>
          <button
            type="button"
            @click="formType = 'reminder'"
            class="py-2 rounded-lg transition-all duration-150 cursor-pointer"
            :class="formType === 'reminder' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'"
          >
            Lembrete de Rotina
          </button>
        </div>

        <form @submit.prevent="handleCreate">
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Título</label>
              <input
                v-model="form.title"
                type="text"
                required
                :placeholder="formType === 'event' ? 'Ex: Consulta Médica / Reunião' : 'Ex: Lavar louça / Colocar lixo'"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 shadow-2xs"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Data e Hora</label>
              <input
                v-model="form.datetime"
                type="datetime-local"
                required
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-600 shadow-2xs font-mono"
              />
            </div>

            <div v-if="formType === 'event'">
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Cor do Evento</label>
              <div class="flex items-center gap-2">
                <button
                  v-for="c in ['#4f46e5', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']"
                  :key="c"
                  type="button"
                  @click="form.color = c"
                  class="w-7 h-7 rounded-full border-2 transition-transform shadow-2xs cursor-pointer"
                  :style="{ backgroundColor: c }"
                  :class="form.color === c ? 'scale-110 border-slate-900' : 'border-white'"
                ></button>
              </div>
            </div>

            <div v-if="formType === 'reminder'" class="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2.5">
              <input
                id="zap"
                type="checkbox"
                v-model="form.notify_whatsapp"
                class="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
              />
              <label for="zap" class="text-xs font-bold text-emerald-900 flex items-center gap-1.5 cursor-pointer">
                <BellRing class="w-3.5 h-3.5 text-emerald-600" /> Notificar no grupo do WhatsApp pelo BMO
              </label>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              @click="isModalOpen = false"
              class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              :class="formType === 'event' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import AppHeader from '@/components/layout/AppHeader.vue'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellRing,
  CheckCircle2,
  X,
} from 'lucide-vue-next'

const calendarStore = useCalendarStore()
const weekDayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const isModalOpen = ref(false)
const formType = ref<'event' | 'reminder'>('event')
const form = ref({
  title: '',
  datetime: new Date().toISOString().slice(0, 16),
  color: '#4f46e5',
  notify_whatsapp: true,
})

const monthTitle = computed(() => {
  return calendarStore.currentDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
})

function navigate(direction: number) {
  const d = new Date(calendarStore.currentDate)
  if (calendarStore.currentView === 'month') {
    d.setMonth(d.getMonth() + direction)
  } else {
    d.setDate(d.getDate() + direction * 7)
  }
  calendarStore.currentDate = d
}

function goToToday() {
  calendarStore.currentDate = new Date()
}

// Generate Month grid cells
const monthDays = computed(() => {
  const current = calendarStore.currentDate
  const year = current.getFullYear()
  const month = current.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  let startWeekday = firstDayOfMonth.getDay() - 1
  if (startWeekday < 0) startWeekday = 6

  const cells = []
  const todayKey = new Date().toISOString().slice(0, 10)

  // Prev month padding
  for (let i = startWeekday; i > 0; i--) {
    const d = new Date(year, month, 1 - i)
    const key = d.toISOString().slice(0, 10)
    cells.push({
      dateKey: key,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: key === todayKey,
      events: calendarStore.events.filter((e) => (e.start_at || '').slice(0, 10) === key),
      reminders: calendarStore.reminders.filter((r) => (r.due_at || '').slice(0, 10) === key),
    })
  }

  // Current month days
  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
    const curDate = new Date(year, month, d)
    const key = curDate.toISOString().slice(0, 10)
    cells.push({
      dateKey: key,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: key === todayKey,
      events: calendarStore.events.filter((e) => (e.start_at || '').slice(0, 10) === key),
      reminders: calendarStore.reminders.filter((r) => (r.due_at || '').slice(0, 10) === key),
    })
  }

  // Pad to complete 35 or 42 grid cells
  const remaining = 35 - cells.length
  if (remaining > 0) {
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i)
      const key = d.toISOString().slice(0, 10)
      cells.push({
        dateKey: key,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: key === todayKey,
        events: calendarStore.events.filter((e) => (e.start_at || '').slice(0, 10) === key),
        reminders: calendarStore.reminders.filter((r) => (r.due_at || '').slice(0, 10) === key),
      })
    }
  }

  return cells
})

// Generate Week days
const weekDays = computed(() => {
  const current = new Date(calendarStore.currentDate)
  let dayOfWeek = current.getDay() - 1
  if (dayOfWeek < 0) dayOfWeek = 6

  const startOfWeek = new Date(current)
  startOfWeek.setDate(current.getDate() - dayOfWeek)

  const days = []
  const todayKey = new Date().toISOString().slice(0, 10)

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    days.push({
      dateKey: key,
      weekday: weekDayNames[i],
      dayNumber: d.getDate(),
      isToday: key === todayKey,
      events: calendarStore.events.filter((e) => (e.start_at || '').slice(0, 10) === key),
      reminders: calendarStore.reminders.filter((r) => (r.due_at || '').slice(0, 10) === key),
    })
  }
  return days
})

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  } catch {
    return ''
  }
}

async function handleCreate() {
  if (formType.value === 'event') {
    await calendarStore.addEvent({
      title: form.value.title,
      start_at: form.value.datetime,
      color: form.value.color,
      category: 'routine',
    })
  } else {
    await calendarStore.addReminder({
      title: form.value.title,
      due_at: form.value.datetime,
      notify_whatsapp: form.value.notify_whatsapp,
      category: 'routine',
    })
  }
  isModalOpen.value = false
  form.value.title = ''
}
</script>
