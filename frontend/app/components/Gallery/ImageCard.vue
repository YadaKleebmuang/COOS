<script setup lang="ts">
defineProps<{
  img: any
}>()

defineEmits<{
  (e: "view-details", img: any): void
}>()

const getOrderParams = (img: any) => {
  if (!img) return ""
  const params: Record<string, string> = {
    workTypeId: String(img.workTypeId)
  }
  if (img.imageTags) {
    const tags = img.imageTags.split(',').map((t: string) => t.trim().toLowerCase())
    if (tags.includes('minimal')) params.style = 'Minimal'
    else if (tags.includes('romantic')) params.style = 'Romantic'
    else if (tags.includes('classic')) params.style = 'Classic'
    else if (tags.includes('moody')) params.style = 'Moody'
    else if (tags.includes('natural')) params.style = 'Natural'
    else if (tags.includes('modern')) params.style = 'Modern'
    
    if (tags.includes('warm')) params.colorTone = 'Warm Tone'
    else if (tags.includes('blackwhite') || tags.includes('black tone') || tags.includes('blacktone')) params.colorTone = 'Black & White'
    else if (tags.includes('softtone') || tags.includes('soft')) params.colorTone = 'Soft Tone'
  }
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
}
</script>

<template>
  <div class="bg-white rounded-[2rem] border border-gray-200/70 p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full">
    <!-- Card Image with Hover overlay -->
    <div class="relative aspect-[3/4] overflow-hidden bg-slate-100 shrink-0 rounded-2xl">
      <img :src="img.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
        <a :href="img.imageUrl" target="_blank" class="bg-white/95 hover:bg-white text-slate-900 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          เปิดดูรูปภาพ
        </a>
      </div>
    </div>
    
    <!-- Card Details -->
    <div class="pt-4 flex-1 flex flex-col justify-between">
      <div>
        <span class="text-xs text-gray-400 font-medium">{{ img.workTypeName || 'ทั่วไป' }}</span>
        <h3 class="font-bold text-gray-900 text-base mt-1 group-hover:text-black transition-colors">{{ img.imageTitle || 'ไม่มีชื่อผลงาน' }}</h3>
        <p class="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">{{ img.imageDescription || 'ไม่มีคำอธิบายเพิ่มเติม' }}</p>
      </div>
      
      <div>
        <!-- Tags -->
        <div v-if="img.imageTags" class="flex flex-wrap gap-1.5 mt-3">
          <span
            v-for="tag in img.imageTags.split(',')"
            :key="tag"
            class="text-[10px] bg-gray-50 hover:bg-gray-100 text-gray-500 font-medium px-2.5 py-1 rounded-full border border-gray-100 transition"
          >
            #{{ tag.trim() }}
          </span>
        </div>

        <!-- Buttons -->
        <div class="grid grid-cols-2 gap-3 mt-4">
          <button
            @click="$emit('view-details', img)"
            class="border border-gray-200 hover:border-gray-950 text-gray-700 hover:text-gray-950 font-semibold py-2 px-3 rounded-xl text-center transition-all text-xs focus:outline-none"
          >
            ดูรายละเอียด
          </button>
          <NuxtLink
            :to="`/customer/orders/create?${getOrderParams(img)}`"
            class="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-3 rounded-xl text-center transition-colors text-xs flex items-center justify-center"
          >
            สั่งทำภาพแนวนี้
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
