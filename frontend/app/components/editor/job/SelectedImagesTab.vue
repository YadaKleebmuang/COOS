<script setup lang="ts">
import { computed } from "vue"
import type { OrderDetail } from "~/types/order.types"

const props = defineProps<{
  order: OrderDetail
}>()

const selectedImages = computed(() => {
  if (!props.order.images) return []
  return props.order.images.filter(img => img.imageType === "selected_final")
})
</script>

<template>
  <div class="space-y-6">
    <!-- Section Header -->
    <div class="flex items-center justify-between border-b border-gray-100 pb-3">
      <div>
        <h3 class="text-base font-bold text-gray-800">🏆 ภาพผลงานขั้นสุดท้ายที่ลูกค้าคัดเลือก</h3>
        <p class="text-xs text-gray-400 mt-0.5">ภาพที่ลูกค้าเลือกรับเป็นไฟล์ขนาดจริงหลังชำระเงินเรียบร้อย</p>
      </div>
      <span v-if="selectedImages.length > 0" class="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-3 py-1 rounded-full">
        {{ selectedImages.length }} รูป
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="selectedImages.length === 0" class="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
      <div class="w-14 h-14 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-center mb-3 shadow-sm">
        <svg class="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <p class="text-sm font-semibold text-gray-500">ลูกค้ายังไม่ได้คัดเลือกภาพขั้นสุดท้าย</p>
      <p class="text-xs text-gray-400 mt-1">รอให้ลูกค้าเลือกจากรูป AI Generated ที่ส่งไป</p>
    </div>

    <!-- Image Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      <div
        v-for="img in selectedImages"
        :key="img.orderImageId"
        class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col group"
      >
        <!-- Image Thumbnail -->
        <div class="aspect-[4/3] bg-gray-100 overflow-hidden relative">
          <img :src="img.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <!-- Selected Badge -->
          <span class="absolute top-2 left-2 bg-green-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow tracking-wider">
            CLIENT SELECTED ✓
          </span>
          <!-- Hover Overlay -->
          <div class="absolute inset-0 bg-gray-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
            <a
              :href="img.imageUrl"
              target="_blank"
              class="bg-white/95 hover:bg-white text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow flex items-center gap-1.5 transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
              </svg>
              เปิดขนาดเต็ม
            </a>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-4 flex-1 text-xs space-y-2 bg-gray-50/30 flex flex-col">
          <!-- Engine Badge -->
          <div v-if="img.aiEngine" class="flex justify-between items-center">
            <span class="text-gray-400 font-bold">Engine</span>
            <span class="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-lg border border-gray-200">{{ img.aiEngine }}</span>
          </div>
          <!-- Prompt Preview -->
          <div v-if="img.positivePrompt" class="flex-1">
            <span class="text-gray-400 font-bold block mb-0.5">Prompt</span>
            <p class="text-gray-600 bg-white p-2 rounded-lg border border-gray-100 font-mono line-clamp-2 leading-relaxed select-all">{{ img.positivePrompt }}</p>
          </div>
          <!-- Download Button -->
          <a
            :href="img.imageUrl"
            target="_blank"
            class="w-full flex items-center justify-center gap-1.5 bg-gray-900 hover:bg-gray-700 text-white font-bold py-2 rounded-xl text-center shadow-sm transition-colors mt-auto"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            ดูภาพ / ดาวน์โหลด
          </a>
        </div>
      </div>
    </div>
  </div>
</template>



