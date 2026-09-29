<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  min?: string
  variant?: 'compact' | 'input'
  hideTodayButton?: boolean
}>(), {
  variant: 'input',
  placeholder: 'เลือกวันที่',
  hideTodayButton: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isOpen = ref(false)

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const calendarMonth = ref(new Date().getMonth())
const calendarYear = ref(new Date().getFullYear())

const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]
const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]

const openCalendar = () => {
  if (props.modelValue) {
    const [y, m, d] = props.modelValue.split("-")
    calendarYear.value = parseInt(y, 10)
    calendarMonth.value = parseInt(m, 10) - 1
  } else {
    const d = new Date()
    calendarYear.value = d.getFullYear()
    calendarMonth.value = d.getMonth()
  }
  isOpen.value = true
}

const closeCalendar = () => {
  isOpen.value = false
}

const isDateDisabled = (dateStr: string) => {
  if (!props.min) return false;
  return dateStr < props.min;
}

const calendarDays = computed(() => {
  const days = []
  const year = calendarYear.value
  const month = calendarMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  for (let i = firstDay - 1; i >= 0; i--) {
    const dateStr = `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, "0")}-${String(daysInPrevMonth - i).padStart(2, "0")}`
    days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, dateStr, disabled: isDateDisabled(dateStr) })
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
    days.push({ day: i, isCurrentMonth: true, dateStr, disabled: isDateDisabled(dateStr) })
  }
  
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const dateStr = `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, "0")}-${String(i).padStart(2, "0")}`
    days.push({ day: i, isCurrentMonth: false, dateStr, disabled: isDateDisabled(dateStr) })
  }
  
  return days
})

const prevMonth = () => {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11
    calendarYear.value--
  } else {
    calendarMonth.value--
  }
}

const nextMonth = () => {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0
    calendarYear.value++
  } else {
    calendarMonth.value++
  }
}

const selectDate = (dateStr: string, disabled: boolean) => {
  if (disabled) return;
  emit('update:modelValue', dateStr)
  closeCalendar()
}

const setTodayAction = () => {
  const todayStr = getLocalDateString()
  if (!isDateDisabled(todayStr)) {
    emit('update:modelValue', todayStr)
    closeCalendar()
  }
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return props.placeholder
  const [y, m, d] = dateStr.split("-")
  return `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1]} ${parseInt(y, 10) + 543}`
}
</script>

<template>
  <div class="relative z-50">
    <!-- Click outside overlay -->
    <div v-if="isOpen" @click="closeCalendar" class="fixed inset-0 z-40 cursor-default"></div>

    <!-- Trigger (Compact) -->
    <div 
      v-if="variant === 'compact'" 
      @click="openCalendar" 
      class="relative z-50 flex items-center gap-2 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl px-3 py-2 hover:bg-white hover:border-black/[0.12] transition-all cursor-pointer"
    >
      <span v-if="label" class="text-xs font-medium text-[#666666]">{{ label }}</span>
      <div class="text-xs font-medium text-[#171717] min-w-[80px]" :class="{'text-gray-400': !modelValue}">{{ formatDisplayDate(modelValue) }}</div>
    </div>

    <!-- Trigger (Input) -->
    <div 
      v-else 
      @click="openCalendar" 
      class="relative z-50 flex items-center h-11 w-full rounded-xl border border-black/10 bg-white/80 px-4 text-[14px] font-medium transition cursor-pointer hover:bg-white hover:border-[#171717]/30"
      :class="[isOpen ? 'border-[#171717]/30 bg-white ring-2 ring-[#171717]/10' : '', !modelValue ? 'text-[#666666]' : 'text-[#171717]']"
    >
      {{ formatDisplayDate(modelValue) }}
      <div class="ml-auto flex items-center justify-center text-black/40">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
      </div>
    </div>
    
    <!-- Calendar Dropdown -->
    <div v-if="isOpen" class="absolute top-full left-0 mt-2 bg-white border border-black/[0.06] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-4 w-[280px] z-50">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <button @click.stop="prevMonth" class="p-1 hover:bg-[#F7F7F5] rounded-full transition-colors text-[#171717]" aria-label="Previous month">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div class="text-[13px] font-semibold text-[#171717]">{{ monthNames[calendarMonth] }} {{ calendarYear + 543 }}</div>
        <button @click.stop="nextMonth" class="p-1 hover:bg-[#F7F7F5] rounded-full transition-colors text-[#171717]" aria-label="Next month">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <!-- Days of Week -->
      <div class="grid grid-cols-7 gap-1 mb-2 text-center">
        <div v-for="d in daysOfWeek" :key="d" class="text-[11px] font-semibold text-[#666666]">{{ d }}</div>
      </div>
      <!-- Days -->
      <div class="grid grid-cols-7 gap-1">
        <button 
          v-for="d in calendarDays" 
          :key="d.dateStr" 
          @click.stop="selectDate(d.dateStr, d.disabled)" 
          class="h-8 rounded-full flex items-center justify-center text-[12px] font-medium transition-all" 
          :class="{
            'bg-[#171717] text-white': modelValue === d.dateStr, 
            'text-[#171717] hover:bg-[#F7F7F5]': modelValue !== d.dateStr && d.isCurrentMonth && !d.disabled, 
            'text-[#9A9A95] hover:bg-[#F7F7F5]': !d.isCurrentMonth && !d.disabled, 
            'border border-black/[0.06]': getLocalDateString() === d.dateStr && modelValue !== d.dateStr,
            'opacity-30 cursor-not-allowed': d.disabled
          }"
          :disabled="d.disabled"
        >
          {{ d.day }}
        </button>
      </div>
      <!-- Footer Action -->
      <div v-if="!hideTodayButton" class="mt-4 pt-3 border-t border-black/[0.06] text-center">
        <button 
          @click.stop="setTodayAction" 
          :disabled="isDateDisabled(getLocalDateString())"
          class="text-[12px] font-medium px-4 py-1.5 rounded-lg transition-colors border border-transparent"
          :class="isDateDisabled(getLocalDateString()) ? 'text-[#9A9A95] cursor-not-allowed' : 'text-[#171717] hover:bg-[#F7F7F5] hover:border-black/[0.06]'"
        >
          วันนี้
        </button>
      </div>
    </div>
  </div>
</template>
