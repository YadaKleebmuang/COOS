<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"

const { alert } = useAlert()

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

interface GalleryImage {
  imageId: number
  title: string
  category: string
  hashtags: string[]
  status: 'pending' | 'public' | 'private'
  createdAt: string
}

interface Tag {
  tagId: number
  tagName: string
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
const { protectedAssetUrl, syncProtectedAssets } = useProtectedAsset()
const galleryMediaEndpoint = (imageId: number) => `/media/gallery/${imageId}`

watch(
  () => images.value.map(image => image.imageId),
  ids => syncProtectedAssets(ids.map(galleryMediaEndpoint)),
  { immediate: true }
)

// Upload Modal State
const uploadModal = ref(false)
const workTypes = ref<WorkType[]>([])
const allTags = ref<Tag[]>([])
const uploadForm = ref({ workTypeId: "", imageTitle: "", tagIds: [] as number[] })
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
    images.value = data.map(img => {
      let currentStatus: 'pending' | 'public' | 'private' = 'private';
      if (img.imageApprovalStatus === 'pending') {
        currentStatus = 'pending';
      } else if (img.imageApprovalStatus === 'approved' && img.imageIsActive === 1) {
        currentStatus = 'public';
      } else if (img.imageApprovalStatus === 'approved' && img.imageIsActive === 0) {
        currentStatus = 'private';
      }
      return {
        imageId: img.imageId,
        title: img.imageTitle || "ไม่มีชื่อภาพ",
        category: img.workTypeName || "ไม่มีหมวดหมู่",
        hashtags: img.imageTags ? img.imageTags.split(",").map((t: string) => t.trim()) : [],
        status: currentStatus,
        createdAt: img.imageCreatedAt
      }
    })
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

const fetchAllTags = async () => {
  try {
    const { apiFetch } = useApi()
    allTags.value = await apiFetch<Tag[]>("/tags")
  } catch {}
}

onMounted(() => {
  fetchGallery()
  fetchWorkTypes()
  fetchAllTags()
})

// ── Filters ────────────────────────────────────────────────────
const categories = computed(() => {
  const cats = [...new Set(images.value.map(i => i.category))]
  return [{ key: "all", label: "ทุกหมวด" }, ...cats.map(c => ({ key: c, label: c }))]
})

const filteredImages = computed(() => {
  let result = images.value
  if (categoryFilter.value !== "all") result = result.filter(i => i.category === categoryFilter.value)
  if (visibilityFilter.value !== "all") result = result.filter(i => i.status === visibilityFilter.value)
  
  const q = searchQuery.value.toLowerCase().trim()
  if (q) result = result.filter(i => i.title.toLowerCase().includes(q) || i.hashtags.some((h: string) => h.toLowerCase().includes(q)))
  
  const hq = hashtagFilter.value.toLowerCase().trim().replace(/^#/, '')
  if (hq) result = result.filter(i => i.hashtags.some((h: string) => h.toLowerCase().includes(hq)))
  
  return result
})

// ── Upload ─────────────────────────────────────────────────────
const openUploadModal = () => {
  uploadForm.value = { workTypeId: "", imageTitle: "", tagIds: [] }
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

    // 1. อัปโหลดรูปภาพด้วยเส้นเดียวกับ Editor (/upload/gallery)
    const fileFormData = new FormData()
    fileFormData.append("image", uploadFile.value)
    const uploadRes = await apiFetch<{ url: string }>("/upload/gallery", { 
      method: "POST", 
      body: fileFormData 
    })

    // 2. นำ URL ที่ได้มาสร้าง Gallery Image (ส่งเป็น JSON)
    const payload = {
      workTypeId: uploadForm.value.workTypeId,
      imageTitle: uploadForm.value.imageTitle,
      tagIds: uploadForm.value.tagIds,
      imageUrl: uploadRes.url
    }

    await apiFetch("/gallery-images", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })

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
    if (image.status === 'public') {
      image.status = 'private'
    } else {
      image.status = 'public' // pending -> public, private -> public
    }
  } catch (error: any) {
    alert("แจ้งเตือน", "เกิดข้อผิดพลาด: " + error.message, "error")
  }
}

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "คลังรูปภาพ" }]
</script>

<template>
  <div class="admin-page space-y-6 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="admin-page-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <p class="admin-eyebrow">GALLERY</p>
        <h1>คลังรูปภาพ</h1>
        <p class="admin-intro mt-2">ดูแลผลงานและข้อมูลภาพที่แสดงใน Gallery สาธารณะ</p>
      </div>
      <button
        @click="fetchGallery"
        class="px-4 py-2 rounded-full border border-[#172c3b]/10 bg-[#fcf9f3] text-[13px] font-medium text-[#172c3b] hover:bg-[#eee7db] transition-colors shadow-sm flex items-center gap-2"
      >
        <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        รีเฟรช
      </button>
    </div>

    <!-- Workspace Card -->
    <div class="bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">

      <!-- Header -->
      <div class="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#172c3b]/10">
        <div>
          <h2 class="text-lg font-semibold text-[#172c3b] tracking-tight">คลังรูปภาพ</h2>
          <p class="text-[13px] font-medium text-[#52616a] mt-0.5">ภาพที่ลูกค้าอนุญาตให้นำขึ้นแสดงใน Gallery สาธารณะ</p>
        </div>
        <div class="flex items-center gap-3">
          <button @click="openUploadModal" class="admin-primary px-4 py-2 text-[13px] font-semibold text-white bg-black hover:bg-[#172c3b] transition-colors rounded-xl shadow-sm border border-[#172c3b]/10 whitespace-nowrap">
            เพิ่มรูปภาพ
          </button>
        </div>
      </div>

      <!-- Filters & Stats Toolbar -->
      <div class="px-6 py-4 border-b border-[#172c3b]/10 bg-[#e5e9e1] flex flex-col gap-4">

        <!-- Top Row: Search/Hashtag (Left) and Stats (Right) -->
        <div class="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <!-- Search & Hashtag (Left) -->
          <div class="flex flex-wrap items-center gap-3">
            <!-- Search -->
            <div class="coos-search-field flex items-center gap-2 bg-[#fcf9f3] border border-[#172c3b]/10 rounded-xl px-3 py-2 shadow-sm focus-within:border-[#172c3b]/20 transition-all">
              <svg class="w-4 h-4 text-[#69777f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อภาพ..." class="text-[13px] text-[#172c3b] bg-transparent outline-none w-40 placeholder:text-[#69777f] font-medium" aria-label="ค้นหาชื่อภาพ..."/>
            </div>
            <!-- Hashtag -->
            <div class="coos-search-field flex items-center gap-2 bg-[#fcf9f3] border border-[#172c3b]/10 rounded-xl px-3 py-2 shadow-sm focus-within:border-[#172c3b]/20 transition-all">
              <span class="text-[#69777f] text-[13px] font-semibold">#</span>
              <input v-model="hashtagFilter" type="text" placeholder="แฮชแท็ก..." class="text-[13px] text-[#172c3b] bg-transparent outline-none w-28 placeholder:text-[#69777f] font-medium" aria-label="แฮชแท็ก..."/>
            </div>
          </div>

          <!-- Stats (Right) -->
          <div class="flex items-center gap-4 text-[13px] text-[#52616a] font-medium shrink-0 bg-[#fcf9f3] border border-[#172c3b]/10 rounded-xl px-4 py-2 shadow-sm">
            <span>ทั้งหมด: <strong class="text-[#172c3b] font-semibold">{{ images.length }}</strong></span>
            <span class="text-black/[0.06]">|</span>
            <span>รออนุมัติ: <strong class="text-[#172c3b] font-semibold">{{ images.filter(i => i.status === 'pending').length }}</strong></span>
            <span class="text-black/[0.06]">|</span>
            <span>สาธารณะ: <strong class="text-[#172c3b] font-semibold">{{ images.filter(i => i.status === 'public').length }}</strong></span>
            <span class="text-black/[0.06]">|</span>
            <span>ส่วนตัว: <strong class="text-[#172c3b] font-semibold">{{ images.filter(i => i.status === 'private').length }}</strong></span>
          </div>
        </div>

        <!-- Row 2: Category and Visibility Filters -->
        <div class="flex flex-wrap items-center gap-3">
          <AdminFilterBar class="admin-filters" v-model="categoryFilter" :filters="categories" />
          <div class="w-px h-6 bg-[#E5E5E3] mx-1 hidden sm:block"></div>
          <AdminFilterBar class="admin-filters" v-model="visibilityFilter" :filters="[{ key: 'all', label: 'ทั้งหมด' }, { key: 'pending', label: 'รออนุมัติ' }, { key: 'public', label: 'สาธารณะ' }, { key: 'private', label: 'ส่วนตัว' }]" />
        </div>
      </div>

      <!-- Main Gallery Area -->
      <div class="p-6 bg-[#e5e9e1] flex-1">

    <!-- Loading skeletons -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <div v-for="i in 12" :key="i" class="bg-[#fcf9f3] border border-[#ded7cb] rounded-2xl p-2.5 space-y-3 shadow-[0_4px_12px_rgba(0,0,0,0.005)] animate-pulse">
        <div class="aspect-square bg-[#eee7db] rounded-xl w-full" />
        <div class="h-3 bg-[#eee7db] rounded w-3/4" />
        <div class="h-2.5 bg-[#eee7db] rounded w-1/2" />
      </div>
    </div>

    <!-- Gallery grid -->
    <div v-else-if="filteredImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      <div
        v-for="img in filteredImages"
        :key="img.imageId"
        class="bg-[#fcf9f3] border border-[#ded7cb]/60 rounded-2xl overflow-hidden group hover:shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:border-[#172c3b]/10 transition-all flex flex-col"
      >
        <!-- Thumbnail -->
        <div class="aspect-square bg-[#eee7db] flex items-center justify-center border-b border-[#ded7cb]/40 relative overflow-hidden">
          <img v-if="protectedAssetUrl(galleryMediaEndpoint(img.imageId))" :src="protectedAssetUrl(galleryMediaEndpoint(img.imageId))" :alt="img.title" class="w-full h-full object-cover select-none" />
          <svg v-else class="w-10 h-10 text-[#D4D4D0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>

          <!-- Private dim overlay -->
          <div v-if="img.status !== 'public'" class="absolute inset-0 bg-[#172c3b]/10 pointer-events-none transition-all"></div>

          <!-- Visibility badge -->
          <div
            class="gallery-visibility-badge absolute top-2 right-2 inline-flex max-w-[calc(100%-16px)] items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] leading-4 font-semibold shadow-sm pointer-events-none"
            :class="img.status === 'public'
              ? 'bg-[#edf5e9] text-[#355d3d] border-[#cfdfc9]'
              : img.status === 'pending'
                ? 'bg-[#fff3dd] text-[#855b20] border-[#ead6ae]'
                : 'bg-[#eef0f2] text-[#52616a] border-[#d5dce0]'"
          >
            <span aria-hidden="true" class="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
            <span class="truncate">{{ img.status === 'public' ? 'สาธารณะ' : img.status === 'pending' ? 'รออนุมัติ' : 'ส่วนตัว' }}</span>
          </div>

          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-[#172c3b]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
            <button @click="toggleVisibility(img)" aria-label="Toggle visibility" class="p-2 bg-[#fcf9f3] hover:bg-[#eee7db] rounded-xl transition-colors shadow-lg" :title="img.status === 'public' ? 'ตั้งเป็นส่วนตัว' : 'ตั้งเป็นสาธารณะ'">
              <svg v-if="img.status === 'public'" class="w-4 h-4 text-[#172c3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <svg v-else class="w-4 h-4 text-[#172c3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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
            <p class="text-xs font-bold text-[#172c3b] truncate" :title="img.title">{{ img.title }}</p>
            <p class="text-[10px] font-semibold text-[#69777f] mt-0.5">{{ img.category }}</p>
          </div>
          <div v-if="img.hashtags.length" class="flex flex-wrap gap-1">
            <span v-for="tag in img.hashtags.slice(0, 3)" :key="tag" class="text-[9px] font-semibold bg-[#eee7db] text-[#666660] border border-[#ded7cb] px-1.5 py-0.5 rounded-md">#{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <AdminEmptyState v-else title="ไม่พบรูปภาพ" description="ไม่มีรูปภาพที่ตรงกับเงื่อนไขที่เลือก" icon="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </div>
    </div>
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
        <div v-if="uploadModal" class="admin-theme admin-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="uploadModal = false" />

          <!-- Modal Card -->
          <div class="relative bg-[#fcf9f3] rounded-[14px] shadow-2xl border border-[#172c3b]/10 w-full max-w-md p-0 overflow-hidden flex flex-col max-h-[90vh]">

            <!-- Modal Header -->
            <div class="p-6 pb-4 border-b border-[#172c3b]/10 bg-[#fcf9f3]">
              <h3 class="text-[17px] font-semibold text-[#172c3b] tracking-tight mb-2">เพิ่มรูปภาพใหม่ในแกลเลอรี</h3>
              <p class="text-[13px] text-[#52616a]">อัปโหลดผลงานและข้อมูลประกอบเพื่อนำเสนอในแกลเลอรีสาธารณะ</p>
            </div>

            <!-- Modal Body -->
            <div class="p-6 overflow-y-auto flex-1 bg-[#e5e9e1]">
              <form id="uploadForm" @submit.prevent="submitUpload" class="space-y-5">
                <!-- File Upload Zone -->
                <div class="border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer"
                     :class="uploadFile ? 'border-[#172c3b]/20 bg-[#f5f0e7]' : 'border-[#172c3b]/10 hover:border-[#172c3b]/20 bg-[#fcf9f3]'">
                  <input id="gallery-upload-input" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                  <label for="gallery-upload-input" class="cursor-pointer block">
                    <template v-if="uploadFile">
                      <svg class="w-8 h-8 text-[#172c3b] mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <p class="text-[13px] font-semibold text-[#172c3b] truncate max-w-[280px] mx-auto">{{ uploadFile.name }}</p>
                      <p class="text-xs text-[#52616a] mt-1 font-medium">คลิกเพื่อเปลี่ยนไฟล์</p>
                    </template>
                    <template v-else>
                      <svg class="w-8 h-8 text-[#69777f] mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                      <p class="text-[13px] font-semibold text-[#172c3b]">คลิกเพื่อเลือกรูปภาพ</p>
                      <p class="text-xs text-[#69777f] mt-1 font-medium">PNG, JPG ขนาดไม่เกิน 10MB</p>
                    </template>
                  </label>
                </div>

                <!-- Form Fields -->
                <div class="space-y-4">
                  <!-- WorkType (required) -->
                  <div>
                    <label class="block text-xs font-semibold text-[#172c3b] mb-1.5">
                      ประเภทงาน *
                    </label>
                    <select
                      v-model="uploadForm.workTypeId"
                      required
                      class="w-full text-[13px] px-3 py-2.5 bg-[#eee7db] border border-[#172c3b]/10 rounded-xl focus:outline-none focus:bg-[#fcf9f3] focus:border-[#172c3b]/20 transition-all font-medium text-[#172c3b]"
                    >
                      <option value="">-- เลือกประเภทงาน --</option>
                      <option v-for="wt in workTypes" :key="wt.workTypeId" :value="String(wt.workTypeId)">
                        {{ wt.workTypeName }}
                      </option>
                    </select>
                  </div>

                  <!-- Title -->
                  <div>
                    <label class="block text-xs font-semibold text-[#172c3b] mb-1.5">ชื่อภาพ</label>
                    <input
                      v-model="uploadForm.imageTitle"
                      type="text"
                      placeholder="เช่น Pre-wedding Lookbook 2025"
                      class="w-full text-[13px] px-3 py-2.5 bg-[#eee7db] border border-[#172c3b]/10 rounded-xl focus:outline-none focus:bg-[#fcf9f3] focus:border-[#172c3b]/20 transition-all font-medium text-[#172c3b] placeholder:text-[#69777f]"
                     aria-label="เช่น Pre-wedding Lookbook 2025"/>
                  </div>

                  <!-- Tags -->
                  <div>
                    <label class="block text-xs font-semibold text-[#172c3b] mb-1.5">
                      แฮชแท็ก
                    </label>
                    <div class="p-3 bg-[#eee7db] border border-[#172c3b]/10 rounded-xl max-h-48 overflow-y-auto">
                      <div v-if="allTags.length === 0" class="text-[13px] text-[#69777f] py-2 text-center">ไม่มีแฮชแท็กในระบบ</div>
                      <div v-else class="flex flex-wrap gap-2">
                        <label v-for="tag in allTags" :key="tag.tagId" class="inline-flex items-center gap-1.5 cursor-pointer">
                          <input type="checkbox" :value="tag.tagId" v-model="uploadForm.tagIds" class="rounded border-[#172c3b]/20 text-black focus:ring-black">
                          <span class="text-[13px] font-medium text-[#172c3b]">#{{ tag.tagName }}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Error Message -->
                <p v-if="uploadError" class="text-[13px] text-[#C53030] bg-[#FFF5F5] border border-[#FEB2B2] rounded-xl px-3 py-2.5 font-medium">
                  {{ uploadError }}
                </p>
              </form>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 pt-4 border-t border-[#172c3b]/10 bg-[#fcf9f3] flex gap-2 justify-end">
              <button type="button" @click="uploadModal = false" class="px-4 py-2 text-[13px] font-medium text-[#52616a] hover:text-[#172c3b] hover:bg-black/[0.04] transition-colors rounded-xl">
                ยกเลิก
              </button>
              <button
                type="submit"
                form="uploadForm"
                :disabled="uploadLoading"
                class="admin-primary inline-flex items-center justify-center px-4 py-2 text-[13px] font-semibold text-white bg-black hover:bg-[#172c3b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl shadow-sm border border-[#172c3b]/10"
              >
                <svg v-if="uploadLoading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span v-if="uploadLoading">กำลังอัปโหลด...</span>
                <span v-else>อัปโหลดรูปภาพ</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
