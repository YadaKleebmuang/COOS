<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav class="flex items-center gap-1.5 text-sm">
    <template v-for="(item, index) in items" :key="index">
      <!-- Separator -->
      <svg
        v-if="index > 0"
        class="w-3.5 h-3.5 text-gray-300 flex-shrink-0"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>

      <!-- Clickable link -->
      <NuxtLink
        v-if="item.to"
        :to="item.to"
        class="text-gray-400 hover:text-gray-700 transition-colors font-medium"
      >
        {{ item.label }}
      </NuxtLink>

      <!-- Current page (no link) -->
      <span
        v-else
        class="text-gray-700 font-medium"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>
