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
    <div class="border-b border-slate-50 pb-2.5">
      <h3 class="text-base font-bold text-slate-800">📸 รูปภาพอ้างอิงและรูปภาพต้นฉบับ (Reference Images)</h3>
      <p class="text-xs text-slate-400 mt-0.5">ใช้รูปภาพเหล่านี้อ้างอิงในการสั่งทำรูปภาพ หรือนำภาพเหล้านี้ไปตกแต่งต่อในระบบ AI</p>
    </div>

    <div v-if="sourceImages.length === 0" class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-sm">
      ไม่มีการอัปโหลดรูปภาพต้นฉบับในคำสั่งงานนี้
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
      <div
        v-for="img in sourceImages"
        :key="img.orderImageId"
        class="group relative aspect-square rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden shadow-sm hover:scale-[1.02] transition-transform duration-200"
      >
        <img :src="img.imageUrl" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <a
            :href="img.imageUrl"
            target="_blank"
            class="bg-white/90 hover:bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow"
          >
            🔍 เปิดภาพขนาดใหญ่
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
