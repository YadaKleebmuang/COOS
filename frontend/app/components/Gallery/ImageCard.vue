<script setup lang="ts">
defineProps<{
  img: any
}>()
</script>

<template>
  <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group h-full">
    <!-- Card Image with Hover overlay -->
    <div class="relative aspect-[16/10] overflow-hidden bg-slate-100 shrink-0">
      <img :src="img.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
      <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
        <a :href="img.imageUrl" target="_blank" class="bg-white/95 hover:bg-white text-slate-900 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          เปิดดูรูปภาพ
        </a>
      </div>
      <!-- Work Type Badge -->
      <span class="absolute top-4 left-4 bg-gray-900/90 text-white backdrop-blur-sm text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow">
        {{ img.workTypeName || 'General' }}
      </span>
    </div>
    
    <!-- Card Details -->
    <div class="p-6 flex-1 flex flex-col justify-between">
      <div>
        <h3 class="font-extrabold text-slate-800 text-lg group-hover:text-gray-900 transition-colors">{{ img.imageTitle || 'Untitled' }}</h3>
        <p class="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2">{{ img.imageDescription || 'ไม่มีคำอธิบายเพิ่มเติม' }}</p>
      </div>
      <!-- Tags -->
      <div v-if="img.imageTags" class="flex flex-wrap gap-1.5 mt-4">
        <span
          v-for="tag in img.imageTags.split(',')"
          :key="tag"
          class="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold px-2.5 py-1 rounded-md transition"
        >
          #{{ tag.trim() }}
        </span>
      </div>
    </div>
  </div>
</template>
