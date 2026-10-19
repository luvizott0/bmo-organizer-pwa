import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CalendarEvent, Reminder } from '@/types'
import { calendarApi, remindersApi } from '@/api/client'

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<CalendarEvent[]>([])
  const reminders = ref<Reminder[]>([])
  const loading = ref(false)
  const currentView = ref<'month' | 'week'>('month')
  const currentDate = ref(new Date())

  async function loadRange(start: string, end: string) {
    loading.value = true
    try {
      events.value = await calendarApi.list(start, end)
    } catch (err) {
      console.error('Failed to load events:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadReminders() {
    try {
      reminders.value = await remindersApi.list()
    } catch (err) {
      console.error('Failed to load reminders:', err)
    }
  }

  async function addEvent(payload: Partial<CalendarEvent>) {
    const created = await calendarApi.create(payload)
    events.value.push(created)
    return created
  }

  async function addReminder(payload: Partial<Reminder>) {
    const created = await remindersApi.create(payload)
    reminders.value.unshift(created)
    return created
  }

  async function toggleReminder(id: number) {
    const reminder = reminders.value.find((r) => r.id === id)
    if (reminder) {
      reminder.is_completed = !reminder.is_completed
      try {
        const updated = await remindersApi.toggle(id)
        Object.assign(reminder, updated)
      } catch (err) {
        reminder.is_completed = !reminder.is_completed
        console.error('Failed to toggle reminder:', err)
      }
    }
  }

  return {
    events,
    reminders,
    loading,
    currentView,
    currentDate,
    loadRange,
    loadReminders,
    addEvent,
    addReminder,
    toggleReminder,
  }
})
