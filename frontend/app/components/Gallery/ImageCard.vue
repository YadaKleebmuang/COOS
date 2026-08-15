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
  <div class="coos-card coos-card-hover flex h-full flex-col p-3 group">
    <!-- Card Image with Hover overlay -->
    <div class="relative aspect-[4/3] overflow-hidden bg-neutral-100 shrink-0 rounded-xl">
      <img
        :src="img.imageUrl"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
      >
      <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <a
          :href="img.imageUrl"
          target="_blank"
          class="flex items-center gap-1.5 rounded-lg bg-white/95 px-3.5 py-2 text-xs font-bold text-black shadow transition hover:bg-white"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          เปิดดูรูปภาพ
        </a>
      </div>
    </div>

    <!-- Card Details -->
    <div class="flex flex-1 flex-col justify-between px-1 pt-4">
      <div>
        <span class="text-xs font-semibold text-neutral-400">{{ img.workTypeName || 'ทั่วไป' }}</span>
        <h3 class="mt-1 text-base font-black text-black transition-colors">
          {{ img.imageTitle || 'ไม่มีชื่อผลงาน' }}
        </h3>
        <p class="mt-2 line-clamp-2 text-xs leading-6 text-neutral-500">
          {{ img.imageDescription || 'ไม่มีคำอธิบายเพิ่มเติม' }}
        </p>
      </div>

      <div>
        <!-- Tags -->
        <div
          v-if="img.imageTags"
          class="flex flex-wrap gap-1.5 mt-3"
        >
          <span
            v-for="tag in img.imageTags.split(',')"
            :key="tag"
            class="rounded-full border border-black/5 bg-neutral-50 px-2.5 py-1 text-[10px] font-medium text-neutral-500 transition hover:bg-neutral-100"
          >
            #{{ tag.trim() }}
          </span>
        </div>

        <!-- Buttons -->
        <div class="grid grid-cols-2 gap-3 mt-4">
          <button
            class="rounded-xl border border-black/10 px-3 py-2 text-center text-xs font-bold text-neutral-700 transition-all hover:border-black hover:text-black focus:outline-none"
            @click="$emit('view-details', img)"
          >
            ดูรายละเอียด
          </button>
          <NuxtLink
            :to="`/customer/orders/create?${getOrderParams(img)}`"
            class="flex items-center justify-center rounded-xl bg-black px-3 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-neutral-800"
          >
            สั่งทำภาพแนวนี้
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
