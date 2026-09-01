<script setup lang="ts">
import { computed } from 'vue'

type GalleryImage = {
  imageUrl?: string
  imageTitle?: string
  imageDescription?: string
  imageTags?: string
  workTypeId?: number
  workTypeName?: string
}

const props = defineProps<{
  img: GalleryImage | null
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

// Helper to generate query parameters for the create order wizard
const getOrderParams = (img: GalleryImage) => {
  if (!img) return ''
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

  let style = 'Portrait'
  let colorTone = 'Natural Tone'
  let lighting = 'Natural Light'
  let cameraAngle = 'Eye Level'
  let timeOfDay = 'Daytime'

  // Title-based custom prompt overrides
  const title = (props.img.imageTitle || '').toLowerCase()
  if (title.includes('romance') || title.includes('love')) {
    style = 'Romantic / Cinematic'
    colorTone = 'Warm Gold'
    lighting = 'Sunset Glow'
    cameraAngle = 'Medium Shot'
    timeOfDay = 'Golden Hour'
  } else if (title.includes('confidence')) {
    style = 'Classic Studio'
    colorTone = 'High Contrast'
    lighting = 'Dramatic Key Light'
    cameraAngle = 'Close-up'
    timeOfDay = 'Studio Session'
  } else if (title.includes('serene')) {
    style = 'Minimalist'
    colorTone = 'Soft Pastel'
    lighting = 'Diffused Ambient'
    cameraAngle = 'Medium Close-up'
    timeOfDay = 'Morning'
  } else if (title.includes('golden')) {
    style = 'Outdoor Warm'
    colorTone = 'Warm Orange/Gold'
    lighting = 'Sunset Glow'
    cameraAngle = 'Wide Landscape'
    timeOfDay = 'Golden Hour'
  } else if (title.includes('thoughtful')) {
    style = 'Moody Portrait'
    colorTone = 'Cool / Desaturated'
    lighting = 'Side Window Light'
    cameraAngle = 'Close-up'
    timeOfDay = 'Afternoon'
  } else if (title.includes('black tone') || tags.includes('blackwhite') || tags.includes('blacktone')) {
    style = 'Fine Art B&W'
    colorTone = 'Monochrome'
    lighting = 'High Contrast Light'
    cameraAngle = 'Cinematic Angle'
    timeOfDay = 'Day'
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
  <Teleport to="body">
    <div
      v-if="isOpen && img"
      class="fixed inset-0 z-[999] flex items-center justify-center p-4"
    >
      <!-- Backdrop overlay -->
      <div
        class="absolute inset-0 bg-black/55 backdrop-blur-sm"
        @click="$emit('close')"
      />

      <!-- Modal Content -->
      <div class="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.4rem] bg-white shadow-[0_28px_90px_rgba(0,0,0,0.28)] md:max-h-[80vh] md:flex-row animate-in fade-in zoom-in-95 duration-200">
        <!-- Close Button -->
        <button
          class="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2 text-black shadow transition-all hover:bg-white hover:shadow-md focus:outline-none"
          @click="$emit('close')"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Left side: Image -->
        <div class="relative aspect-[4/3] w-full shrink-0 bg-neutral-100 md:w-1/2 md:aspect-auto">
          <img
            :src="img.imageUrl"
            class="w-full h-full object-cover"
          >
        </div>

        <!-- Right side: Details & Prompts -->
        <div class="flex max-h-[50vh] w-full flex-col justify-between overflow-y-auto p-7 md:max-h-full md:w-1/2 md:p-8">
          <div class="space-y-6">
            <div>
              <span class="mb-3 inline-block rounded-full border border-black/5 bg-neutral-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-700">
                {{ img.workTypeName || 'General' }}
              </span>
              <h3 class="text-2xl font-black leading-tight text-black">
                {{ img.imageTitle || 'Untitled' }}
              </h3>
              <p class="mt-2 text-sm leading-7 text-neutral-500">
                {{ img.imageDescription || 'ไม่มีคำอธิบายเพิ่มเติม' }}
              </p>
            </div>

            <div class="border-t border-black/5 pt-6">
              <h4 class="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                Prompt Metadata
              </h4>

              <div
                v-if="promptDetails"
                class="space-y-3.5"
              >
                <div class="flex justify-between text-sm">
                  <span class="text-neutral-400">สไตล์ (Style)</span>
                  <span class="font-semibold text-black">{{ promptDetails.style }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-neutral-400">โทนสี (Color Tone)</span>
                  <span class="font-semibold text-black">{{ promptDetails.colorTone }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-neutral-400">แสง (Lighting)</span>
                  <span class="font-semibold text-black">{{ promptDetails.lighting }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-neutral-400">มุมกล้อง (Camera Angle)</span>
                  <span class="font-semibold text-black">{{ promptDetails.cameraAngle }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-neutral-400">เวลา (Time of Day)</span>
                  <span class="font-semibold text-black">{{ promptDetails.timeOfDay }}</span>
                </div>
              </div>
            </div>

            <div
              v-if="img.imageTags"
              class="border-t border-black/5 pt-6"
            >
              <h4 class="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-400">
                แท็กคีย์เวิร์ด
              </h4>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in img.imageTags.split(',')"
                  :key="tag"
                  class="rounded-full border border-black/5 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-500"
                >
                  #{{ tag.trim() }}
                </span>
              </div>
            </div>
          </div>

          <div class="mt-6 border-t border-black/5 pt-8">
            <NuxtLink
              :to="`/customer/orders/create?${getOrderParams(img)}`"
              class="coos-button-dark w-full"
              @click="$emit('close')"
            >
              สั่งทำภาพแนวนี้
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
