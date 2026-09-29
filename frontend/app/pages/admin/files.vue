<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()
const { alert } = useAlert()

// ── Types ──────────────────────────────────────────────────────
interface SystemFile {
  fileId: string
  fileName: string
  fileType: "image" | "document" | "video" | "other"
  orderId: number | null
  ownerName: string
  fileSize: number
  uploadedAt: string
  fileUrl: string
  status: "active" | "archived"
}


// ── State ──────────────────────────────────────────────────────
const files = ref<SystemFile[]>([])
const loading = ref(true)
const searchQuery = ref("")
const typeFilter = ref("all")
const statusFilter = ref("all")
const deleteDialog = ref({ open: false, loading: false, fileId: "", name: "" })
const { openProtectedAsset } = useProtectedAsset()

const fileMediaEndpoint = (fileId: string) => {
  const match = /^(img|pay)_(\d+)$/.exec(fileId)
  if (!match) return ''
  return match[1] === 'img'
    ? `/media/order-images/${match[2]}`
    : `/media/payments/${match[2]}/slip`
}

const openSystemFile = (file: SystemFile) => {
  const endpoint = fileMediaEndpoint(file.fileId)
  if (endpoint) openProtectedAsset(endpoint)
}

// ── Fetch ──────────────────────────────────────────────────────
const fetchFiles = async () => {
  loading.value = true
  try {
    const data = await apiFetch<SystemFile[]>("/api/v1/files")
    files.value = data
  } catch (error: any) {
    alert("แจ้งเตือน", "เกิดข้อผิดพลาดในการโหลดไฟล์: " + error.message, "error")
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchFiles())

// ── Filters ────────────────────────────────────────────────────
const typeOptions = [
  { key: "all", label: "ทุกประเภท" },
  { key: "image", label: "รูปภาพ" },
  { key: "document", label: "เอกสาร" },
  { key: "video", label: "วิดีโอ" },
  { key: "other", label: "อื่นๆ" }
]

const statusOptions = [
  { key: "all", label: "ทั้งหมด" },
  { key: "active", label: "ใช้งาน" },
  { key: "archived", label: "เก็บถาวร" }
]

const filteredFiles = computed(() => {
  let result = files.value
  if (typeFilter.value !== "all") result = result.filter(f => f.fileType === typeFilter.value)
  if (statusFilter.value !== "all") result = result.filter(f => f.status === statusFilter.value)
  const q = searchQuery.value.toLowerCase().trim()
  if (q) result = result.filter(f => f.fileName.toLowerCase().includes(q) || f.ownerName.toLowerCase().includes(q))
  return result
})

// ── Table columns ──────────────────────────────────────────────
const columns = [
  { key: "fileName", label: "ชื่อไฟล์" },
  { key: "fileType", label: "ประเภท", align: "center" as const },
  { key: "orderId", label: "คำสั่งงาน", align: "center" as const },
  { key: "ownerName", label: "เจ้าของ" },
  { key: "fileSize", label: "ขนาด", align: "right" as const },
  { key: "uploadedAt", label: "วันที่อัปโหลด" },
  { key: "status", label: "สถานะ", align: "center" as const },
  { key: "action", label: "การจัดการ", align: "center" as const }
]

// ── Delete ─────────────────────────────────────────────────────
const confirmDelete = async () => {
  deleteDialog.value.loading = true
  try {
    await apiFetch(`/api/v1/files/${deleteDialog.value.fileId}`, { method: "DELETE" })
    files.value = files.value.filter(f => f.fileId !== deleteDialog.value.fileId)
    deleteDialog.value.open = false
  } catch (error: any) {
    alert("แจ้งเตือน", "เกิดข้อผิดพลาดในการลบไฟล์: " + error.message, "error")
  } finally {
    deleteDialog.value.loading = false
  }
}

// ── Helpers ────────────────────────────────────────────────────
const formatSize = (bytes: number) => {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`
  return `${bytes} B`
}

const formatDate = (d: string) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })

const fileTypeIcon: Record<string, string> = {
  image: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  document: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  video: "M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  other: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
}

const fileTypeLabel: Record<string, string> = { image: "รูปภาพ", document: "เอกสาร", video: "วิดีโอ", other: "อื่นๆ" }

// Total size
const totalSize = computed(() => files.value.reduce((acc, f) => acc + f.fileSize, 0))

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "ไฟล์ในระบบ" }]
</script>

<template>
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">จัดการไฟล์ในระบบ</h1>
        <p class="mt-0.5 text-sm text-gray-500">ไฟล์ต้นฉบับ, สลิปชำระเงิน, และไฟล์ผลลัพธ์จาก Editor</p>
      </div>
      <AdminActionButton variant="secondary" size="sm" :loading="loading" @click="fetchFiles">รีเฟรช</AdminActionButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-gray-900 font-number">{{ files.length }}</p>
        <p class="text-xs text-gray-400 mt-1">ไฟล์ทั้งหมด</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-gray-900 font-number">{{ files.filter(f => f.status === 'active').length }}</p>
        <p class="text-xs text-gray-400 mt-1">ใช้งานอยู่</p>
      </div>
      <div class="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-gray-900 font-number">{{ formatSize(totalSize) }}</p>
        <p class="text-xs text-gray-400 mt-1">ขนาดรวม</p>
      </div>
    </div>

    <!-- Search + Filters -->
    <div class="flex flex-wrap gap-3 items-center">
      <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อไฟล์..." class="text-sm text-gray-700 bg-transparent outline-none w-44 placeholder:text-gray-400"/>
      </div>
      <AdminFilterBar v-model="typeFilter" :filters="typeOptions"/>
      <AdminFilterBar v-model="statusFilter" :filters="statusOptions"/>
    </div>

    <!-- Table -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <AdminDataTable :columns="columns" :rows="filteredFiles" :loading="loading" row-key="fileId">
        <!-- File name -->
        <template #cell-fileName="{ row }">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="fileTypeIcon[row.fileType] ?? fileTypeIcon.other"/>
              </svg>
            </div>
            <span class="text-xs font-medium text-gray-900 max-w-[200px] truncate">{{ row.fileName }}</span>
          </div>
        </template>
        <!-- File type -->
        <template #cell-fileType="{ value }">
          <span class="text-xs text-gray-500">{{ fileTypeLabel[value] ?? value }}</span>
        </template>
        <!-- Order ID -->
        <template #cell-orderId="{ value }">
          <span class="font-mono text-xs text-gray-600">{{ value ? `#${value}` : "—" }}</span>
        </template>
        <!-- Owner -->
        <template #cell-ownerName="{ value }">
          <span class="text-xs text-gray-600">{{ value }}</span>
        </template>
        <!-- Size -->
        <template #cell-fileSize="{ value }">
          <span class="text-xs font-number text-gray-500">{{ formatSize(value) }}</span>
        </template>
        <!-- Upload date -->
        <template #cell-uploadedAt="{ value }">
          <span class="text-xs text-gray-400">{{ formatDate(value) }}</span>
        </template>
        <!-- Status -->
        <template #cell-status="{ value }">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" :class="value === 'active' ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'">
            {{ value === "active" ? "ใช้งาน" : "เก็บถาวร" }}
          </span>
        </template>
        <!-- Actions -->
        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-1.5">
            <button type="button" class="text-xs text-gray-500 hover:text-gray-700 underline" @click="openSystemFile(row as SystemFile)">ดูไฟล์</button>
            <AdminActionButton variant="danger" size="sm" @click="deleteDialog = { open: true, loading: false, fileId: row.fileId, name: row.fileName }">ลบ</AdminActionButton>
          </div>
        </template>
      </AdminDataTable>
      <AdminEmptyState v-if="!loading && filteredFiles.length === 0" title="ไม่พบไฟล์" description="ไม่มีไฟล์ที่ตรงกับเงื่อนไขที่เลือก" icon="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
    </div>

    <!-- Delete confirm -->
    <AdminConfirmDialog :open="deleteDialog.open" title="ลบไฟล์" :message="`ลบไฟล์ '${deleteDialog.name}' ออกจากระบบ? การกระทำนี้ไม่สามารถย้อนกลับได้`" confirm-label="ลบไฟล์" :danger="true" :loading="deleteDialog.loading" @confirm="confirmDelete" @cancel="deleteDialog.open = false"/>
  </div>
</template>
