<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

// ── Types ──────────────────────────────────────────────────────
interface GalleryImage {
  imageId: number
  title: string
  category: string
  hashtags: string[]
  thumbnailUrl: string
  isPublic: boolean
  createdAt: string
}

interface WorkType {
  workTypeId: number
  workTypeName: string
}

// ── State ──────────────────────────────────────────────────────
const images = ref<GalleryImage[]>([])
const loading = ref(true)
const searchQuery = ref("")
const categoryFilter = ref("all")
const hashtagFilter = ref("")
const visibilityFilter = ref("all")
const deleteDialog = ref({ open: false, loading: false, imageId: 0 })

// Upload Modal State
const uploadModal = ref(false)
const workTypes = ref<WorkType[]>([])
const uploadForm = ref({ workTypeId: "", imageTitle: "", imageTags: "" })
const uploadFile = ref<File | null>(null)
const uploadLoading = ref(false)
const uploadError = ref("")

// ── Fetch ──────────────────────────────────────────────────────
const fetchGallery = async () => {
  loading.value = true
  try {
    const { apiFetch } = useApi()
    // [Fix] ?all=true ให้ admin เห็นทุกรูปรวมที่ hidden อยู่ด้วย
    const data = await apiFetch<any[]>("/gallery-images?all=true")
    images.value = data.map(img => ({
      imageId: img.imageId,
      title: img.imageTitle || "ไม่มีชื่อภาพ",
      category: img.workTypeName || "ไม่มีหมวดหมู่",
      hashtags: img.imageTags ? img.imageTags.split(",").map((t: string) => t.trim()) : [],
      thumbnailUrl: img.imageUrl,
      isPublic: img.imageIsActive === 1,
      createdAt: img.imageCreatedAt
    }))
  } finally {
    loading.value = false
  }
}

const fetchWorkTypes = async () => {
  try {
    const { apiFetch } = useApi()
    workTypes.value = await apiFetch<WorkType[]>("/work-types")
  } catch {}
}

onMounted(() => {
  fetchGallery()
  fetchWorkTypes()
})

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

// ── Upload ─────────────────────────────────────────────────────
const openUploadModal = () => {
  uploadForm.value = { workTypeId: "", imageTitle: "", imageTags: "" }
  uploadFile.value = null
  uploadError.value = ""
  uploadModal.value = true
}

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  uploadFile.value = input.files?.[0] || null
}

const submitUpload = async () => {
  if (!uploadFile.value) { uploadError.value = "กรุณาเลือกรูปภาพ"; return }
  if (!uploadForm.value.workTypeId) { uploadError.value = "กรุณาเลือกประเภทงาน"; return }

  uploadLoading.value = true
  uploadError.value = ""
  try {
    const { apiFetch } = useApi()
    const formData = new FormData()
    formData.append("image", uploadFile.value)
    formData.append("workTypeId", uploadForm.value.workTypeId)
    if (uploadForm.value.imageTitle) formData.append("imageTitle", uploadForm.value.imageTitle)
    if (uploadForm.value.imageTags) formData.append("imageTags", uploadForm.value.imageTags)

    // ไม่ set Content-Type — browser จะ set multipart/form-data + boundary อัตโนมัติ
    await apiFetch("/gallery-images", { method: "POST", body: formData })
    uploadModal.value = false
    await fetchGallery()
  } catch (err: any) {
    uploadError.value = err.message || "เกิดข้อผิดพลาดในการอัปโหลด"
  } finally {
    uploadLoading.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────
const confirmDelete = async () => {
  deleteDialog.value.loading = true
  try {
    const { apiFetch } = useApi()
    await apiFetch(`/gallery-images/${deleteDialog.value.imageId}`, { method: "DELETE" })
    images.value = images.value.filter(i => i.imageId !== deleteDialog.value.imageId)
    deleteDialog.value.open = false
  } catch (error: any) {
    alert("เกิดข้อผิดพลาดในการลบรูปภาพ: " + error.message)
  } finally {
    deleteDialog.value.loading = false
  }
}

const toggleVisibility = async (image: GalleryImage) => {
  try {
    const { apiFetch } = useApi()
    await apiFetch(`/gallery-images/${image.imageId}/toggle`, { method: "PATCH" })
    image.isPublic = !image.isPublic
  } catch (error: any) {
    alert("เกิดข้อผิดพลาด: " + error.message)
  }
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
        <!-- [Fix] เพิ่ม @click handler -->
        <AdminActionButton variant="primary" size="sm" icon="M12 4v16m8-8H4" @click="openUploadModal">เพิ่มรูปภาพ</AdminActionButton>
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
        <!-- Thumbnail -->
        <div class="aspect-square bg-gray-50 flex items-center justify-center border-b border-gray-100 relative overflow-hidden">
          <img v-if="img.thumbnailUrl" :src="img.thumbnailUrl" class="w-full h-full object-cover" />
          <svg v-else class="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <button @click="toggleVisibility(img)" aria-label="Toggle visibility" class="p-1.5 bg-white rounded-lg" title="สลับการแสดงผล">
              <svg class="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
            <button @click="deleteDialog = { open: true, loading: false, imageId: img.imageId }" aria-label="Delete image" class="p-1.5 bg-red-600 rounded-lg" title="ลบภาพ">
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
    <AdminConfirmDialog
      :open="deleteDialog.open"
      title="ลบรูปภาพ"
      message="คุณต้องการลบภาพนี้ออกจาก Gallery ใช่หรือไม่?"
      confirm-label="ลบภาพ"
      :danger="true"
      :loading="deleteDialog.loading"
      @confirm="confirmDelete"
      @cancel="deleteDialog.open = false"
    />

    <!-- ── Upload Modal ─────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="uploadModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="uploadModal = false" />

        <!-- Modal Card -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">

          <!-- Modal Header -->
          <div class="flex items-center justify-between">
            <h2 class="text-base font-bold text-gray-900">เพิ่มรูปภาพใน Gallery</h2>
            <button @click="uploadModal = false" aria-label="Close modal" class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- File Upload Zone -->
          <div class="border-2 border-dashed rounded-xl p-5 text-center transition-colors"
               :class="uploadFile ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-400'">
            <input id="gallery-upload-input" type="file" accept="image/*" class="hidden" @change="onFileChange" />
            <label for="gallery-upload-input" class="cursor-pointer block">
              <template v-if="uploadFile">
                <svg class="w-8 h-8 text-green-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <p class="text-sm font-medium text-gray-800">{{ uploadFile.name }}</p>
                <p class="text-xs text-gray-400 mt-0.5">คลิกเพื่อเปลี่ยนไฟล์</p>
              </template>
              <template v-else>
                <svg class="w-8 h-8 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p class="text-sm text-gray-500">คลิกเพื่อเลือกรูปภาพ</p>
                <p class="text-xs text-gray-400 mt-0.5">PNG, JPG ขนาดไม่เกิน 10MB</p>
              </template>
            </label>
          </div>

          <!-- Form Fields -->
          <div class="space-y-3">
            <!-- WorkType (required) -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                ประเภทงาน <span class="text-red-500">*</span>
              </label>
              <select
                v-model="uploadForm.workTypeId"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">-- เลือกประเภทงาน --</option>
                <option v-for="wt in workTypes" :key="wt.workTypeId" :value="String(wt.workTypeId)">
                  {{ wt.workTypeName }}
                </option>
              </select>
            </div>

            <!-- Title -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อภาพ</label>
              <input
                v-model="uploadForm.imageTitle"
                type="text"
                placeholder="เช่น Pre-wedding Lookbook 2025"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                แฮชแท็ก <span class="text-gray-400 font-normal">(คั่นด้วยจุลภาค)</span>
              </label>
              <input
                v-model="uploadForm.imageTags"
                type="text"
                placeholder="เช่น prewedding, outdoor, nature"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Error Message -->
          <p v-if="uploadError" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {{ uploadError }}
          </p>

          <!-- Footer Buttons -->
          <div class="flex gap-2 pt-1">
            <button
              @click="uploadModal = false"
              class="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              @click="submitUpload"
              :disabled="uploadLoading"
              class="flex-1 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="uploadLoading">กำลังอัปโหลด...</span>
              <span v-else>อัปโหลดรูปภาพ</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
