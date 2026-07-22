<script setup lang="ts">
import { computed } from "vue"
import type { OrderDetail } from "~/types/order.types"

const props = defineProps<{
  order: OrderDetail
}>()

const sourceImages = computed(() => {
  if (!props.order.images) return []
  return props.order.images.filter(img => img.imageType === "source")
})
</script>

<template>
  <div class="space-y-6">
    <!-- Section Header -->
    <div class="flex items-center justify-between border-b border-gray-100 pb-3">
      <div>
        <h3 class="text-base font-bold text-gray-800">รูปภาพอ้างอิงต้นฉบับ (Reference Images)</h3>
        <p class="text-xs text-gray-400 mt-0.5">ใช้รูปภาพเหล่านี้อ้างอิงในการสร้างภาพ AI</p>
      </div>
      <span v-if="sourceImages.length > 0" class="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
        {{ sourceImages.length }} รูป
      </span>
    </div>

    <!-- Empty State -->
    <div v-if="sourceImages.length === 0" class="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
      <div class="w-14 h-14 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-3 shadow-sm">
        <svg class="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
      </div>
      <p class="text-sm font-semibold text-gray-500">ไม่มีรูปภาพต้นฉบับในคำสั่งงานนี้</p>
      <p class="text-xs text-gray-400 mt-1">ลูกค้าไม่ได้อัปโหลดรูปอ้างอิงเพิ่มเติม</p>
    </div>

    <!-- Image Grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      <div
        v-for="img in sourceImages"
        :key="img.orderImageId"
        class="group relative aspect-square rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
      >
        <img :src="img.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <!-- Hover Overlay -->
        <div class="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
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
    </div>
  </div>
</template>



