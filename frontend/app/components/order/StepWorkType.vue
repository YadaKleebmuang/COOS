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
  <div class="customer-step stepworktype p-5 sm:p-8">
    <div class="mb-6">
      <h2 class="text-[20px] font-semibold leading-tight text-[#172c3b]">
        เลือกประเภทงาน
      </h2>
      <p class="mt-1 text-[13px] font-medium text-[#52616a]">
        เลือกประเภทภาพที่ต้องการสั่งทำ
      </p>
    </div>

    <div
      v-if="workTypes.length === 0"
      class="rounded-[12px] border border-dashed border-[#172c3b]/15 bg-[#e5e9e1]/50 p-8 text-center"
    >
      <p class="text-[14px] font-semibold text-[#172c3b]">
        ยังไม่มีประเภทงานที่เปิดให้สั่งทำ
      </p>
      <p class="mt-1 text-[13px] font-medium text-[#52616a]">
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
        class="customer-option group relative min-h-[140px] rounded-[12px] border bg-[#fcf9f3] p-5 text-left transition duration-200 hover:-translate-y-px hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        :class="
          modelValue === wt.workTypeId
            ? 'border-[#172c3b] bg-[#fcf9f3] ring-1 ring-[#172c3b]'
            : 'border-[#172c3b]/10 hover:border-[#172c3b]/15 hover:bg-[#fcf9f3]'
        "
        :aria-pressed="modelValue === wt.workTypeId"
        type="button"
        @click="$emit('update:modelValue', wt.workTypeId)"
      >
        <div
          v-if="modelValue === wt.workTypeId"
          class="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#172c3b] text-white"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div v-else class="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#172c3b]/10 bg-transparent transition-colors group-hover:border-[#172c3b]/15"></div>

        <h3 class="pr-8 text-[15px] font-bold text-[#172c3b] transition-colors group-hover:text-[#172c3b]">
          {{ wt.workTypeName }}
        </h3>
        <p class="mt-1.5 text-[13px] font-medium leading-relaxed text-[#52616a]">
          {{ wt.workTypeDescription || 'เลือกประเภทงานนี้เพื่อไปขั้นตอนเลือกแพ็กเกจ' }}
        </p>
      </button>
    </div>
  </div>
</template>
