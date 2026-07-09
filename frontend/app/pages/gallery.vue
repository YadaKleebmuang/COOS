<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import type { WorkType } from "~/types/order.types"

definePageMeta({
  layout: "default"
})

const token = useCookie<string | null>("token")
const router = useRouter()
const { apiFetch } = useApi()

// --- Auth & User State ---
const currentUser = ref<any>(null)
const checkAuth = async () => {
  if (token.value) {
    try {
      const data = await apiFetch<any>("/users/me")
      currentUser.value = data
    } catch (err) {
      console.error("Auth check failed:", err)
      token.value = null // Clear invalid token
      currentUser.value = null
    }
  }
}

// --- Gallery & Category State ---
const images = ref<any[]>([])
const workTypes = ref<WorkType[]>([])
const loading = ref(false)
const error = ref("")

const selectedImage = ref<any>(null)
const isDetailsModalOpen = ref(false)

const openDetails = (img: any) => {
  selectedImage.value = img
  isDetailsModalOpen.value = true
}

// Search, Filter & Tag State
const search = ref("")
const selectedWorkTypeId = ref<number | null>(null) // null means "ทั้งหมด"
const selectedTag = ref<string | null>(null)
const sortBy = ref("newest") // newest, oldest
const displayLimit = ref(9) // Number of images to display initially (multiple of 3)

const availableTags = [
  "minimal",
  "portrait",
  "graduation",
  "prewedding",
  "family",
  "softtone",
  "blackwhite",
  "cleanstyle"
]

const toggleTag = (tag: string) => {
  if (selectedTag.value === tag) {
    selectedTag.value = null
  } else {
    selectedTag.value = tag
  }
}

const loadData = async () => {
  loading.value = true
  error.value = ""
  try {
    const [imgData, wtData] = await Promise.all([
      apiFetch<any[]>("/gallery-images"),
      apiFetch<WorkType[]>("/work-types").catch(() => []),
    ])
    images.value = imgData

    if (wtData && wtData.length > 0) {
      workTypes.value = wtData.filter(wt => wt.workTypeIsActive === 1)
    } else {
      // Fallback categories matching mockup design
      workTypes.value = [
        { workTypeId: 1, workTypeName: "Pre-wedding", workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() },
        { workTypeId: 2, workTypeName: "รับปริญญา", workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() },
        { workTypeId: 3, workTypeName: "Portrait", workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() },
        { workTypeId: 4, workTypeName: "ครอบครัว", workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() },
        { workTypeId: 5, workTypeName: "อื่น ๆ", workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() },
      ]
    }
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถโหลดข้อมูลแกลเลอรีได้"
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
      img.imageTitle?.toLowerCase().includes(query) ||
      img.imageDescription?.toLowerCase().includes(query) ||
      img.imageTags?.toLowerCase().includes(query) ||
      img.workTypeName?.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  const sorted = [...result]
  if (sortBy.value === "oldest") {
    return sorted.reverse()
  }

  return sorted
})

// --- Category Tabs ---
const categoryTabs = computed(() => {
  return [
    { id: null, name: "ทั้งหมด" },
    ...workTypes.value.map(wt => ({ 
      id: wt.workTypeId, 
      name: wt.workTypeName.replace(/\s*\(.*\)/, '') // Clean up text, e.g. "ครอบครัว (Family)" -> "ครอบครัว"
    }))
  ]
})

// --- Paginated Images ---
const displayedImages = computed(() => {
  return filteredImages.value.slice(0, displayLimit.value)
})

const hasMore = computed(() => {
  return filteredImages.value.length > displayLimit.value
})

const loadMore = () => {
  displayLimit.value += 6
}
</script>

<template>
  <div class="bg-white min-h-screen">
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      <!-- Search & Filters Container -->
      <div class="space-y-6 text-left">
        <!-- Search bar & Sort dropdown -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative flex-1 min-w-[280px] max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              v-model="search"
              type="text"
              placeholder="ค้นหาผลงาน เช่น portrait, รับปริญญา"
              class="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-gray-700 placeholder-gray-400 transition-all text-xs"
            />
          </div>
          
          <select
            v-model="sortBy"
            class="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-900 cursor-pointer shadow-sm hover:bg-gray-50 transition-colors"
          >
            <option value="newest">อัปเดตล่าสุด</option>
            <option value="oldest">อัปเดตเก่าสุด</option>
          </select>
        </div>

        <!-- Category Tabs -->
        <div class="flex flex-wrap items-center gap-2 pt-2">
          <button
            v-for="tab in categoryTabs"
            :key="tab.id ?? 'all'"
            @click="selectedWorkTypeId = tab.id"
            class="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border cursor-pointer"
            :class="selectedWorkTypeId === tab.id
              ? 'bg-black text-white border-black shadow-sm'
              : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'"
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- Divider Line -->
        <hr class="border-gray-100" />

        <!-- Hashtags Bar -->
        <div class="space-y-2.5">
          <span class="text-xs text-gray-400 font-bold uppercase tracking-wider block">แฮชแท็ก</span>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tag in availableTags"
              :key="tag"
              @click="toggleTag(tag)"
              class="px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer"
              :class="selectedTag === tag
                ? 'bg-black text-white border-black shadow-sm'
                : 'bg-white hover:bg-gray-50 text-gray-500 border-gray-200'"
            >
              #{{ tag }}
            </button>
          </div>
        </div>
      </div>

      <!-- ===== Loading State ===== -->
      <div v-if="loading" class="py-24 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-4"></div>
        <p class="text-gray-400 text-sm font-medium">กำลังโหลดผลงานแกลเลอรี...</p>
      </div>

      <!-- ===== Error State ===== -->
      <div v-else-if="error" class="py-16 text-center max-w-md mx-auto">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-red-600 mb-1">ไม่สามารถโหลดแกลเลอรีได้</h3>
        <p class="text-gray-500 text-sm mb-4">{{ error }}</p>
        <button @click="loadData" class="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl transition text-sm cursor-pointer">
          ลองใหม่อีกครั้ง
        </button>
      </div>

      <!-- ===== Empty State ===== -->
      <div v-else-if="filteredImages.length === 0" class="py-24 text-center">
        <div class="text-5xl mb-4">🖼️</div>
        <h3 class="text-lg font-bold text-gray-700 mb-1">ไม่พบรูปภาพผลงาน</h3>
        <p class="text-gray-400 text-sm">ไม่พบรูปภาพที่ตรงกับการค้นหาหรือตัวกรองนี้</p>
      </div>

      <!-- ===== Gallery Grid ===== -->
      <div v-else class="space-y-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="img in displayedImages"
            :key="img.imageId"
          >
            <GalleryImageCard :img="img" @view-details="openDetails" />
          </div>
        </div>

        <!-- LOAD MORE BUTTON -->
        <div v-if="hasMore" class="flex justify-center pt-4">
          <button
            @click="loadMore"
            class="px-6 py-2.5 border border-gray-200 hover:border-gray-900 text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-xl font-bold text-xs transition-all duration-300 focus:outline-none cursor-pointer shadow-sm"
          >
            โหลดเพิ่มเติม
          </button>
        </div>
      </div>

    </main>

    <!-- Details Modal -->
    <GalleryDetailsModal :img="selectedImage" :is-open="isDetailsModalOpen" @close="isDetailsModalOpen = false" />
  </div>
</template>
