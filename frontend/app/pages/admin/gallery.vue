<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

// ── Types ──────────────────────────────────────────────────────
interface GalleryImage {
  imageId: number
  orderId: number
  title: string
  category: string
  hashtags: string[]
  thumbnailUrl: string
  isPublic: boolean
  createdAt: string
}

// ── Mock data ──────────────────────────────────────────────────
const mockImages: GalleryImage[] = [
  { imageId: 1, orderId: 1001, title: "Portrait Realistic Style", category: "Realistic", hashtags: ["portrait", "realistic"], thumbnailUrl: "", isPublic: true, createdAt: "2025-06-20" },
  { imageId: 2, orderId: 1002, title: "Anime Character Art", category: "Anime", hashtags: ["anime", "character"], thumbnailUrl: "", isPublic: true, createdAt: "2025-06-19" },
  { imageId: 3, orderId: 1003, title: "Watercolor Landscape", category: "Watercolor", hashtags: ["watercolor", "nature"], thumbnailUrl: "", isPublic: false, createdAt: "2025-06-18" },
  { imageId: 4, orderId: 1004, title: "Fantasy Portrait", category: "Realistic", hashtags: ["fantasy", "portrait"], thumbnailUrl: "", isPublic: true, createdAt: "2025-06-17" },
  { imageId: 5, orderId: 1005, title: "Chibi Character", category: "Anime", hashtags: ["chibi", "cute"], thumbnailUrl: "", isPublic: true, createdAt: "2025-06-16" },
  { imageId: 6, orderId: 1006, title: "Abstract Art", category: "Abstract", hashtags: ["abstract", "art"], thumbnailUrl: "", isPublic: false, createdAt: "2025-06-15" },
]

// ── State ──────────────────────────────────────────────────────
const images = ref<GalleryImage[]>([])
const loading = ref(true)
const searchQuery = ref("")
const categoryFilter = ref("all")
const hashtagFilter = ref("")
const visibilityFilter = ref("all")
const deleteDialog = ref({ open: false, loading: false, imageId: 0 })

// ── Fetch ──────────────────────────────────────────────────────
const fetchGallery = async () => {
  loading.value = true
  try {
    // Future: const data = await apiFetch("/gallery")
    await new Promise(r => setTimeout(r, 400))
    images.value = mockImages
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchGallery())

// ── Filters ────────────────────────────────────────────────────
const categories = computed(() => {
  const cats = [...new Set(images.value.map(i => i.category))]
  return [{ key: "all", label: "ทุกหมวด" }, ...cats.map(c => ({ key: c, label: c }))]
})

const filteredImages = computed(() => {
  let result = images.value
  if (categoryFilter.value !== "all") result = result.filter(i => i.category === categoryFilter.value)
  if (visibilityFilter.value === "public") result = result.filter(i => i.isPublic)
  if (visibilityFilter.value === "private") result = result.filter(i => !i.isPublic)
  const q = searchQuery.value.toLowerCase()
  if (q) result = result.filter(i => i.title.toLowerCase().includes(q) || i.hashtags.some(h => h.includes(q)))
  const hq = hashtagFilter.value.toLowerCase().trim()
  if (hq) result = result.filter(i => i.hashtags.some(h => h.includes(hq)))
  return result
})

// ── Delete ─────────────────────────────────────────────────────
const confirmDelete = async () => {
  deleteDialog.value.loading = true
  try {
    // Future: await apiFetch(`/gallery/${deleteDialog.value.imageId}`, { method: "DELETE" })
    await new Promise(r => setTimeout(r, 400))
    images.value = images.value.filter(i => i.imageId !== deleteDialog.value.imageId)
    deleteDialog.value.open = false
  } finally {
    deleteDialog.value.loading = false
  }
}

const toggleVisibility = async (image: GalleryImage) => {
  // Future: await apiFetch(`/gallery/${image.imageId}`, { method: "PATCH", body: JSON.stringify({ isPublic: !image.isPublic }) })
  image.isPublic = !image.isPublic
}

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "คลังรูปภาพ" }]
</script>

<template>
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">จัดการคลังรูปภาพ</h1>
        <p class="mt-0.5 text-sm text-gray-500">ภาพที่ลูกค้าอนุญาตให้นำขึ้นแสดงใน Gallery สาธารณะ</p>
      </div>
      <div class="flex gap-2">
        <AdminActionButton variant="secondary" size="sm" :loading="loading" @click="fetchGallery">รีเฟรช</AdminActionButton>
        <AdminActionButton variant="primary" size="sm" icon="M12 4v16m8-8H4">เพิ่มรูปภาพ</AdminActionButton>
      </div>
    </div>

    <!-- Filters row -->
    <div class="flex flex-wrap gap-3 items-center">
      <!-- Search -->
      <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อภาพ..." class="text-sm text-gray-700 bg-transparent outline-none w-40 placeholder:text-gray-400"/>
      </div>
      <!-- Hashtag -->
      <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
        <span class="text-gray-400 text-sm">#</span>
        <input v-model="hashtagFilter" type="text" placeholder="แฮชแท็ก..." class="text-sm text-gray-700 bg-transparent outline-none w-28 placeholder:text-gray-400"/>
      </div>
      <!-- Category filter -->
      <AdminFilterBar v-model="categoryFilter" :filters="categories" />
      <!-- Visibility -->
      <AdminFilterBar v-model="visibilityFilter" :filters="[{ key: 'all', label: 'ทั้งหมด' }, { key: 'public', label: 'สาธารณะ' }, { key: 'private', label: 'ส่วนตัว' }]" />
    </div>

    <!-- Stats bar -->
    <div class="flex gap-4 text-xs text-gray-500">
      <span>ทั้งหมด: <strong class="text-gray-900">{{ images.length }}</strong> ภาพ</span>
      <span>สาธารณะ: <strong class="text-gray-900">{{ images.filter(i => i.isPublic).length }}</strong></span>
      <span>ส่วนตัว: <strong class="text-gray-900">{{ images.filter(i => !i.isPublic).length }}</strong></span>
    </div>

    <!-- Loading skeletons -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <div v-for="i in 6" :key="i" class="bg-gray-100 rounded-xl aspect-square animate-pulse" />
    </div>

    <!-- Gallery grid -->
    <div v-else-if="filteredImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <div
        v-for="img in filteredImages"
        :key="img.imageId"
        class="bg-white border border-gray-200 rounded-xl overflow-hidden group hover:shadow-md transition-shadow"
      >
        <!-- Thumbnail placeholder -->
        <div class="aspect-square bg-gray-50 flex items-center justify-center border-b border-gray-100 relative overflow-hidden">
          <svg class="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <!-- Visibility badge -->
          <div class="absolute top-2 right-2">
            <span
              class="text-[9px] font-medium px-1.5 py-0.5 rounded border"
              :class="img.isPublic ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'"
            >
              {{ img.isPublic ? "Public" : "Private" }}
            </span>
          </div>
          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button @click="toggleVisibility(img)" class="p-1.5 bg-white rounded-lg">
              <svg class="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
            <button @click="deleteDialog = { open: true, loading: false, imageId: img.imageId }" class="p-1.5 bg-red-600 rounded-lg">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
        <!-- Info -->
        <div class="p-2.5">
          <p class="text-xs font-medium text-gray-800 truncate">{{ img.title }}</p>
          <p class="text-[10px] text-gray-400 mt-0.5">{{ img.category }}</p>
          <div class="flex flex-wrap gap-1 mt-1.5">
            <span v-for="tag in img.hashtags.slice(0, 2)" :key="tag" class="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">#{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <AdminEmptyState v-else title="ไม่พบรูปภาพ" description="ไม่มีรูปภาพที่ตรงกับเงื่อนไขที่เลือก" icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>

    <!-- Delete confirm -->
    <AdminConfirmDialog :open="deleteDialog.open" title="ลบรูปภาพ" message="คุณต้องการลบภาพนี้ออกจาก Gallery ใช่หรือไม่?" confirm-label="ลบภาพ" :danger="true" :loading="deleteDialog.loading" @confirm="confirmDelete" @cancel="deleteDialog.open = false"/>
  </div>
</template>
