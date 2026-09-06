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
  img: GalleryImage | null
  isOpen: boolean
  variant?: 'default' | 'gallery'
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
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && img"
      class="fixed inset-0 z-[999] flex items-center justify-center"
      :class="variant === 'gallery' ? 'p-4 sm:p-6' : 'p-4'"
    >
      <!-- Backdrop overlay -->
      <div
        class="absolute inset-0 transition-opacity duration-300"
        :class="variant === 'gallery' ? 'bg-black/40 backdrop-blur-md' : 'bg-black/55 backdrop-blur-sm'"
        @click="$emit('close')"
      />

      <!-- Modal Content -->
      <div 
        class="relative z-10 flex w-full flex-col overflow-hidden animate-in fade-in zoom-in-95 md:flex-row"
        :class="variant === 'gallery' 
          ? 'max-h-[90vh] max-w-5xl duration-300 md:max-h-[85vh] rounded-[24px] lg:rounded-[32px] bg-white/95 backdrop-blur-xl shadow-[0_32px_64px_rgba(0,0,0,0.1),0_2px_24px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] border border-white/60' 
          : 'max-h-[90vh] max-w-4xl duration-200 md:max-h-[80vh] rounded-[1.4rem] bg-white shadow-[0_28px_90px_rgba(0,0,0,0.28)]'"
      >
        <!-- Close Button -->
        <button
          class="absolute right-4 top-4 z-20 rounded-full p-2 transition-all focus:outline-none"
          :class="variant === 'gallery' 
            ? 'bg-black/5 text-black/60 hover:bg-black/10 hover:text-black backdrop-blur-md' 
            : 'bg-white/90 text-black shadow hover:bg-white hover:shadow-md'"
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
        <div 
          class="relative w-full shrink-0 bg-neutral-100 md:w-1/2 flex items-center justify-center overflow-hidden"
          :class="variant === 'gallery' ? 'aspect-square md:aspect-auto' : 'aspect-[4/3] md:aspect-auto'"
        >
          <img
            :src="img.imageUrl"
            class="w-full h-full object-cover"
          >
          <div v-if="variant === 'gallery'" class="absolute inset-0 pointer-events-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]" />
        </div>

        <!-- Right side: Persisted public details -->
        <div 
          class="flex max-h-[50vh] w-full flex-col justify-between overflow-y-auto md:max-h-full md:w-1/2"
          :class="variant === 'gallery' ? 'p-7 md:p-8 lg:p-10' : 'p-7 md:p-8'"
        >
          <div :class="variant === 'gallery' ? 'space-y-6 lg:space-y-8' : 'space-y-6'">
            <!-- Header (Category, Title, Description) -->
            <div>
              <span 
                class="mb-3 inline-block rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                :class="variant === 'gallery' 
                  ? 'border-black/5 bg-black/[0.03] text-neutral-600' 
                  : 'border-black/5 bg-neutral-50 text-neutral-700'"
              >
                {{ img.workTypeName || 'General' }}
              </span>
              <h3 
                class="leading-tight text-black"
                :class="variant === 'gallery' ? 'text-2xl lg:text-3xl font-semibold tracking-tight' : 'text-2xl font-black'"
              >
                {{ img.imageTitle || 'Untitled' }}
              </h3>
              <p 
                class="mt-3 text-[14px] leading-relaxed text-neutral-500"
                :class="variant === 'gallery' ? 'font-medium' : 'text-sm leading-7'"
              >
                {{ img.imageDescription || 'ไม่มีคำอธิบายเพิ่มเติม' }}
              </p>
            </div>

            <!-- Tags -->
            <div
              v-if="img.imageTags"
              class="border-t border-black/5"
              :class="variant === 'gallery' ? 'pt-6 lg:pt-8' : 'pt-6'"
            >
              <h4 
                class="uppercase text-neutral-400"
                :class="variant === 'gallery' ? 'mb-3 text-[11px] font-bold tracking-[0.2em]' : 'mb-3 text-xs font-bold tracking-widest'"
              >
                แท็กคีย์เวิร์ด
              </h4>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in img.imageTags.split(',')"
                  :key="tag"
                  class="rounded-full border border-black/5 bg-neutral-50 font-medium text-neutral-500"
                  :class="variant === 'gallery' ? 'px-3 py-1.5 text-[11px]' : 'px-2.5 py-1 text-xs'"
                >
                  #{{ tag.trim() }}
                </span>
              </div>
            </div>
          </div>

          <div 
            class="border-t border-black/5"
            :class="variant === 'gallery' ? 'mt-8 pt-6 lg:pt-8 shrink-0' : 'mt-6 pt-8'"
          >
            <NuxtLink
              :to="`/customer/orders/create?${getOrderParams(img)}`"
              class="coos-button-dark w-full"
              :class="variant === 'gallery' ? 'py-3.5 text-[14px] shadow-sm hover:shadow-md transition-shadow' : ''"
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
