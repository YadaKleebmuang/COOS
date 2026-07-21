<script setup lang="ts">
import type { Package } from "~/types/order.types"

defineProps<{
  packages: Package[]
  modelValue: number | null
}>()

defineEmits<{
  (e: "update:modelValue", id: number): void
}>()

const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="p-6 sm:p-8">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-1">เลือกแพ็กเกจ</h2>
      <p class="text-gray-500 text-sm">เลือกแพ็กเกจที่เหมาะกับความต้องการของคุณ</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <button
        v-for="pkg in packages"
        :key="pkg.packageId"
        @click="$emit('update:modelValue', pkg.packageId)"
        class="relative p-6 rounded-2xl border text-left transition-all duration-200 hover:shadow-md group flex flex-col"
        :class="
          modelValue === pkg.packageId
            ? 'border-gray-900 bg-slate-50 ring-1 ring-gray-900 shadow-sm'
            : 'border-slate-200 hover:border-gray-400 bg-white shadow-sm'
        "
      >
        <!-- Check -->
        <div
          v-if="modelValue === pkg.packageId"
          class="absolute top-4 right-4 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center transition-transform"
        >
          <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
        </div>

        <!-- Package name -->
        <h3 class="font-bold text-lg text-gray-900 mb-2">{{ pkg.packageName }}</h3>

        <!-- Price -->
        <div class="mb-4">
          <span class="text-3xl font-bold text-gray-900">฿{{ formatPrice(pkg.packagePrice) }}</span>
        </div>

        <!-- Details -->
        <ul class="space-y-2.5 text-sm text-gray-600 flex-1">
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{ pkg.packageImageCount }} ภาพ
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            ความละเอียด {{ pkg.packageResolution }}
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            ส่งงานภายใน {{ pkg.packageDeliveryDays }} วัน
          </li>
          <li v-if="pkg.packageUrgentPrice" class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>เร่งด่วน +฿{{ formatPrice(pkg.packageUrgentPrice) }}</span>
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"/></svg>
            <span>ลด {{ pkg.packageGalleryDiscount }}% หากโชว์ Gallery</span>
          </li>
        </ul>

        <p v-if="pkg.packageDescription" class="text-xs text-gray-400 mt-4 pt-4 border-t border-slate-100 leading-relaxed">{{ pkg.packageDescription }}</p>
      </button>
    </div>
  </div>
</template>
