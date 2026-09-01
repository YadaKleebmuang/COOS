<script setup lang="ts">
import type { WorkType } from '~/types/order.types'

defineProps<{
  workTypes: WorkType[]
  modelValue: number | null
}>()

defineEmits<{
  (e: 'update:modelValue', id: number): void
}>()
</script>

<template>
  <div class="p-6 sm:p-8">
    <div class="mb-6">
      <h2 class="text-[20px] font-semibold leading-tight text-[#171717]">
        เลือกประเภทงาน
      </h2>
      <p class="mt-1 text-[13px] font-medium text-[#666666]">
        เลือกประเภทภาพที่ต้องการสั่งทำ
      </p>
    </div>

    <div
      v-if="workTypes.length === 0"
      class="rounded-[16px] border border-dashed border-black/10 bg-[#f8f8f8]/50 p-8 text-center"
    >
      <p class="text-[14px] font-semibold text-[#171717]">
        ยังไม่มีประเภทงานที่เปิดให้สั่งทำ
      </p>
      <p class="mt-1 text-[13px] font-medium text-[#666666]">
        กรุณาลองใหม่อีกครั้งหรือติดต่อทีมงาน COOS
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <button
        v-for="wt in workTypes"
        :key="wt.workTypeId"
        class="group relative min-h-[140px] rounded-[16px] border bg-white/80 p-5 text-left transition duration-200 hover:-translate-y-px hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        :class="
          modelValue === wt.workTypeId
            ? 'border-[#171717] bg-white ring-1 ring-[#171717]'
            : 'border-black/5 hover:border-black/10 hover:bg-white'
        "
        type="button"
        @click="$emit('update:modelValue', wt.workTypeId)"
      >
        <div
          v-if="modelValue === wt.workTypeId"
          class="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#171717] text-white"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div v-else class="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black/5 bg-transparent transition-colors group-hover:border-black/10"></div>

        <h3 class="pr-8 text-[15px] font-bold text-[#171717] transition-colors group-hover:text-black">
          {{ wt.workTypeName }}
        </h3>
        <p class="mt-1.5 text-[13px] font-medium leading-relaxed text-[#666666]">
          {{ wt.workTypeDescription || 'เลือกประเภทงานนี้เพื่อไปขั้นตอนเลือกแพ็กเกจ' }}
        </p>
      </button>
    </div>
  </div>
</template>
