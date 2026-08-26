<script setup lang="ts">
import type { Package } from '~/types/order.types'

defineProps<{
  packages: Package[]
  modelValue: number | null
}>()

defineEmits<{
  (e: 'update:modelValue', id: number): void
}>()

const formatPrice = (n: number) =>
  Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="p-6 sm:p-8">
    <div class="mb-6">
      <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
        เลือกแพ็กเกจ
      </h2>
      <p class="mt-1 text-sm leading-[1.6] text-[#666666]">
        เลือกแพ็กเกจที่เหมาะกับความต้องการของคุณ
      </p>
    </div>

    <div
      v-if="packages.length === 0"
      class="rounded-[20px] border border-dashed border-black/[0.10] bg-[#F3F3F1] p-8 text-center"
    >
      <p class="text-sm font-semibold text-[#171717]">
        ยังไม่มีแพ็กเกจที่เปิดใช้งาน
      </p>
      <p class="mt-1 text-sm text-[#666666]">
        กรุณาย้อนกลับหรือติดต่อทีมงาน COOS
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-5 md:grid-cols-3"
    >
      <button
        v-for="pkg in packages"
        :key="pkg.packageId"
        class="group relative flex min-h-[340px] flex-col rounded-[20px] border bg-white p-5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25"
        :class="
          modelValue === pkg.packageId
            ? 'border-[#171717] bg-[#F3F3F1] ring-1 ring-[#171717]'
            : 'border-black/[0.06] hover:border-black/[0.10]'
        "
        type="button"
        @click="$emit('update:modelValue', pkg.packageId)"
      >
        <!-- Check -->
        <div
          v-if="modelValue === pkg.packageId"
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

        <!-- Package name -->
        <h3 class="mb-2 pr-8 text-base font-semibold leading-[1.45] text-[#171717]">
          {{ pkg.packageName }}
        </h3>

        <!-- Price -->
        <div class="mb-4">
          <span class="text-[26px] font-semibold leading-none text-[#171717]">฿{{ formatPrice(pkg.packagePrice) }}</span>
        </div>

        <!-- Details -->
        <ul class="flex-1 space-y-2.5 text-sm leading-[1.6] text-[#666666]">
          <li class="flex items-center gap-2">
            <svg
              class="h-4 w-4 flex-shrink-0 text-[#929292]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            /></svg>
            {{ pkg.packageImageCount }} ภาพ
          </li>
          <li class="flex items-center gap-2">
            <svg
              class="h-4 w-4 flex-shrink-0 text-[#929292]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            /></svg>
            ความละเอียด {{ pkg.packageResolution }}
          </li>
          <li class="flex items-center gap-2">
            <svg
              class="h-4 w-4 flex-shrink-0 text-[#929292]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            /></svg>
            ส่งงานภายใน {{ pkg.packageDeliveryDays }} วัน
          </li>
          <li
            v-if="pkg.packageUrgentPrice"
            class="flex items-center gap-2"
          >
            <svg
              class="h-4 w-4 flex-shrink-0 text-[#929292]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            /></svg>
            <span>เร่งด่วน +฿{{ formatPrice(pkg.packageUrgentPrice) }}</span>
          </li>
          <li class="flex items-center gap-2">
            <svg
              class="h-4 w-4 flex-shrink-0 text-[#929292]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"
            /></svg>
            <span>ลด {{ pkg.packageGalleryDiscount }}% หากโชว์ Gallery</span>
          </li>
        </ul>

        <p
          v-if="pkg.packageDescription"
          class="mt-4 border-t border-black/[0.06] pt-4 text-xs leading-[1.6] text-[#929292]"
        >
          {{ pkg.packageDescription }}
        </p>
      </button>
    </div>
  </div>
</template>
