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
  <div class="customer-step steppackage p-5 sm:p-8">
    <div class="mb-6">
      <h2 class="text-[20px] font-semibold leading-tight text-[#172c3b]">
        เลือกแพ็กเกจ
      </h2>
      <p class="mt-1 text-[13px] font-medium text-[#52616a]">
        เลือกแพ็กเกจที่เหมาะกับความต้องการของคุณ
      </p>
    </div>

    <div
      v-if="packages.length === 0"
      class="rounded-[12px] border border-dashed border-[#172c3b]/15 bg-[#e5e9e1]/50 p-8 text-center"
    >
      <p class="text-[14px] font-semibold text-[#172c3b]">
        ยังไม่มีแพ็กเกจที่เปิดใช้งาน
      </p>
      <p class="mt-1 text-[13px] font-medium text-[#52616a]">
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
        class="customer-option group relative flex min-h-[340px] flex-col rounded-[12px] border bg-[#fcf9f3] p-6 text-left transition duration-200 hover:-translate-y-px hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        :class="
          modelValue === pkg.packageId
            ? 'border-[#172c3b] bg-[#fcf9f3] ring-1 ring-[#172c3b]'
            : 'border-[#172c3b]/10 hover:border-[#172c3b]/15 hover:bg-[#fcf9f3]'
        "
        :aria-pressed="modelValue === pkg.packageId"
        type="button"
        @click="$emit('update:modelValue', pkg.packageId)"
      >
        <div
          v-if="modelValue === pkg.packageId"
          class="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#172c3b] text-white"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div v-else class="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#172c3b]/10 bg-transparent transition-colors group-hover:border-[#172c3b]/15"></div>

        <h3 class="mb-1.5 pr-8 text-[14px] font-bold text-[#172c3b]">
          {{ pkg.packageName }}
        </h3>
        
        <div class="mb-5">
          <span class="text-[24px] font-bold text-[#172c3b]">{{ formatPrice(pkg.packagePrice) }}</span>
        </div>

        <ul class="flex-1 space-y-3 text-[13px] font-medium text-[#52616a]">
          <li class="flex items-start gap-2.5">
            <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#172c3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{ pkg.packageImageCount }} ภาพ
          </li>
          <li class="flex items-start gap-2.5">
            <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#172c3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            ความละเอียด {{ pkg.packageResolution }}
          </li>
          <li class="flex items-start gap-2.5">
            <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#172c3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            ส่งงานภายใน {{ pkg.packageDeliveryDays }} วัน
          </li>
          <li v-if="pkg.packageUrgentPrice" class="flex items-start gap-2.5">
            <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#172c3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>เร่งด่วน +{{ formatPrice(pkg.packageUrgentPrice) }}</span>
          </li>
          <li class="flex items-start gap-2.5">
            <svg class="mt-0.5 h-4 w-4 shrink-0 text-[#172c3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"/></svg>
            <span>ลด {{ pkg.packageGalleryDiscount }}% หากโชว์ Gallery</span>
          </li>
        </ul>

        <p v-if="pkg.packageDescription" class="mt-5 border-t border-[#172c3b]/10 pt-4 text-[12px] font-medium leading-relaxed text-[#69777f]">
          {{ pkg.packageDescription }}
        </p>
      </button>
    </div>
  </div>
</template>
