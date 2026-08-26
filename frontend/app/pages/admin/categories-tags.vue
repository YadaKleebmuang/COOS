<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue"
import { useApi } from "~/composables/useApi"
import Pagination from "~/components/ui/Pagination.vue"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()
const { alert } = useAlert()

// ── Types ──────────────────────────────────────────────────────
interface Hashtag { tagId: number; tagName: string; imageCount: number; createdAt: string }

// ── State ──────────────────────────────────────────────────────
const hashtags = ref<Hashtag[]>([])
const loading = ref(true)
const searchQuery = ref("")
const currentPage = ref(1)
const pageSize = 10

// Hashtag modal
const tagModal = ref({ open: false, mode: "add" as "add" | "edit", loading: false, id: 0, name: "" })
const tagDelete = ref({ open: false, loading: false, id: 0, name: "" })

// ── Fetch ──────────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  try {
    const tgs = await apiFetch<any[]>("/tags").catch(() => [])

    hashtags.value = tgs.map(t => ({
      tagId: t.tagId,
      tagName: t.tagName,
      imageCount: 0,
      createdAt: t.createdAt || new Date().toISOString()
    }))
  } catch (error: any) {
    alert("แจ้งเตือน", "เกิดข้อผิดพลาดในการโหลดข้อมูล: " + error.message, "error")
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())

// ── Search & Pagination ──────────────────────────────────────────
const filteredHashtags = computed(() => {
  const q = searchQuery.value.toLowerCase().trim().replace(/^#/, "")
  if (!q) return hashtags.value
  return hashtags.value.filter(t =>
    t.tagName.toLowerCase().includes(q)
  )
})

const paginatedHashtags = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize
  const endIndex = startIndex + pageSize
  return filteredHashtags.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  return Math.ceil(filteredHashtags.value.length / pageSize) || 1
})

watch(filteredHashtags, () => {
  currentPage.value = 1
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

// ── Tag CRUD ───────────────────────────────────────────────────
const saveTag = async () => {
  tagModal.value.loading = true
  try {
    const formattedName = tagModal.value.name.trim().replace(/^#/, '')
    if (!formattedName) throw new Error("กรุณากรอกชื่อแฮชแท็กให้ถูกต้อง")

    if (tagModal.value.mode === "edit") {
      await apiFetch(`/tags/${tagModal.value.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagName: formattedName })
      })
      const idx = hashtags.value.findIndex(t => t.tagId === tagModal.value.id)
      if (idx !== -1) hashtags.value[idx].tagName = formattedName
    } else {
      await apiFetch("/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagName: formattedName })
      })
      await fetchData()
    }
    tagModal.value.open = false
  } catch (error: any) {
    alert("แจ้งเตือน", "เกิดข้อผิดพลาด: " + error.message, "error")
  } finally {
    tagModal.value.loading = false
  }
}

const confirmTagDelete = async () => {
  tagDelete.value.loading = true
  try {
    await apiFetch(`/tags/${tagDelete.value.id}`, { method: "DELETE" })
    hashtags.value = hashtags.value.filter(t => t.tagId !== tagDelete.value.id)
    tagDelete.value.open = false
  } catch (error: any) {
    alert("แจ้งเตือน", "เกิดข้อผิดพลาดในการลบ: " + error.message, "error")
  } finally {
    tagDelete.value.loading = false
  }
}

const tagColumns = [
  { key: "tagName", label: "แฮชแท็ก" },
  { key: "imageCount", label: "จำนวนภาพ", align: "center" as const },
  { key: "action", label: "การจัดการ", align: "center" as const }
]

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "จัดการแฮชแท็ก" }]
</script>

<template>
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">จัดการแฮชแท็ก</h1>
        <p class="mt-0.5 text-sm text-gray-500">แฮชแท็กสำหรับจัดหมวดหมู่และค้นหารูปภาพใน Gallery</p>
      </div>
      <div class="flex gap-2">
        <AdminActionButton variant="secondary" size="sm" :loading="loading" icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" @click="fetchData">รีเฟรช</AdminActionButton>
        <AdminActionButton variant="primary" size="sm" icon="M12 4v16m8-8H4" @click="tagModal = { open: true, mode: 'add', loading: false, id: 0, name: '' }">เพิ่มแฮชแท็ก</AdminActionButton>
      </div>
    </div>

    <!-- Search + Filter -->


    <div class="flex flex-col md:flex-row md:items-center gap-4 justify-start bg-white border border-[#EFEFEA]/60 rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">

      <div class="flex-shrink-0 flex items-center gap-3">
        <div class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-[#171717]/30 focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.015)] transition-all">
          <svg class="w-4 h-4 text-[#9A9A95] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาแฮชแท็ก..." class="text-xs text-[#171717] bg-transparent outline-none flex-1 placeholder:text-[#9A9A95]"/>
        </div>

      </div>
    </div>
    <!-- One-column layout for Tags -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <AdminDataTable :columns="tagColumns" :rows="paginatedHashtags" :loading="loading" row-key="tagId">
        <template #cell-tagName="{ value }">
          <span class="text-sm font-medium text-gray-900">#{{ value }}</span>
        </template>
        <template #cell-imageCount="{ value }">
          <span class="text-sm font-number text-gray-700">{{ value }}</span>
        </template>
        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-1.5">
            <AdminActionButton variant="secondary" size="sm" @click="tagModal = { open: true, mode: 'edit', loading: false, id: row.tagId, name: row.tagName }">แก้ไข</AdminActionButton>
            <AdminActionButton variant="danger" size="sm" @click="tagDelete = { open: true, loading: false, id: row.tagId, name: row.tagName }">ลบ</AdminActionButton>
          </div>
        </template>
      </AdminDataTable>
      <AdminEmptyState v-if="!loading && hashtags.length === 0" title="ยังไม่มีแฮชแท็ก" description="กดเพิ่มแท็กเพื่อเริ่มต้น" icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
      <AdminEmptyState v-else-if="!loading && filteredHashtags.length === 0" title="ไม่พบแฮชแท็ก" description="ไม่มีแฮชแท็กที่ตรงกับคำค้นหา" icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
    </div>

    <!-- Pagination wrapper -->
    <div v-if="totalPages > 1" class="bg-white border border-[#EFEFEA]/60 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex items-center justify-between">
      <!-- Thai Pagination Summary -->
      <div class="hidden sm:block text-xs text-[#666660]">
        <span class="font-bold text-[#171717]">{{ ((currentPage - 1) * pageSize) + 1 }}</span>–<span class="font-bold text-[#171717]">{{ Math.min(currentPage * pageSize, filteredHashtags.length) }}</span> จาก <span class="font-bold text-[#171717]">{{ filteredHashtags.length }}</span> รายการ
      </div>
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="filteredHashtags.length"
        :limit="pageSize"
        @page-change="handlePageChange"
        class="!border-0 !shadow-none !mt-0 !rounded-none !p-0 !bg-transparent flex-1 sm:flex-initial"
      />
    </div>

    <!-- Tag Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="tagModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="tagModal.open = false"/>
          <div class="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm p-6">
            <h3 class="text-sm font-bold text-gray-900 mb-4">{{ tagModal.mode === "edit" ? "แก้ไขแฮชแท็ก" : "เพิ่มแฮชแท็ก" }}</h3>
            <label class="block text-xs font-medium text-gray-500 mb-1">ชื่อแฮชแท็ก (ไม่ต้องใส่ #)</label>
            <input v-model="tagModal.name" type="text" placeholder="เช่น portrait, anime..." class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 mb-4"/>
            <div class="flex gap-2 justify-end">
              <AdminActionButton variant="secondary" size="md" @click="tagModal.open = false">ยกเลิก</AdminActionButton>
              <button
                type="button"
                :disabled="tagModal.loading || !tagModal.name.trim()"
                @click="saveTag"
                class="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl border border-gray-900"
              >
                <svg v-if="tagModal.loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm Delete Dialogs -->
    <AdminConfirmDialog :open="tagDelete.open" title="ลบแฮชแท็ก" :message="`ลบแท็ก '#${tagDelete.name}' ออกจากระบบ?`" confirm-label="ลบ" :danger="true" :loading="tagDelete.loading" @confirm="confirmTagDelete" @cancel="tagDelete.open = false"/>
  </div>
</template>

<style scoped>
:deep(p.text-sm.text-gray-700) {
  display: none !important;
}
</style>
