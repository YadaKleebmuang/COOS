<script setup lang="ts">
type GalleryImage = {
  imageUrl?: string
  imageTitle?: string
  imageDescription?: string
  imageTags?: string
  workTypeId?: number
  workTypeName?: string
}

defineProps<{
  img: GalleryImage
}>()

defineEmits<{
  (e: 'view-details', img: GalleryImage): void
}>()

const getOrderParams = (img: GalleryImage) => {
  if (!img) return ''
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
  <div 
    class="relative group w-full aspect-[4/5] rounded-[24px] overflow-hidden bg-neutral-100 shadow-sm border border-black/[0.04] cursor-pointer transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:border-black/10 hover:-translate-y-0.5"
    @click="$emit('view-details', img)"
  >
    <!-- Artwork Image -->
    <img
      :src="img.imageUrl"
      class="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105"
      alt=""
    >
    
    <!-- Gradient Overlays for Readability -->
    <!-- Always present but subtle base overlay -->
    <div class="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
    
    <!-- Hover enhancement overlay -->
    <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    
    <!-- Delicate inset highlight to give glass/premium feel -->
    <div class="absolute inset-0 rounded-[24px] pointer-events-none z-20 mix-blend-overlay shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] border border-black/[0.03]" />

    <!-- Category Pill (Top Left) -->
    <div class="absolute top-4 left-4 z-30">
      <span class="inline-flex items-center px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[11px] font-semibold text-white tracking-wide shadow-sm">
        {{ img.workTypeName || 'ทั่วไป' }}
      </span>
    </div>

    <!-- Title and Description (Bottom) -->
    <div class="absolute bottom-0 left-0 right-0 p-5 z-30 flex flex-col justify-end pointer-events-none">
      <h3 class="text-white text-lg font-bold tracking-tight line-clamp-1 drop-shadow-md">
        {{ img.imageTitle || 'ไม่มีชื่อผลงาน' }}
      </h3>
      <p class="text-white/80 text-[13px] leading-relaxed line-clamp-2 mt-1.5 drop-shadow-md font-medium">
        {{ img.imageDescription || 'ไม่มีคำอธิบายเพิ่มเติม' }}
      </p>
    </div>
  </div>
</template>
