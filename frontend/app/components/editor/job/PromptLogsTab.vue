<script setup lang="ts">
import { computed } from "vue"
import type { OrderDetail } from "~/types/order.types"

const props = defineProps<{
  order: OrderDetail
}>()

const imageLogs = computed(() => {
  if (!props.order.images) return []
  return props.order.images.filter(img => img.positivePrompt || img.aiEngine)
})
</script>

<template>
  <div class="space-y-6">
    <div class="border-b border-slate-50 pb-2.5">
      <h3 class="text-base font-bold text-slate-800">📜 บันทึกพร้อมท์และพารามิเตอร์ (AI Prompt Logs)</h3>
      <p class="text-xs text-slate-400 mt-0.5">พารามิเตอร์เชิงลึกที่ใช้ป้อนให้กับระบบประมวลผลสำหรับงานภาพแต่ละภาพในออเดอร์นี้</p>
    </div>

    <div v-if="imageLogs.length === 0" class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-sm">
      ไม่มีข้อมูลบันทึก Prompt ในออเดอร์นี้
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="img in imageLogs"
        :key="img.orderImageId"
        class="border border-slate-100 rounded-2xl p-5 bg-slate-50/30 flex flex-col md:flex-row gap-5"
      >
        <!-- Mini preview image -->
        <div class="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0 mx-auto md:mx-0">
          <img :src="img.imageUrl" class="w-full h-full object-cover" />
        </div>

        <!-- Meta Params List -->
        <div class="flex-grow space-y-3 text-xs">
          <div class="flex flex-wrap gap-x-4 gap-y-1.5 border-b border-slate-100 pb-2">
            <div>
              <span class="text-slate-400 font-bold block">ENGINE</span>
              <span class="text-slate-700 font-bold">{{ img.aiEngine || "-" }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold block">CFG SCALE</span>
              <span class="text-slate-700 font-bold">{{ img.cfgScale ?? "-" }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold block">STEPS</span>
              <span class="text-slate-700 font-bold">{{ img.steps ?? "-" }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold block">SEED</span>
              <span class="text-slate-700 font-bold font-mono">{{ img.seed ?? "-" }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-bold block">IMAGE TYPE</span>
              <span class="text-slate-700 font-bold uppercase">{{ img.imageType }}</span>
            </div>
          </div>

          <div v-if="img.positivePrompt">
            <span class="text-slate-400 font-bold block mb-1">POSITIVE PROMPT</span>
            <div class="bg-white p-2.5 rounded-xl border border-slate-100 text-slate-600 font-mono leading-relaxed select-all">
              {{ img.positivePrompt }}
            </div>
          </div>

          <div v-if="img.negativePrompt">
            <span class="text-slate-400 font-bold block mb-1">NEGATIVE PROMPT</span>
            <div class="bg-white p-2.5 rounded-xl border border-slate-100 text-slate-600 font-mono leading-relaxed select-all">
              {{ img.negativePrompt }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
