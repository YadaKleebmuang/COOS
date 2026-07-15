<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  img: any
  isOpen: boolean
}>()

defineEmits<{
  (e: "close"): void
}>()

// Helper to generate query parameters for the create order wizard
const getOrderParams = (img: any) => {
  if (!img) return ""
  const params: Record<string, string> = {
    workTypeId: String(img.workTypeId)
  }
  if (img.imageTags) {
    const tags = img.imageTags.split(',').map((t: string) => t.trim().toLowerCase())
    
    // Detect style
    if (tags.includes('minimal')) params.style = 'Minimal'
    else if (tags.includes('romantic')) params.style = 'Romantic'
    else if (tags.includes('classic')) params.style = 'Classic'
    else if (tags.includes('moody')) params.style = 'Moody'
    else if (tags.includes('natural')) params.style = 'Natural'
    else if (tags.includes('modern')) params.style = 'Modern'
    
    // Detect colorTone
    if (tags.includes('warm')) params.colorTone = 'Warm Tone'
    else if (tags.includes('blackwhite') || tags.includes('black tone') || tags.includes('blacktone')) params.colorTone = 'Black & White'
    else if (tags.includes('softtone') || tags.includes('soft')) params.colorTone = 'Soft Tone'
  }
  
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
}

// Inferred prompt details from tags
const promptDetails = computed(() => {
  if (!props.img) return null
  
  const tags = props.img.imageTags 
    ? props.img.imageTags.split(',').map((t: string) => t.trim().toLowerCase()) 
    : []
  
  let style = "Portrait"
  let colorTone = "Natural Tone"
  let lighting = "Natural Light"
  let cameraAngle = "Eye Level"
  let timeOfDay = "Daytime"

  // Title-based custom prompt overrides
  const title = (props.img.imageTitle || "").toLowerCase()
  if (title.includes("romance") || title.includes("love")) {
    style = "Romantic / Cinematic"
    colorTone = "Warm Gold"
    lighting = "Sunset Glow"
    cameraAngle = "Medium Shot"
    timeOfDay = "Golden Hour"
  } else if (title.includes("confidence")) {
    style = "Classic Studio"
    colorTone = "High Contrast"
    lighting = "Dramatic Key Light"
    cameraAngle = "Close-up"
    timeOfDay = "Studio Session"
  } else if (title.includes("serene")) {
    style = "Minimalist"
    colorTone = "Soft Pastel"
    lighting = "Diffused Ambient"
    cameraAngle = "Medium Close-up"
    timeOfDay = "Morning"
  } else if (title.includes("golden")) {
    style = "Outdoor Warm"
    colorTone = "Warm Orange/Gold"
    lighting = "Sunset Glow"
    cameraAngle = "Wide Landscape"
    timeOfDay = "Golden Hour"
  } else if (title.includes("thoughtful")) {
    style = "Moody Portrait"
    colorTone = "Cool / Desaturated"
    lighting = "Side Window Light"
    cameraAngle = "Close-up"
    timeOfDay = "Afternoon"
  } else if (title.includes("black tone") || tags.includes("blackwhite") || tags.includes("blacktone")) {
    style = "Fine Art B&W"
    colorTone = "Monochrome"
    lighting = "High Contrast Light"
    cameraAngle = "Cinematic Angle"
    timeOfDay = "Day"
  }

  return {
    style,
    colorTone,
    lighting,
    cameraAngle,
    timeOfDay
  }
})
</script>

<template>
  <div v-if="isOpen && img" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop overlay -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- Modal Content -->
    <div class="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden flex flex-col md:flex-row z-10 animate-in fade-in zoom-in-95 duration-200">
      
      <!-- Close Button -->
      <button 
        @click="$emit('close')" 
        class="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-slate-800 p-2 rounded-full shadow hover:shadow-md transition-all focus:outline-none"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Left side: Image -->
      <div class="w-full md:w-1/2 bg-slate-100 relative shrink-0 aspect-[4/3] md:aspect-auto">
        <img :src="img.imageUrl" class="w-full h-full object-cover" />
      </div>

      <!-- Right side: Details & Prompts -->
      <div class="w-full md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-full">
        <div class="space-y-6">
          <div>
            <span class="inline-block bg-gray-100 text-gray-800 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3">
              {{ img.workTypeName || 'General' }}
            </span>
            <h3 class="text-2xl font-extrabold text-slate-900 leading-tight">
              {{ img.imageTitle || 'Untitled' }}
            </h3>
            <p class="text-slate-500 mt-2 text-sm leading-relaxed">
              {{ img.imageDescription || 'ไม่มีคำอธิบายเพิ่มเติม' }}
            </p>
          </div>

          <div class="border-t border-slate-100 pt-6">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Prompt Metadata</h4>
            
            <div class="space-y-3.5" v-if="promptDetails">
              <div class="flex justify-between text-sm">
                <span class="text-slate-400">สไตล์ (Style)</span>
                <span class="font-semibold text-slate-900">{{ promptDetails.style }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-400">โทนสี (Color Tone)</span>
                <span class="font-semibold text-slate-900">{{ promptDetails.colorTone }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-400">แสง (Lighting)</span>
                <span class="font-semibold text-slate-900">{{ promptDetails.lighting }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-400">มุมกล้อง (Camera Angle)</span>
                <span class="font-semibold text-slate-900">{{ promptDetails.cameraAngle }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-400">เวลา (Time of Day)</span>
                <span class="font-semibold text-slate-900">{{ promptDetails.timeOfDay }}</span>
              </div>
            </div>
          </div>

          <div v-if="img.imageTags" class="border-t border-slate-100 pt-6">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">แท็กคีย์เวิร์ด</h4>
            <div class="flex flex-wrap gap-1.5">
              <span 
                v-for="tag in img.imageTags.split(',')" 
                :key="tag" 
                class="text-xs bg-slate-50 text-slate-500 font-medium px-2.5 py-1 rounded-md"
              >
                #{{ tag.trim() }}
              </span>
            </div>
          </div>
        </div>

        <div class="pt-8 mt-6 border-t border-slate-100">
          <NuxtLink 
            :to="`/customer/orders/create?${getOrderParams(img)}`"
            class="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all block text-sm"
            @click="$emit('close')"
          >
            สั่งทำภาพแนวนี้
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>
