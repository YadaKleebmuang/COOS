<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

const { alert } = useAlert()

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
    alert("แจ้งเตือน", "เกิดข้อผิดพลาดในการลบรูปภาพ: " + error.message, "error")
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
    alert("แจ้งเตือน", "เกิดข้อผิดพลาด: " + error.message, "error")
  }
}

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "คลังรูปภาพ" }]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-lg font-black text-[#171717] tracking-tight">คลังรูปภาพ</h1>
        <p class="mt-0.5 text-xs text-[#9A9A95]">ภาพที่ลูกค้าอนุญาตให้นำขึ้นแสดงใน Gallery สาธารณะ</p>
      </div>
      <div class="flex gap-2">
        <AdminActionButton variant="secondary" size="sm" :loading="loading" icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" @click="fetchGallery">รีเฟรช</AdminActionButton>
        <AdminActionButton variant="primary" size="sm" icon="M12 4v16m8-8H4" @click="openUploadModal">เพิ่มรูปภาพ</AdminActionButton>
      </div>
    </div>

    <!-- Filters Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center gap-4 justify-between bg-white border border-[#EFEFEA]/60 rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search -->
        <div class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-[#171717]/30 transition-all">
          <svg class="w-4 h-4 text-[#9A9A95]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อภาพ..." class="text-xs text-[#171717] bg-transparent outline-none w-40 placeholder:text-[#9A9A95] font-medium"/>
        </div>
        <!-- Hashtag -->
        <div class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-[#171717]/30 transition-all">
          <span class="text-[#9A9A95] text-xs font-bold">#</span>
          <input v-model="hashtagFilter" type="text" placeholder="แฮชแท็ก..." class="text-xs text-[#171717] bg-transparent outline-none w-28 placeholder:text-[#9A9A95] font-medium"/>
        </div>
        <!-- Category filter -->
        <AdminFilterBar v-model="categoryFilter" :filters="categories" />
        <!-- Visibility -->
        <AdminFilterBar v-model="visibilityFilter" :filters="[{ key: 'all', label: 'ทั้งหมด' }, { key: 'public', label: 'สาธารณะ' }, { key: 'private', label: 'ส่วนตัว' }]" />
      </div>
    </div>

    <!-- Stats bar -->
    <div class="flex gap-4 text-xs text-[#9A9A95] font-semibold bg-white border border-[#EFEFEA]/60 rounded-xl p-3 inline-flex">
      <span>ทั้งหมด: <strong class="text-[#171717] font-bold">{{ images.length }}</strong> ภาพ</span>
      <span class="text-[#EFEFEA]">|</span>
      <span>สาธารณะ: <strong class="text-emerald-600 font-bold">{{ images.filter(i => i.isPublic).length }}</strong></span>
      <span class="text-[#EFEFEA]">|</span>
      <span>ส่วนตัว: <strong class="text-[#9A9A95] font-bold">{{ images.filter(i => !i.isPublic).length }}</strong></span>
    </div>

    <!-- Loading skeletons -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <div v-for="i in 12" :key="i" class="bg-white border border-[#EFEFEA] rounded-2xl p-2.5 space-y-3 shadow-[0_4px_12px_rgba(0,0,0,0.005)] animate-pulse">
        <div class="aspect-square bg-[#F7F7F5] rounded-xl w-full" />
        <div class="h-3 bg-[#F7F7F5] rounded w-3/4" />
        <div class="h-2.5 bg-[#F7F7F5] rounded w-1/2" />
      </div>
    </div>

    <!-- Gallery grid -->
    <div v-else-if="filteredImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <div
        v-for="img in filteredImages"
        :key="img.imageId"
        class="bg-white border border-[#EFEFEA]/60 rounded-2xl overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:border-[#171717]/10 transition-all flex flex-col"
      >
        <!-- Thumbnail -->
        <div class="aspect-square bg-[#F7F7F5]/50 flex items-center justify-center border-b border-[#EFEFEA]/40 relative overflow-hidden">
          <img v-if="img.thumbnailUrl" :src="img.thumbnailUrl" class="w-full h-full object-cover select-none" />
          <svg v-else class="w-10 h-10 text-[#D4D4D0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <!-- Visibility badge -->
          <div class="absolute top-2 right-2">
            <span
              class="text-[9px] font-bold px-1.5 py-0.5 rounded-lg border shadow-sm select-none"
              :class="img.isPublic ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-[#9A9A95] border-[#EFEFEA]'"
            >
              {{ img.isPublic ? "Public" : "Private" }}
            </span>
          </div>
          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-[#171717]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
            <button @click="toggleVisibility(img)" aria-label="Toggle visibility" class="p-2 bg-white hover:bg-[#F7F7F5] rounded-xl transition-colors shadow-lg" title="สลับการแสดงผล">
              <svg class="w-4 h-4 text-[#171717]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
            <button @click="deleteDialog = { open: true, loading: false, imageId: img.imageId }" aria-label="Delete image" class="p-2 bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg" title="ลบภาพ">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
        <!-- Info -->
        <div class="p-3 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <p class="text-xs font-bold text-[#171717] truncate" :title="img.title">{{ img.title }}</p>
            <p class="text-[10px] font-semibold text-[#9A9A95] mt-0.5">{{ img.category }}</p>
          </div>
          <div v-if="img.hashtags.length" class="flex flex-wrap gap-1">
            <span v-for="tag in img.hashtags.slice(0, 3)" :key="tag" class="text-[9px] font-semibold bg-[#F7F7F5] text-[#666660] border border-[#EFEFEA] px-1.5 py-0.5 rounded-md">#{{ tag }}</span>
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
      message="คุณต้องการลบภาพนี้ออกจาก Gallery ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
      confirm-label="ลบภาพ"
      :danger="true"
      :loading="deleteDialog.loading"
      @confirm="confirmDelete"
      @cancel="deleteDialog.open = false"
    />

    <!-- ── Upload Modal ─────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="uploadModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" @click="uploadModal = false" />

          <!-- Modal Card -->
          <div class="relative bg-white/90 backdrop-blur-[15px] rounded-[24px] shadow-2xl border border-[#EFEFEA]/80 w-full max-w-md p-6">
            <!-- Modal Header -->
            <h3 class="text-base font-black text-[#171717] tracking-tight mb-1">เพิ่มรูปภาพใหม่ในแกลเลอรี</h3>
            <p class="text-xs text-[#9A9A95] pb-3 border-b border-[#EFEFEA]/60">อัปโหลดผลงานและข้อมูลประกอบเพื่อนำเสนอในแกลเลอรีสาธารณะ</p>

            <form @submit.prevent="submitUpload" class="space-y-4 mt-5">
              <!-- File Upload Zone -->
              <div class="border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer"
                   :class="uploadFile ? 'border-emerald-300 bg-emerald-50/30' : 'border-[#EFEFEA] hover:border-[#171717]/20 bg-[#F7F7F5]/50'">
                <input id="gallery-upload-input" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                <label for="gallery-upload-input" class="cursor-pointer block">
                  <template v-if="uploadFile">
                    <svg class="w-8 h-8 text-emerald-500 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-xs font-bold text-[#171717] truncate max-w-[280px] mx-auto">{{ uploadFile.name }}</p>
                    <p class="text-[10px] text-[#9A9A95] mt-1 font-semibold">คลิกเพื่อเปลี่ยนไฟล์</p>
                  </template>
                  <template v-else>
                    <svg class="w-8 h-8 text-[#D4D4D0] mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                    <p class="text-xs font-bold text-[#171717]">คลิกเพื่อเลือกรูปภาพ</p>
                    <p class="text-[10px] text-[#9A9A95] mt-1 font-semibold">PNG, JPG ขนาดไม่เกิน 10MB</p>
                  </template>
                </label>
              </div>

              <!-- Form Fields -->
              <div class="space-y-4">
                <!-- WorkType (required) -->
                <div>
                  <label class="block text-xs font-bold text-[#666660] mb-1.5">
                    ประเภทงาน *
                  </label>
                  <select
                    v-model="uploadForm.workTypeId"
                    required
                    class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717]"
                  >
                    <option value="">-- เลือกประเภทงาน --</option>
                    <option v-for="wt in workTypes" :key="wt.workTypeId" :value="String(wt.workTypeId)">
                      {{ wt.workTypeName }}
                    </option>
                  </select>
                </div>

                <!-- Title -->
                <div>
                  <label class="block text-xs font-bold text-[#666660] mb-1.5">ชื่อภาพ</label>
                  <input
                    v-model="uploadForm.imageTitle"
                    type="text"
                    placeholder="เช่น Pre-wedding Lookbook 2025"
                    class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717] placeholder:text-[#9A9A95]"
                  />
                </div>

                <!-- Tags -->
                <div>
                  <label class="block text-xs font-bold text-[#666660] mb-1.5">
                    แฮชแท็ก <span class="text-[#9A9A95] font-semibold">(คั่นด้วยจุลภาค)</span>
                  </label>
                  <input
                    v-model="uploadForm.imageTags"
                    type="text"
                    placeholder="เช่น prewedding, outdoor, nature"
                    class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717] placeholder:text-[#9A9A95]"
                  />
                </div>
              </div>

              <!-- Error Message -->
              <p v-if="uploadError" class="text-xs text-red-600 bg-red-50/50 border border-red-100 rounded-xl px-3 py-2.5 font-semibold">
                {{ uploadError }}
              </p>

              <!-- Footer Buttons -->
              <div class="flex gap-2 justify-end pt-4 border-t border-[#EFEFEA]/60 mt-6">
                <AdminActionButton variant="secondary" size="md" @click="uploadModal = false">ยกเลิก</AdminActionButton>
                <button
                  type="submit"
                  :disabled="uploadLoading"
                  class="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-[#171717] hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl border border-[#171717]"
                >
                  <svg v-if="uploadLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span v-if="uploadLoading">กำลังอัปโหลด...</span>
                  <span v-else>อัปโหลดรูปภาพ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
