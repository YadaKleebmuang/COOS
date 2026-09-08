<script setup lang="ts">
type GalleryImage = {
  imageId?: number | string
  imageUrl?: string
  imageTitle?: string
  imageDescription?: string
  imageTags?: string
  workTypeId?: number
  workTypeName?: string
  orderStyle?: string
  orderColorTone?: string
  orderComposition?: string
}

const props = defineProps<{
  img: GalleryImage | null
  isOpen: boolean
  variant?: 'default' | 'gallery'
}>()

const { publicGalleryUrl } = useProtectedAsset()

defineEmits<{
  (e: 'close'): void
}>()

// Helper to generate query parameters for the create order wizard
const getOrderParams = (img: GalleryImage) => {
  if (!img || !img.imageId) return ''
  return `galleryImageId=${img.imageId}`
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
            :src="props.img?.imageId != null ? publicGalleryUrl(props.img.imageId) : ''"
            class="w-full h-full object-cover"
          >
          <div v-if="variant === 'gallery'" class="absolute inset-0 pointer-events-none shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]" />
        </div>

        <!-- Right side: Persisted public details -->
        <div
          class="flex max-h-[50vh] w-full flex-col md:max-h-full md:w-1/2 min-h-0"
        >
          <!-- Scrollable Content Body -->
          <div
            class="flex-1 overflow-y-auto min-h-0"
            :class="variant === 'gallery' ? 'p-7 md:p-8 lg:px-10 lg:pt-10' : 'p-7 md:p-8'"
          >
            <div :class="variant === 'gallery' ? 'space-y-6 lg:space-y-8 pb-6 lg:pb-8' : 'space-y-6 pb-6'">
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
              </div>

              <!-- Order Brief (รายละเอียดงาน) -->
              <div
                v-if="img.orderStyle || img.orderColorTone || img.orderComposition || img.imageDescription"
                class="border-t border-black/5"
                :class="variant === 'gallery' ? 'pt-6 lg:pt-8 mt-6 lg:mt-8' : 'pt-6 mt-6'"
              >
                <h4
                  class="uppercase text-neutral-400"
                  :class="variant === 'gallery' ? 'mb-4 text-[11px] font-bold tracking-[0.2em]' : 'mb-3 text-xs font-bold tracking-widest'"
                >
                  รายละเอียดงาน
                </h4>
                <div class="space-y-4">
                  <div v-if="img.orderStyle" class="flex flex-col">
                    <span class="text-[11px] font-medium text-neutral-400 mb-1">สไตล์</span>
                    <span class="text-[13.5px] leading-relaxed text-neutral-800">{{ img.orderStyle }}</span>
                  </div>
                  <div v-if="img.orderColorTone" class="flex flex-col">
                    <span class="text-[11px] font-medium text-neutral-400 mb-1">โทนสี</span>
                    <span class="text-[13.5px] leading-relaxed text-neutral-800">{{ img.orderColorTone }}</span>
                  </div>
                  <div v-if="img.orderComposition" class="flex flex-col">
                    <span class="text-[11px] font-medium text-neutral-400 mb-1">องค์ประกอบภาพ</span>
                    <span class="text-[13.5px] leading-relaxed text-neutral-800">{{ img.orderComposition }}</span>
                  </div>
                  <div v-if="img.imageDescription" class="flex flex-col">
                    <span class="text-[11px] font-medium text-neutral-400 mb-1">รายละเอียดเพิ่มเติม</span>
                    <span class="text-[13.5px] leading-relaxed text-neutral-800">{{ img.imageDescription }}</span>
                  </div>
                </div>
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
          </div>

          <!-- Stable Footer CTA -->
          <div
            class="flex-none border-t border-black/5"
            :class="variant === 'gallery' ? 'p-7 md:p-8 lg:px-10 lg:py-6' : 'p-7 md:p-8 md:py-6 py-6'"
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
