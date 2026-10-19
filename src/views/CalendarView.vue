<template>
  <div class="h-full flex flex-col overflow-hidden bg-[#f8f6f1]">
    <AppHeader>
      <template #actions>
        <!-- View Switcher -->
        <div class="flex items-center gap-1 bg-[#fdf8f3] p-1 rounded-xs border border-[#D8CDC5] text-xs font-mono font-bold">
          <button
            @click="calendarStore.currentView = 'month'"
            class="px-2.5 py-1 rounded-xs transition-all duration-150 cursor-pointer uppercase"
            :class="calendarStore.currentView === 'month' ? 'bg-[#a66130] text-white' : 'text-[#7d5628] hover:text-[#422d16]'"
          >
            MÊS
          </button>
          <button
            @click="calendarStore.currentView = 'week'"
            class="px-2.5 py-1 rounded-xs transition-all duration-150 cursor-pointer uppercase"
            :class="calendarStore.currentView === 'week' ? 'bg-[#a66130] text-white' : 'text-[#7d5628] hover:text-[#422d16]'"
          >
            SEMANA
          </button>
        </div>

        <button
          @click="isModalOpen = true"
          class="retro-button"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>NOVO EVENTO / LEMBRETE</span>
        </button>
      </template>
    </AppHeader>

    <!-- Calendar Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Grid Area -->
      <div class="flex-1 flex flex-col p-5 overflow-hidden">
        <!-- Calendar Nav -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <h2 class="text-base font-bold font-mono text-[#422d16] capitalize">
              » {{ monthTitle }}
            </h2>
            <button
              @click="goToToday"
              class="retro-button-secondary font-mono text-xs px-2.5 py-1 rounded-xs"
            >
              [HOJE]
            </button>
          </div>

          <div class="flex items-center gap-1 bg-[#ffffff] border border-[#D8CDC5] rounded-xs p-0.5">
            <button
              @click="navigate(-1)"
              class="p-1 rounded-xs hover:bg-[#f8f6f1] text-[#7d5628] hover:text-[#422d16] transition-colors cursor-pointer"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            <button
              @click="navigate(1)"
              class="p-1 rounded-xs hover:bg-[#f8f6f1] text-[#7d5628] hover:text-[#422d16] transition-colors cursor-pointer"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Month Grid in CapiHouse style -->
        <div v-if="calendarStore.currentView === 'month'" class="flex-1 flex flex-col retro-card shadow-xs">
          <!-- Weekday Labels -->
          <div class="grid grid-cols-7 border-b border-[#D8CDC5] bg-[#fdf8f3] text-center text-xs font-bold font-mono text-[#7d5628] py-2 uppercase">
            <span v-for="day in weekDayNames" :key="day">{{ day }}</span>
          </div>

          <!-- Days Grid -->
          <div class="flex-1 grid grid-cols-7 grid-rows-5 gap-px bg-[#D8CDC5]">
            <div
              v-for="cell in monthDays"
              :key="cell.dateKey"
              class="bg-white p-2 flex flex-col overflow-hidden transition-colors"
              :class="{
                'opacity-40 bg-[#f8f6f1]': !cell.isCurrentMonth,
                'bg-[#fdf8f3]': cell.isToday,
              }"
            >
              <div class="flex items-center justify-between mb-1">
                <span
                  class="text-xs font-bold font-mono w-5 h-5 rounded-xs flex items-center justify-center"
                  :class="cell.isToday ? 'bg-[#a66130] text-white' : 'text-[#5f4120]'"
                >
                  {{ cell.dayNumber }}
                </span>
              </div>

              <!-- Events -->
              <div class="flex-1 overflow-y-auto space-y-1 pr-0.5">
                <div
                  v-for="event in cell.events"
                  :key="event.id"
                  class="px-1.5 py-0.5 rounded-xs text-[10px] font-bold font-mono text-white truncate shadow-2xs"
                  :style="{ backgroundColor: event.color || '#a66130' }"
                  :title="event.title"
                >
                  {{ event.title }}
                </div>

                <div
                  v-for="rem in cell.reminders"
                  :key="rem.id"
                  class="px-1.5 py-0.5 rounded-xs text-[10px] font-mono font-bold flex items-center gap-1 border"
                  :class="rem.is_completed ? 'line-through text-[#847062] bg-[#f8f6f1] border-[#D8CDC5]' : 'text-[#a66130] bg-[#fdf8f3] border-[#D8CDC5]'"
                  :title="rem.title"
                >
                  <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="rem.is_completed ? 'bg-[#847062]' : 'bg-[#a66130]'"></span>
                  <span class="truncate">{{ rem.title }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Week Grid -->
        <div v-else class="flex-1 flex flex-col retro-card shadow-xs">
          <div class="grid grid-cols-7 flex-1 gap-px bg-[#D8CDC5]">
            <div
              v-for="day in weekDays"
              :key="day.dateKey"
              class="bg-white p-3 flex flex-col"
              :class="{ 'bg-[#fdf8f3]': day.isToday }"
            >
              <div class="text-center pb-2 border-b border-[#D8CDC5] mb-2 font-mono">
                <span class="text-xs font-bold text-[#847062] block uppercase">{{ day.weekday }}</span>
                <span
                  class="inline-block text-sm font-bold px-2 py-0.5 rounded-xs mt-0.5"
                  :class="day.isToday ? 'bg-[#a66130] text-white' : 'text-[#422d16]'"
                >
                  {{ day.dayNumber }}
                </span>
              </div>

              <div class="flex-1 overflow-y-auto space-y-1.5">
                <div
                  v-for="event in day.events"
                  :key="event.id"
                  class="p-2 rounded-xs text-xs font-bold font-mono text-white shadow-2xs"
                  :style="{ backgroundColor: event.color || '#a66130' }"
                >
                  <div class="truncate">{{ event.title }}</div>
                  <div v-if="event.start_at" class="text-[9px] opacity-90 mt-0.5">
                    {{ formatTime(event.start_at) }}
                  </div>
                </div>

                <div
                  v-for="rem in day.reminders"
                  :key="rem.id"
                  @click="calendarStore.toggleReminder(rem.id)"
                  class="p-2 rounded-xs text-xs font-mono font-bold flex items-center justify-between cursor-pointer border transition-colors"
                  :class="rem.is_completed ? 'bg-[#f8f6f1] text-[#847062] border-[#D8CDC5] line-through' : 'bg-[#fdf8f3] text-[#a66130] border-[#D8CDC5] hover:bg-[#e8c9a5]'"
                >
                  <span class="truncate">{{ rem.title }}</span>
                  <CheckCircle2 class="w-3.5 h-3.5 shrink-0" :class="rem.is_completed ? 'text-[#847062]' : 'text-[#a66130]'" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Sidepanel: Rotina & WhatsApp -->
      <aside class="w-80 border-l-2 border-[#D8CDC5] bg-[#fdf8f3] p-5 flex flex-col shrink-0">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-1.5">
            <Bell class="w-4 h-4 text-[#a66130]" />
            <h3 class="section-marker text-xs uppercase">
              ROTINA & WHATSAPP
            </h3>
          </div>
          <span class="text-[9px] font-bold font-mono text-[#a66130] px-1.5 py-0.5 rounded-xs bg-white border border-[#D8CDC5]">
            [SYNC]
          </span>
        </div>

        <p class="text-xs text-[#847062] font-sans mb-4 leading-relaxed">
          Itens de rotina integrados ao grupo de WhatsApp pelo BMO.
        </p>

        <!-- Reminders List -->
        <div class="flex-1 overflow-y-auto space-y-2 pr-0.5">
          <div
            v-for="rem in calendarStore.reminders"
            :key="rem.id"
            @click="calendarStore.toggleReminder(rem.id)"
            class="p-2.5 rounded-xs border-2 transition-all duration-150 cursor-pointer flex items-start gap-2.5"
            :class="rem.is_completed ? 'bg-[#f8f6f1] border-[#D8CDC5] text-[#847062]' : 'bg-white border-[#D8CDC5] hover:border-[#a66130] text-[#333333] shadow-xs'"
          >
            <button class="mt-0.5 text-[#847062] hover:text-[#a66130] transition-colors">
              <CheckCircle2 class="w-4 h-4" :class="rem.is_completed ? 'text-[#a66130]' : 'text-[#D8CDC5]'" />
            </button>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold font-sans leading-snug" :class="{ 'line-through text-[#847062]': rem.is_completed }">
                {{ rem.title }}
              </p>
              <div class="flex items-center gap-2 mt-1 text-[10px] text-[#847062] font-mono">
                <span>{{ formatDate(rem.due_at) }}</span>
                <span v-if="rem.notify_whatsapp" class="text-[#a66130] font-bold flex items-center gap-0.5">
                  <BellRing class="w-3 h-3" /> ZAP
                </span>
              </div>
            </div>
          </div>

          <div v-if="calendarStore.reminders.length === 0" class="py-8 text-center text-xs text-[#847062] font-mono italic">
            [nenhum lembrete pendente]
          </div>
        </div>
      </aside>
    </div>

    <!-- Modal: Novo Evento / Lembrete -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4"
    >
      <div class="w-full max-w-md retro-card shadow-lg p-0 text-[#333333] bg-white">
        <div class="retro-card-header flex items-center justify-between">
          <span>NOVO ITEM // AGENDA & ROTINA</span>
          <button @click="isModalOpen = false" class="text-white/80 hover:text-white cursor-pointer font-mono font-bold">
            [X]
          </button>
        </div>

        <div class="p-5 font-sans space-y-4">
          <!-- Type Selector -->
          <div class="grid grid-cols-2 gap-2 p-1 bg-[#fdf8f3] rounded-xs border border-[#D8CDC5] text-xs font-mono font-bold">
            <button
              type="button"
              @click="formType = 'event'"
              class="py-1.5 rounded-xs transition-all duration-150 cursor-pointer uppercase"
              :class="formType === 'event' ? 'bg-[#a66130] text-white' : 'text-[#7d5628] hover:text-[#422d16]'"
            >
              EVENTO COM HORA
            </button>
            <button
              type="button"
              @click="formType = 'reminder'"
              class="py-1.5 rounded-xs transition-all duration-150 cursor-pointer uppercase"
              :class="formType === 'reminder' ? 'bg-[#a66130] text-white' : 'text-[#7d5628] hover:text-[#422d16]'"
            >
              LEMBRETE ROTINA
            </button>
          </div>

          <form @submit.prevent="handleCreate" class="space-y-3">
            <div>
              <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">» TÍTULO</label>
              <input
                v-model="form.title"
                type="text"
                required
                :placeholder="formType === 'event' ? 'Ex: Consulta Médica / Reunião' : 'Ex: Lavar louça / Colocar lixo'"
                class="retro-input"
              />
            </div>

            <div>
              <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">» DATA E HORA</label>
              <input
                v-model="form.datetime"
                type="datetime-local"
                required
                class="retro-input font-mono"
              />
            </div>

            <div v-if="formType === 'event'">
              <label class="block text-xs font-bold font-mono text-[#5f4120] mb-1">» COR DO EVENTO</label>
              <div class="flex items-center gap-2">
                <button
                  v-for="c in ['#a66130', '#b07a3b', '#7d5628', '#16a34a', '#dc2626', '#2563eb']"
                  :key="c"
                  type="button"
                  @click="form.color = c"
                  class="w-6 h-6 rounded-xs border-2 transition-transform cursor-pointer"
                  :style="{ backgroundColor: c }"
                  :class="form.color === c ? 'scale-110 border-[#333333]' : 'border-white'"
                ></button>
              </div>
            </div>

            <div v-if="formType === 'reminder'" class="p-2.5 rounded-xs bg-[#fdf8f3] border border-[#D8CDC5] flex items-center gap-2">
              <input
                id="zap"
                type="checkbox"
                v-model="form.notify_whatsapp"
                class="rounded-xs text-[#a66130] focus:ring-0 cursor-pointer"
              />
              <label for="zap" class="text-xs font-bold font-mono text-[#5f4120] flex items-center gap-1 cursor-pointer">
                <BellRing class="w-3.5 h-3.5 text-[#a66130]" /> NOTIFICAR NO GRUPO DO WHATSAPP
              </label>
            </div>

            <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D8CDC5]">
              <button
                type="button"
                @click="isModalOpen = false"
                class="retro-button-secondary font-mono text-xs px-3 py-1.5 rounded-xs"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                class="retro-button"
              >
                SALVAR
              </button>
            </div>
          </form>
        </div>
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
} from 'lucide-vue-next'

const calendarStore = useCalendarStore()
const weekDayNames = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const isModalOpen = ref(false)
const formType = ref<'event' | 'reminder'>('event')
const form = ref({
  title: '',
  datetime: new Date().toISOString().slice(0, 16),
  color: '#a66130',
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
