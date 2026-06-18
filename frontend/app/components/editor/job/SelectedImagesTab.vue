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
    <div class="border-b border-slate-50 pb-2.5">
      <h3 class="text-base font-bold text-slate-800">🏆 ภาพผลงานขั้นสุดท้ายที่ลูกค้าคัดเลือก (Selected Final Images)</h3>
      <p class="text-xs text-slate-400 mt-0.5">ภาพผลงานชิ้นที่ลูกค้าเลือกเพื่อรับไฟล์ขนาดจริงหลังจากชำระเงินส่วนที่เหลือเรียบร้อยแล้ว</p>
    </div>

    <div v-if="selectedImages.length === 0" class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-sm">
      ⏳ ลูกค้ายังไม่ได้คัดเลือกภาพผลงานขั้นสุดท้ายในขณะนี้
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div v-for="img in selectedImages" :key="img.orderImageId" class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col group">
        <div class="aspect-[4/3] bg-slate-100 overflow-hidden relative">
          <img :src="img.imageUrl" class="w-full h-full object-cover" />
          <span class="absolute top-2 left-2 bg-green-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
            CLIENT SELECTED
          </span>
        </div>
        <div class="p-4 text-xs space-y-2 bg-slate-50/20">
          <div v-if="img.aiEngine" class="flex justify-between">
            <span class="text-slate-400 font-bold">Engine:</span>
            <span class="text-slate-700 font-semibold">{{ img.aiEngine }}</span>
          </div>
          <div v-if="img.positivePrompt">
            <span class="text-slate-400 font-bold">Prompt:</span>
            <p class="text-slate-600 bg-white p-2 rounded border mt-0.5 line-clamp-3 font-mono leading-relaxed select-all">{{ img.positivePrompt }}</p>
          </div>
          <div class="pt-2">
            <a
              :href="img.imageUrl"
              target="_blank"
              class="w-full inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-center shadow-sm"
            >
              📥 เปิดดู/ดาวน์โหลดขนาดเต็ม
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
