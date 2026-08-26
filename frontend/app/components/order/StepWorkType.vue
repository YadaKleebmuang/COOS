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
      <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
        เลือกประเภทงาน
      </h2>
      <p class="mt-1 text-sm leading-[1.6] text-[#666666]">
        เลือกประเภทภาพที่ต้องการสั่งทำ
      </p>
    </div>

    <div
      v-if="workTypes.length === 0"
      class="rounded-[20px] border border-dashed border-black/[0.10] bg-[#F3F3F1] p-8 text-center"
    >
      <p class="text-sm font-semibold text-[#171717]">
        ยังไม่มีประเภทงานที่เปิดให้สั่งทำ
      </p>
      <p class="mt-1 text-sm text-[#666666]">
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
        class="group relative min-h-[148px] rounded-[20px] border bg-white p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25"
        :class="
          modelValue === wt.workTypeId
            ? 'border-[#171717] bg-[#F3F3F1] ring-1 ring-[#171717]'
            : 'border-black/[0.06] hover:border-black/[0.10]'
        "
        type="button"
        @click="$emit('update:modelValue', wt.workTypeId)"
      >
        <!-- Check icon -->
        <div
          v-if="modelValue === wt.workTypeId"
          class="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#171717] text-white transition-transform"
        >
          <svg
            class="w-3.5 h-3.5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="3"
            d="M5 13l4 4L19 7"
          /></svg>
        </div>

        <h3 class="pr-8 text-base font-semibold leading-[1.45] text-[#171717]">
          {{ wt.workTypeName }}
        </h3>
        <p
          v-if="wt.workTypeDescription"
          class="mt-2 text-sm leading-[1.6] text-[#666666]"
        >
          {{ wt.workTypeDescription }}
        </p>
        <p
          v-else
          class="mt-2 text-sm leading-[1.6] text-[#929292]"
        >
          เลือกประเภทงานนี้เพื่อไปขั้นตอนเลือกแพ็กเกจ
        </p>
      </button>
    </div>
  </div>
</template>
