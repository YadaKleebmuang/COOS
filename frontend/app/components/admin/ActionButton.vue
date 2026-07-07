<script setup lang="ts">
defineProps<{
  variant?: "primary" | "secondary" | "danger" | "ghost"
  size?: "sm" | "md" | "lg"
  icon?: string
  loading?: boolean
  disabled?: boolean
}>()

defineEmits<{
  (e: "click"): void
}>()

const variantClasses: Record<string, string> = {
  primary: "bg-gray-900 text-white border-gray-900 hover:bg-gray-700 hover:border-gray-700",
  secondary: "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300",
  danger: "bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300",
  ghost: "bg-transparent text-gray-600 border-transparent hover:bg-gray-100"
}

const sizeClasses: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-2.5 text-sm gap-2"
}
</script>

<template>
  <button
    class="inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      variantClasses[variant ?? 'secondary'],
      sizeClasses[size ?? 'md']
    ]"
    :disabled="disabled || loading"
    @click="$emit('click')"
  >
    <!-- Loading spinner -->
    <svg v-if="loading" class="animate-spin w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>

    <!-- Icon -->
    <svg v-else-if="icon" class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="icon" />
    </svg>

    <!-- Label slot -->
    <slot />
  </button>
</template>
