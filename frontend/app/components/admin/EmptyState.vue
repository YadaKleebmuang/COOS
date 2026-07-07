<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  icon?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
    <!-- Icon -->
    <div class="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
      <svg v-if="icon" class="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="icon" />
      </svg>
      <svg v-else class="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>

    <h3 class="text-sm font-semibold text-gray-900 mb-1">
      {{ title ?? 'ไม่พบข้อมูล' }}
    </h3>
    <p class="text-xs text-gray-400 max-w-xs">
      {{ description ?? 'ไม่มีรายการที่ตรงกับเงื่อนไขที่เลือก' }}
    </p>

    <!-- Optional action slot -->
    <div class="mt-4">
      <slot />
    </div>
  </div>
</template>
