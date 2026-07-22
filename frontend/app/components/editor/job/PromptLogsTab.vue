<script setup lang="ts">
import { computed, ref } from "vue"
import type { OrderDetail } from "~/types/order.types"

const props = defineProps<{
  order: OrderDetail
}>()

const imageLogs = computed(() => {
  if (!props.order.images) return []
  return props.order.images.filter(img => img.positivePrompt || img.aiEngine)
})

// Copy to clipboard
const copiedKey = ref<string | null>(null)
const copyPrompt = async (text: string, key: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedKey.value = key
    setTimeout(() => (copiedKey.value = null), 2000)
  } catch {}
}
</script>

<template>
  <div class="space-y-6">
    <!-- Section Header -->
    <div class="border-b border-gray-100 pb-3">
      <h3 class="text-base font-bold text-gray-800">บันทึกพร้อมท์และพารามิเตอร์ (AI Prompt Logs)</h3>
      <p class="text-xs text-gray-400 mt-0.5">พารามิเตอร์ที่ใช้ป้อนให้กับระบบ AI สำหรับแต่ละภาพในออเดอร์นี้</p>
    </div>

    <!-- Empty State -->
    <div v-if="imageLogs.length === 0" class="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
      <div class="w-14 h-14 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-3 shadow-sm">
        <svg class="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
      </div>
      <p class="text-sm font-semibold text-gray-500">ไม่มีข้อมูลบันทึก Prompt ในออเดอร์นี้</p>
    </div>

    <!-- Prompt Log Cards -->
    <div v-else class="space-y-4">
      <div
        v-for="img in imageLogs"
        :key="img.orderImageId"
        class="border border-gray-100 rounded-xl p-5 bg-gray-50/30 flex flex-col md:flex-row gap-5"
      >
        <!-- Mini Image Preview -->
        <div class="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0 mx-auto md:mx-0 shadow-sm">
          <img :src="img.imageUrl" class="w-full h-full object-cover" />
        </div>

        <!-- Params & Prompts -->
        <div class="flex-grow space-y-3 text-xs min-w-0">
          <!-- Parameter Chips -->
          <div class="flex flex-wrap gap-2 border-b border-gray-100 pb-2.5">
            <span v-if="img.aiEngine" class="bg-gray-100 text-gray-700 border border-gray-200 font-bold px-2.5 py-1 rounded-lg">
              Engine: {{ img.aiEngine }}
            </span>
            <span v-if="img.cfgScale != null" class="bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-lg">
              CFG: {{ img.cfgScale }}
            </span>
            <span v-if="img.steps != null" class="bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-lg">
              Steps: {{ img.steps }}
            </span>
            <span v-if="img.seed != null" class="bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-lg font-mono">
              Seed: {{ img.seed }}
            </span>
            <span class="bg-gray-100 text-gray-500 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
              {{ img.imageType }}
            </span>
          </div>

          <!-- Positive Prompt -->
          <div v-if="img.positivePrompt">
            <div class="flex items-center justify-between mb-1">
              <span class="text-gray-400 font-bold uppercase tracking-wider">Positive Prompt</span>
              <button
                @click="copyPrompt(img.positivePrompt, `pos-${img.orderImageId}`)"
                class="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors"
                :class="copiedKey === `pos-${img.orderImageId}`
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-gray-700'"
              >
                <svg v-if="copiedKey !== `pos-${img.orderImageId}`" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                {{ copiedKey === `pos-${img.orderImageId}` ? "คัดลอกแล้ว" : "คัดลอก" }}
              </button>
            </div>
            <div class="bg-white p-3 rounded-xl border border-gray-100 text-gray-600 font-mono leading-relaxed select-all break-all">
              {{ img.positivePrompt }}
            </div>
          </div>

          <!-- Negative Prompt -->
          <div v-if="img.negativePrompt">
            <div class="flex items-center justify-between mb-1">
              <span class="text-gray-400 font-bold uppercase tracking-wider">Negative Prompt</span>
              <button
                @click="copyPrompt(img.negativePrompt, `neg-${img.orderImageId}`)"
                class="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors"
                :class="copiedKey === `neg-${img.orderImageId}`
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-gray-700'"
              >
                <svg v-if="copiedKey !== `neg-${img.orderImageId}`" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                {{ copiedKey === `neg-${img.orderImageId}` ? "คัดลอกแล้ว" : "คัดลอก" }}
              </button>
            </div>
            <div class="bg-white p-3 rounded-xl border border-red-50 text-gray-600 font-mono leading-relaxed select-all break-all">
              {{ img.negativePrompt }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



