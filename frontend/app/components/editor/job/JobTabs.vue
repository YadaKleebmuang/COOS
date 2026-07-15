<script setup lang="ts">
interface TabItem {
  key: string
  label: string
}

defineProps<{
  tabs: TabItem[]
}>()

const active = defineModel<string>("active")

// SVG path map ต่อ tab key
const tabIconPaths: Record<string, string> = {
  overview:  "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  sources:   "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  generated: "M13 10V3L4 14h7v7l9-11h-7z",
  selected:  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  prompts:   "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  history:   "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
}
</script>

<template>
  <div class="bg-white border border-gray-100 rounded-xl p-1.5 flex gap-1 shadow-sm overflow-x-auto">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="active = tab.key"
      class="px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5"
      :class="
        active === tab.key
          ? 'bg-gray-900 text-white shadow-md shadow-gray-200'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
      "
    >
      <svg
        v-if="tabIconPaths[tab.key]"
        class="w-3.5 h-3.5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tabIconPaths[tab.key]" />
      </svg>
      {{ tab.label }}
    </button>
  </div>
</template>



