<script setup lang="ts">
import type { WorkType } from "~/types/order.types"

defineProps<{
  workTypes: WorkType[]
  modelValue: number | null
}>()

defineEmits<{
  (e: "update:modelValue", id: number): void
}>()
</script>

<template>
  <div class="p-6 sm:p-8">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-1">เลือกประเภทงาน</h2>
      <p class="text-gray-500 text-sm">เลือกประเภทภาพที่ต้องการสั่งทำ</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        v-for="wt in workTypes"
        :key="wt.workTypeId"
        @click="$emit('update:modelValue', wt.workTypeId)"
        class="relative p-6 rounded-2xl border text-left transition-all duration-200 group"
        :class="
          modelValue === wt.workTypeId
            ? 'border-gray-900 bg-slate-50 ring-1 ring-gray-900 shadow-sm'
            : 'border-slate-200 hover:border-gray-400 bg-white shadow-sm'
        "
      >
        <!-- Check icon -->
        <div
          v-if="modelValue === wt.workTypeId"
          class="absolute top-4 right-4 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center transition-transform"
        >
          <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
        </div>

        <h3 class="font-bold text-gray-900 text-lg">{{ wt.workTypeName }}</h3>
        <p v-if="wt.workTypeDescription" class="text-gray-500 text-sm mt-1 leading-relaxed">{{ wt.workTypeDescription }}</p>
      </button>
    </div>
  </div>
</template>
