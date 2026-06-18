<script setup lang="ts">
interface TabItem {
  key: string
  label: string
}

defineProps<{
  tabs: TabItem[]
}>()

const active = defineModel<string>("active")
</script>

<template>
  <div class="bg-white border rounded-2xl p-1.5 flex gap-1 shadow-sm overflow-x-auto">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="active = tab.key"
      class="px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200"
      :class="
        active === tab.key
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
          : 'text-slate-600 hover:bg-slate-50'
      "
    >
      {{ tab.label }}
    </button>
  </div>
</template>
