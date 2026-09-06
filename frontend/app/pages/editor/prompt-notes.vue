<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { orderService } from '~/services/order.service'
import type { OrderImage } from '~/types/order.types'

definePageMeta({
  layout: 'editor',
  middleware: ['auth', 'editor']
})

useHead({ title: 'บันทึก Prompt - COOS Studio Editor' })

const promptNotes = ref<OrderImage[]>([])
const loading = ref(true)
const error = ref('')
const detailImage = ref<OrderImage | null>(null)
const copiedKey = ref<string | null>(null)
const searchQuery = ref('')
const dateFilter = ref<'all' | 'today' | '7days' | '30days'>('all')

const breadcrumb = [
  { label: 'หน้าแรก', to: '/editor/dashboard' },
  { label: 'บันทึก Prompt' }
]

const getImageFilename = (url?: string | null) => {
  const raw = url?.split('/').pop()?.split('?')[0]
  if (!raw) return ''
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}

const filteredPromptNotes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const rangeDays = dateFilter.value === '7days' ? 7 : dateFilter.value === '30days' ? 30 : 1
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - (rangeDays - 1))

  return promptNotes.value.filter((image) => {
    const matchesSearch = !query || [
      getImageFilename(image.imageUrl),
      image.aiEngine || '',
      String(image.orderId),
      `#${image.orderId}`
    ].some(value => value.toLowerCase().includes(query))

    if (!matchesSearch || dateFilter.value === 'all') return matchesSearch

    const createdAt = image.imageCreatedAt ? new Date(image.imageCreatedAt) : null
    if (!createdAt || Number.isNaN(createdAt.getTime())) return false
    return createdAt >= cutoff && createdAt <= now
  })
})

const filtersActive = computed(() => searchQuery.value.trim() !== '' || dateFilter.value !== 'all')

const clearFilters = () => {
  searchQuery.value = ''
  dateFilter.value = 'all'
}

const fetchPromptNotes = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await orderService.getPromptNotes()
    promptNotes.value = response.data || []
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดบันทึก Prompt ได้'
  } finally {
    loading.value = false
  }
}

const formatDateTime = (value?: string) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const displayValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return '—'
  return value
}

const copyPrompt = async (text: string, key: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copiedKey.value = key
    setTimeout(() => (copiedKey.value = null), 2000)
  } catch {
    copiedKey.value = null
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') detailImage.value = null
}

onMounted(() => {
  fetchPromptNotes()
  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <AdminBreadcrumb :items="breadcrumb" />

    <section class="flex flex-col overflow-hidden rounded-[24px] border border-black/[0.06] bg-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.02)] backdrop-blur-md">
      <header class="flex flex-col gap-4 border-b border-black/[0.06] px-6 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-lg font-semibold tracking-tight text-[#171717]">
            บันทึก Prompt
          </h1>
          <p class="mt-0.5 text-[13px] font-medium text-[#666666]">
            รวบรวมข้อมูลการสร้างภาพจากผลงานดราฟต์ที่บันทึกไว้
          </p>
        </div>
        <span class="w-fit rounded-full border border-black/[0.06] bg-[#F7F7F5] px-3 py-1.5 text-xs font-semibold text-[#666666]">
          {{ filteredPromptNotes.length }} รายการ
        </span>
      </header>

      <div class="flex flex-col gap-3 border-b border-black/[0.06] bg-[#FDFDFB]/30 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div class="flex items-center gap-2 rounded-xl border border-black/[0.06] bg-white px-3 py-2 shadow-sm transition-all focus-within:border-black/[0.12]">
            <svg
              class="h-4 w-4 shrink-0 text-[#929292]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="ค้นหาชื่อไฟล์ เครื่องมือ หรือเลขที่งาน..."
              class="w-full bg-transparent text-[13px] font-medium text-[#171717] outline-none placeholder:text-[#9A9A95] sm:w-96"
            >
          </div>

          <label class="flex items-center gap-2 rounded-xl border border-black/[0.06] bg-white px-3 py-2 shadow-sm">
            <span class="whitespace-nowrap text-[12px] font-semibold text-[#666666]">วันที่บันทึก</span>
            <select
              v-model="dateFilter"
              class="bg-transparent text-[13px] font-medium text-[#171717] outline-none"
            >
              <option value="all">ทุกวันที่</option>
              <option value="today">วันนี้</option>
              <option value="7days">7 วันที่ผ่านมา</option>
              <option value="30days">30 วันที่ผ่านมา</option>
            </select>
          </label>
        </div>

        <button
          v-if="filtersActive"
          class="w-fit text-[12px] font-semibold text-[#666666] underline transition-colors hover:text-[#171717]"
          @click="clearFilters"
        >
          ล้างตัวกรอง
        </button>
      </div>

      <div class="flex-1 bg-[#FDFDFB]/50 p-6">
        <div
          v-if="loading"
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <article
            v-for="index in 8"
            :key="index"
            class="overflow-hidden rounded-2xl border border-[#EFEFEA]/60 bg-white animate-pulse"
          >
            <div class="aspect-[4/3] bg-[#F7F7F5]" />
            <div class="space-y-3 p-4">
              <div class="h-3 w-20 rounded bg-[#F7F7F5]" />
              <div class="h-3 w-3/4 rounded bg-[#F7F7F5]" />
              <div class="h-8 rounded-lg bg-[#F7F7F5]" />
            </div>
          </article>
        </div>

        <div
          v-else-if="error"
          class="rounded-2xl border border-red-100 bg-white p-10 text-center"
        >
          <p class="text-sm font-medium text-red-600">
            {{ error }}
          </p>
          <button
            class="mt-3 text-xs font-medium text-[#666666] underline hover:text-[#171717]"
            @click="fetchPromptNotes"
          >
            ลองโหลดใหม่
          </button>
        </div>

        <AdminEmptyState
          v-else-if="!promptNotes.length"
          icon="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
          title="ยังไม่มีบันทึก Prompt"
          description="ผลงานดราฟต์ที่บันทึกจากงานของคุณจะแสดงที่นี่"
        />

        <AdminEmptyState
          v-else-if="!filteredPromptNotes.length"
          icon="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          title="ไม่พบรายการที่ตรงกับการค้นหา"
          description="ลองเปลี่ยนคำค้นหาหรือช่วงวันที่"
        />

        <div
          v-else
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <article
            v-for="image in filteredPromptNotes"
            :key="image.orderImageId"
            class="group flex flex-col overflow-hidden rounded-2xl border border-[#EFEFEA]/60 bg-white transition-all hover:border-[#171717]/10 hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)]"
          >
            <button
              class="block aspect-[4/3] w-full overflow-hidden border-b border-[#EFEFEA]/40 bg-[#F7F7F5]/50"
              :aria-label="`ดูรายละเอียดงาน #${image.orderId}`"
              @click="detailImage = image"
            >
              <img
                :src="image.imageThumbnailUrl || image.imageUrl"
                :alt="`ผลงานดราฟต์ งาน #${image.orderId}`"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              >
            </button>
            <div class="flex flex-1 flex-col p-4">
              <p class="font-mono text-[12px] font-semibold text-[#666666]">
                งาน #{{ image.orderId }}
              </p>
              <div class="mt-3">
                <p class="text-[10px] font-semibold text-[#9A9A95]">
                  เครื่องมือที่ใช้
                </p>
                <p class="mt-1 truncate text-[13px] font-semibold text-[#171717]">
                  {{ displayValue(image.aiEngine) }}
                </p>
              </div>
              <div class="mt-3">
                <p class="text-[10px] font-semibold text-[#9A9A95]">
                  วันที่บันทึก
                </p>
                <p class="mt-1 text-xs text-[#666666]">
                  {{ formatDateTime(image.imageCreatedAt) }}
                </p>
              </div>
              <button
                class="mt-4 w-full rounded-lg border border-black/[0.06] bg-white px-3 py-2 text-[11px] font-semibold text-[#171717] shadow-sm transition-colors hover:bg-[#F7F7F5]"
                @click="detailImage = image"
              >
                ดูรายละเอียด
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="detailImage"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            class="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="ปิดรายละเอียด"
            @click="detailImage = null"
          />
          <section class="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[24px] border border-black/[0.06] bg-white/95 shadow-2xl backdrop-blur-[15px]">
            <header class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-black/[0.06] bg-white/95 p-6 backdrop-blur-md">
              <div>
                <h2 class="text-lg font-semibold text-[#171717]">
                  รายละเอียดผลงาน
                </h2>
                <p class="mt-0.5 text-xs text-[#666666]">
                  ข้อมูลการสร้างภาพและพารามิเตอร์ของผลงานนี้
                </p>
              </div>
              <button
                class="rounded-lg p-2 text-[#666666] transition-colors hover:bg-[#F7F7F5]"
                aria-label="ปิด"
                @click="detailImage = null"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-width="1.8"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </button>
            </header>

            <div class="space-y-5 p-6">
              <img
                :src="detailImage.imageUrl"
                :alt="`ผลงานดราฟต์ งาน #${detailImage.orderId}`"
                class="max-h-80 w-full rounded-xl bg-[#F7F7F5] object-contain"
              >

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div class="rounded-xl border border-black/[0.06] bg-[#F7F7F5]/50 p-4">
                  <p class="text-[11px] font-semibold text-[#929292]">
                    งาน
                  </p>
                  <p class="mt-1 font-mono text-sm font-semibold text-[#171717]">
                    #{{ detailImage.orderId }}
                  </p>
                </div>
                <div class="rounded-xl border border-black/[0.06] bg-[#F7F7F5]/50 p-4">
                  <p class="text-[11px] font-semibold text-[#929292]">
                    เครื่องมือที่ใช้
                  </p>
                  <p class="mt-1 text-sm font-semibold text-[#171717]">
                    {{ displayValue(detailImage.aiEngine) }}
                  </p>
                </div>
              </div>

              <div
                v-for="prompt in [
                  { label: 'Positive Prompt', value: detailImage.positivePrompt, key: `pos-${detailImage.orderImageId}` },
                  { label: 'Negative Prompt', value: detailImage.negativePrompt, key: `neg-${detailImage.orderImageId}` }
                ]"
                :key="prompt.key"
              >
                <div class="mb-1.5 flex items-center justify-between">
                  <p class="text-xs font-semibold text-[#666666]">
                    {{ prompt.label }}
                  </p>
                  <button
                    v-if="prompt.value"
                    class="rounded-lg border border-black/[0.06] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#666666] shadow-sm transition-colors hover:bg-[#F7F7F5] hover:text-black"
                    @click="copyPrompt(prompt.value, prompt.key)"
                  >
                    {{ copiedKey === prompt.key ? 'คัดลอกแล้ว' : 'คัดลอก' }}
                  </button>
                </div>
                <p class="min-h-12 whitespace-pre-wrap break-words rounded-xl border border-black/[0.06] bg-[#F7F7F5]/50 p-3 text-xs leading-relaxed text-[#4A4A4A]">
                  {{ displayValue(prompt.value) }}
                </p>
              </div>

              <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div
                  v-for="item in [
                    { label: 'Seed', value: detailImage.seed },
                    { label: 'CFG Scale', value: detailImage.cfgScale },
                    { label: 'Steps', value: detailImage.steps }
                  ]"
                  :key="item.label"
                  class="rounded-xl border border-black/[0.06] bg-[#F7F7F5]/50 p-3"
                >
                  <p class="text-[11px] font-semibold text-[#929292]">
                    {{ item.label }}
                  </p>
                  <p class="mt-1 break-words text-sm font-semibold text-[#171717]">
                    {{ displayValue(item.value) }}
                  </p>
                </div>
              </div>

              <div class="rounded-xl border border-black/[0.06] bg-[#F7F7F5]/50 p-4">
                <p class="text-[11px] font-semibold text-[#929292]">
                  วันที่บันทึก
                </p>
                <p class="mt-1 text-sm font-medium text-[#171717]">
                  {{ formatDateTime(detailImage.imageCreatedAt) }}
                </p>
              </div>
            </div>

            <footer class="flex justify-end border-t border-black/[0.06] bg-white px-6 py-4">
              <button
                class="rounded-xl border border-black/[0.06] bg-white px-4 py-2 text-[13px] font-semibold text-[#171717] shadow-sm transition-colors hover:bg-[#F7F7F5]"
                @click="detailImage = null"
              >
                ปิด
              </button>
            </footer>
          </section>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
