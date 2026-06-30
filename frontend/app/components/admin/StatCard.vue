<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  sublabel?: string
  trend?: string
  trendUp?: boolean
  icon?: string
}>()
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-xs font-medium text-gray-500 truncate">{{ label }}</p>
        <p class="mt-2 text-2xl font-bold text-gray-900 font-number">{{ value }}</p>
        <p v-if="sublabel" class="mt-1 text-xs text-gray-400">{{ sublabel }}</p>
      </div>

      <!-- Icon slot or default -->
      <div class="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
        <slot name="icon">
          <svg v-if="icon" class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="icon" />
          </svg>
          <span v-else class="text-lg">📊</span>
        </slot>
      </div>
    </div>

    <!-- Trend indicator -->
    <div v-if="trend" class="mt-3 flex items-center gap-1.5">
      <svg
        class="w-3.5 h-3.5 flex-shrink-0"
        :class="trendUp ? 'text-green-500' : 'text-red-500'"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          :d="trendUp ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"
        />
      </svg>
      <span class="text-xs text-gray-400">{{ trend }}</span>
    </div>
  </div>
</template>
