<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApi } from '~/composables/useApi'
import type { WorkType } from '~/types/order.types'

definePageMeta({
  layout: 'default'
})

const token = useCookie<string | null>('token')
const { apiFetch } = useApi()

type PublicUser = {
  userFirstName?: string
  userLastName?: string
  userEmail?: string
}

type GalleryImage = {
  imageId?: number | string
  imageUrl?: string
  imageTitle?: string
  imageDescription?: string
  imageTags?: string
  workTypeId?: number
  workTypeName?: string
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message?: unknown }).message
    if (typeof message === 'string' && message) return message
  }
  return fallback
}

// --- Auth & User State ---
const currentUser = ref<PublicUser | null>(null)
const checkAuth = async () => {
  if (token.value) {
    try {
      const data = await apiFetch<PublicUser>('/users/me')
      currentUser.value = data
    } catch (err) {
      console.error('Auth check failed:', err)
      token.value = null // Clear invalid token
      currentUser.value = null
    }
  }
}

// --- Gallery & Category State ---
const images = ref<GalleryImage[]>([])
const workTypes = ref<WorkType[]>([])
const loading = ref(false)
const error = ref('')

const selectedImage = ref<GalleryImage | null>(null)
const isDetailsModalOpen = ref(false)

const openDetails = (img: GalleryImage) => {
  selectedImage.value = img
  isDetailsModalOpen.value = true
}

// Search, Filter & Tag State
const search = ref('')
const selectedWorkTypeId = ref<number | null>(null) // null means "ทั้งหมด"
const selectedTag = ref<string | null>(null)
const sortBy = ref('newest') // newest, oldest

const availableTags = ref<string[]>([])

const toggleTag = (tag: string) => {
  if (selectedTag.value === tag) {
    selectedTag.value = null
  } else {
    selectedTag.value = tag
  }
}

// Pagination
const route = useRoute()
const router = useRouter()
const currentPage = ref(parseInt(route.query.page as string) || 1)
const itemsPerPage = 16

const updateUrl = () => {
  router.replace({
    query: {
      ...route.query,
      page: currentPage.value === 1 ? undefined : currentPage.value
    }
  })
}

// Reset pagination when filters change
watch([search, selectedWorkTypeId, selectedTag, sortBy], () => {
  currentPage.value = 1
  updateUrl()
})

watch(currentPage, () => {
  updateUrl()
  if (process.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const loadData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [imgData, wtData, tagsData] = await Promise.all([
      apiFetch<GalleryImage[]>('/gallery-images'),
      apiFetch<WorkType[]>('/work-types').catch(() => []),
      apiFetch<string[]>('/gallery-images/tags').catch(() => [])
    ])
    images.value = imgData

    if (wtData && wtData.length > 0) {
      workTypes.value = wtData.filter(wt => wt.workTypeIsActive === 1)
    } else {
      // Fallback categories matching mockup design
      workTypes.value = [
        { workTypeId: 1, workTypeName: 'Pre-wedding', workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() },
        { workTypeId: 2, workTypeName: 'รับปริญญา', workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() },
        { workTypeId: 3, workTypeName: 'Portrait', workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() },
        { workTypeId: 4, workTypeName: 'ครอบครัว', workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() },
        { workTypeId: 5, workTypeName: 'อื่น ๆ', workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() }
      ]
    }

    if (tagsData && tagsData.length > 0) {
      availableTags.value = tagsData
    }
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'ไม่สามารถโหลดข้อมูลแกลเลอรีได้')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await checkAuth()
  await loadData()
})

// --- Computed Filters & Sorting ---
const filteredImages = computed(() => {
  let result = images.value

  // Filter by category
  if (selectedWorkTypeId.value !== null) {
    result = result.filter(img => img.workTypeId === selectedWorkTypeId.value)
  }

  // Filter by hashtag
  if (selectedTag.value) {
    const active = selectedTag.value.toLowerCase()
    result = result.filter(img =>
      img.imageTags?.toLowerCase().split(',').map((t: string) => t.trim()).includes(active)
    )
  }

  // Filter by search query
  if (search.value.trim()) {
    const query = search.value.toLowerCase().trim()
    result = result.filter(img =>
      img.imageTitle?.toLowerCase().includes(query)
      || img.imageDescription?.toLowerCase().includes(query)
      || img.imageTags?.toLowerCase().includes(query)
      || img.workTypeName?.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  const sorted = [...result]
  if (sortBy.value === 'oldest') {
    return sorted.reverse()
  }

  return sorted
})

// --- Category Tabs ---
const categoryTabs = computed(() => {
  return [
    { id: null, name: 'ทั้งหมด' },
    ...workTypes.value.map(wt => ({
      id: wt.workTypeId,
      name: wt.workTypeName.replace(/\s*\(.*\)/, '') // Clean up text, e.g. "ครอบครัว (Family)" -> "ครอบครัว"
    }))
  ]
})

// --- Paginated Images ---
const totalPages = computed(() => Math.ceil(filteredImages.value.length / itemsPerPage))

const displayedImages = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredImages.value.slice(start, end)
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
</script>

<template>
  <div class="coos-page min-h-screen relative overflow-hidden">
    <!-- Progressive Top Blur Layer (Fixed to viewport) -->
    <Teleport to="body">
      <div class="fixed top-0 left-0 right-0 h-[100px] sm:h-[120px] lg:h-[140px] z-[150] pointer-events-none progressive-blur-layer" />
    </Teleport>
 
    <!-- Subtle Grid background -->
    <div class="gallery-grid pointer-events-none fixed inset-0 z-0" />
 
    <!-- Main Content -->
    <main class="space-y-10 py-10 md:py-14 relative z-10">
      <!-- Gallery Header -->
      <section class="px-4 sm:px-5 lg:px-8 pt-6 sm:pt-10">
        <div class="mx-auto w-full max-w-[1280px] text-center flex flex-col items-center">
          <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 mb-3 font-mono">
            COOS GALLERY
          </p>
          <h1 class="text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold tracking-tight text-[#171717]">
            ผลงานทั้งหมด
          </h1>
          <p class="mt-4 sm:mt-5 max-w-[500px] mx-auto text-[13px] sm:text-[15px] leading-relaxed text-neutral-500">
            ค้นหา เลือกสไตล์ และใช้ผลงานตัวอย่างเป็นจุดเริ่มต้นสำหรับการสั่งงานของคุณ
          </p>
        </div>
      </section>

      <!-- Search & Filters Section -->
      <section class="px-4 sm:px-5 lg:px-8">
        <div class="mx-auto w-full max-w-[1280px]">
          <!-- Search & Filters Container -->
          <div class="coos-panel space-y-4 p-4 sm:p-5 text-left">
            <!-- Search bar & Sort dropdown -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    class="h-[18px] w-[18px] text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  v-model="search"
                  type="text"
                  placeholder="ค้นหาผลงาน เช่น portrait, รับปริญญา"
                  class="w-full h-[46px] pl-[42px] pr-4 text-[13px] font-medium text-neutral-800 placeholder-neutral-400 bg-white/60 backdrop-blur-md border border-white/60 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-all duration-300 focus:outline-none focus:ring-[3px] focus:ring-black/5 focus:border-white focus:bg-white/80 focus:shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)]"
                >
              </div>

              <select
                v-model="sortBy"
                class="h-[46px] w-full sm:w-auto pl-4 pr-10 bg-white/60 backdrop-blur-md border border-white/60 rounded-[16px] shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.9)] text-[13px] font-semibold text-neutral-600 transition-all duration-300 hover:bg-white/75 focus:outline-none focus:ring-[3px] focus:ring-black/5 focus:border-white focus:bg-white/80 focus:shadow-[0_8px_24px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)] cursor-pointer"
              >
                <option value="newest">
                  อัปเดตล่าสุด
                </option>
                <option value="oldest">
                  อัปเดตเก่าสุด
                </option>
              </select>
            </div>

            <!-- Category Tabs -->
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                v-for="tab in categoryTabs"
                :key="tab.id ?? 'all'"
                class="cursor-pointer rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-all duration-200"
                :class="selectedWorkTypeId === tab.id
                  ? 'bg-black text-white border-black shadow-sm'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700 border-black/10'"
                @click="selectedWorkTypeId = tab.id"
              >
                {{ tab.name }}
              </button>
            </div>

            <template v-if="availableTags.length > 0">
              <!-- Divider Line -->
              <hr class="border-black/5">

              <!-- Hashtags Bar -->
              <div class="space-y-2">
                <span class="block text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">แฮชแท็ก</span>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="tag in availableTags"
                    :key="tag"
                    class="cursor-pointer rounded-full border px-3 py-1 text-[11px] font-semibold transition-all duration-200"
                    :class="selectedTag === tag
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white hover:bg-neutral-50 text-neutral-500 border-black/10'"
                    @click="toggleTag(tag)"
                  >
                    #{{ tag }}
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </section>

      <!-- Gallery Grid & States Section -->
      <section class="px-4 sm:px-5 lg:px-8">
        <div class="mx-auto w-full max-w-[1280px]">
          <!-- ===== Loading State ===== -->
          <div
            v-if="loading"
            class="py-24 text-center"
          >
            <div class="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-4" />
            <p class="text-gray-400 text-sm font-medium">
              กำลังโหลดผลงานแกลเลอรี...
            </p>
          </div>

          <!-- ===== Error State ===== -->
          <div
            v-else-if="error"
            class="py-16 text-center max-w-md mx-auto"
          >
            <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                class="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0112 0z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-red-600 mb-1">
              ไม่สามารถโหลดแกลเลอรีได้
            </h3>
            <p class="text-gray-500 text-sm mb-4">
              {{ error }}
            </p>
            <button
              class="coos-button-dark cursor-pointer px-5 py-2.5"
              @click="loadData"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>

          <!-- ===== Empty State ===== -->
          <div
            v-else-if="filteredImages.length === 0"
            class="py-24 text-center"
          >
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-black/10 bg-white text-2xl font-black text-black">
              CO
            </div>
            <h3 class="text-lg font-bold text-gray-700 mb-1">
              ไม่พบรูปภาพผลงาน
            </h3>
            <p class="text-gray-400 text-sm">
              ไม่พบรูปภาพที่ตรงกับการค้นหาหรือตัวกรองนี้
            </p>
          </div>

          <!-- ===== Gallery Grid ===== -->
          <div
            v-else
            class="space-y-12"
          >
            <!-- 4-Column Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              <div
                v-for="img in displayedImages"
                :key="img.imageId"
              >
                <GalleryImageCard
                  :img="img"
                  @view-details="openDetails"
                />
              </div>
            </div>

            <!-- NUMBERED PAGINATION -->
            <div
              v-if="totalPages > 1"
              class="flex justify-center items-center gap-2 pt-6 pb-12"
            >
              <button
                class="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="currentPage === 1"
                @click="goToPage(currentPage - 1)"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                v-for="page in totalPages"
                :key="page"
                class="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-medium transition-all"
                :class="currentPage === page
                  ? 'bg-black text-white shadow-sm'
                  : 'text-neutral-600 hover:bg-neutral-100'"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>

              <button
                class="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
                :disabled="currentPage === totalPages"
                @click="goToPage(currentPage + 1)"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Details Modal -->
    <GalleryDetailsModal
      :img="selectedImage"
      :is-open="isDetailsModalOpen"
      variant="gallery"
      @close="isDetailsModalOpen = false"
    />
  </div>
</template>

<style scoped>
.gallery-grid {
  background-size: 48px 48px;
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.025) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.025) 1px, transparent 1px);
}
 
/* Scoped Glass UI Styling overrides over the visual image background */

/* ========================================================
   PROGRESSIVE TOP BLUR
   ======================================================== */
.progressive-blur-layer {
  backdrop-filter: blur(22px) saturate(1.08);
  -webkit-backdrop-filter: blur(22px) saturate(1.08);
  background: rgba(250, 249, 247, 0.12);
  mask-image: linear-gradient(
    to bottom,
    #000 0%,
    rgba(0,0,0,0.98) 18%,
    rgba(0,0,0,0.78) 45%,
    rgba(0,0,0,0.38) 72%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0%,
    rgba(0,0,0,0.98) 18%,
    rgba(0,0,0,0.78) 45%,
    rgba(0,0,0,0.38) 72%,
    transparent 100%
  );
}
 
.progressive-blur-layer::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(250, 249, 247, 0.22), rgba(250, 249, 247, 0.06) 55%, transparent);
  pointer-events: none;
}

/* Search & Filter glass panel (Medium Glass) */
.coos-panel {
  background-color: rgba(255, 255, 255, 0.68) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.04) !important;
  border-radius: 24px !important;
}

/* Category & Tag Buttons (Very Light Glass) */
button.border-black\/10 {
  background-color: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
}

button.border-black\/10:hover {
  background-color: rgba(255, 255, 255, 0.6) !important;
}

/* Sort Select dropdown */
select.border-black\/10 {
  background-color: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}
select.border-black\/10:hover {
  background-color: rgba(255, 255, 255, 0.6) !important;
}

/* Gallery Cards (Light Glass) targeting class structure in ImageCard.vue without editing it */
:deep(.coos-card.group) {
  background-color: rgba(255, 255, 255, 0.58) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.03) !important;
  padding: 12px !important;
  border-radius: 24px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}
:deep(.coos-card.group:hover) {
  transform: translateY(-4px) !important;
  background-color: rgba(255, 255, 255, 0.75) !important;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.07) !important;
  border-color: rgba(255, 255, 255, 0.8) !important;
}

/* Gallery Card inner tag chips & buttons */
:deep(.coos-card.group .border-black\/5.bg-neutral-50) {
  background-color: rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(2px) !important;
  -webkit-backdrop-filter: blur(2px) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}
:deep(.coos-card.group .border-black\/5.bg-neutral-50:hover) {
  background-color: rgba(255, 255, 255, 0.5) !important;
}
:deep(.coos-card.group button.border-black\/10) {
  background-color: rgba(255, 255, 255, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}
:deep(.coos-card.group button.border-black\/10:hover) {
  background-color: rgba(255, 255, 255, 0.6) !important;
}

/* Load More button (Light/Medium Glass) */
.coos-button-light {
  background-color: rgba(255, 255, 255, 0.5) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03) !important;
  border-radius: 12px !important;
}
.coos-button-light:hover {
  background-color: rgba(255, 255, 255, 0.7) !important;
  border-color: rgba(255, 255, 255, 0.6) !important;
}

/* Divider Line */
hr.border-black\/5 {
  border-color: rgba(255, 255, 255, 0.2) !important;
}
</style>
