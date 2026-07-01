<script setup lang="ts">
export interface FilterOption {
  key: string
  label: string
  count?: number
}

const props = defineProps<{
  filters: FilterOption[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()
</script>

<template>
  <div class="flex items-center gap-1.5 flex-wrap">
    <button
      v-for="filter in filters"
      :key="filter.key"
      @click="emit('update:modelValue', filter.key)"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border"
      :class="modelValue === filter.key
        ? 'bg-gray-900 text-white border-gray-900'
        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-900'"
    >
      {{ filter.label }}
      <span
        v-if="filter.count !== undefined"
        class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold"
        :class="modelValue === filter.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'"
      >
        {{ filter.count }}
      </span>
    </button>
  </div>
</template>
