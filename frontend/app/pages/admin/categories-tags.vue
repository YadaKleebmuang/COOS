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
    const [tgs, imgs] = await Promise.all([
      apiFetch<any[]>("/tags").catch(() => []),
      apiFetch<any[]>("/gallery-images?all=true").catch(() => [])
    ])

    const tagCountMap = new Map<string, Set<number>>()
    imgs.forEach(img => {
      if (img.imageTags) {
        const tags = img.imageTags.split(",").map((t: string) => t.trim().toLowerCase())
        tags.forEach((tag: string) => {
          if (!tagCountMap.has(tag)) tagCountMap.set(tag, new Set())
          tagCountMap.get(tag)!.add(img.imageId)
        })
      }
    })

    hashtags.value = tgs.map(t => {
      const normalizedTagName = t.tagName.trim().toLowerCase()
      const imageCount = tagCountMap.has(normalizedTagName) ? tagCountMap.get(normalizedTagName)!.size : 0
      return {
        tagId: t.tagId,
        tagName: t.tagName,
        imageCount,
        createdAt: t.createdAt || new Date().toISOString()
      }
    })
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
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <AdminBreadcrumb :items="breadcrumb" />
      <button
        @click="fetchData"
        class="px-4 py-2 rounded-full border border-black/[0.06] bg-white text-[13px] font-medium text-[#171717] hover:bg-[#F7F7F5] transition-colors shadow-sm flex items-center gap-2"
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
    <div class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
      
      <!-- Header & Search -->
      <div class="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.06]">
        <div>
          <h2 class="text-lg font-semibold text-[#171717] tracking-tight">แฮชแท็กทั้งหมด</h2>
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">จัดการแฮชแท็กสำหรับจัดหมวดหมู่และค้นหารูปภาพใน Gallery</p>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-black/[0.12] focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all">
            <svg class="w-4 h-4 text-[#929292] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="searchQuery" type="text" placeholder="ค้นหาแฮชแท็ก..." class="text-xs text-[#171717] bg-transparent outline-none w-48 placeholder:text-[#9A9A95]" />
          </div>
          <button @click="tagModal = { open: true, mode: 'add', loading: false, id: 0, name: '' }" class="px-4 py-2 text-[13px] font-semibold text-white bg-black hover:bg-[#171717] transition-colors rounded-xl shadow-sm border border-black/[0.06] whitespace-nowrap">
            เพิ่มแฮชแท็ก
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="flex flex-col flex-1">
        <div class="overflow-x-auto bg-[#FDFDFB]/30 worktypes-table-scope">
          <AdminDataTable :columns="tagColumns" :rows="paginatedHashtags" :loading="loading" row-key="tagId">
            <template #cell-tagName="{ value }">
              <span class="text-[13px] font-medium text-[#171717]">#{{ value }}</span>
            </template>
            <template #cell-imageCount="{ value }">
              <span class="text-[13px] font-medium text-[#666666]">{{ value }}</span>
            </template>
            <template #cell-action="{ row }">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  @click="tagModal = { open: true, mode: 'edit', loading: false, id: row.tagId, name: row.tagName }"
                  class="px-2 py-1 text-[11px] font-semibold text-[#171717] bg-white hover:bg-[#F7F7F5] transition-colors rounded shadow-sm border border-black/[0.06]"
                >
                  แก้ไข
                </button>
                <button
                  @click="tagDelete = { open: true, loading: false, id: row.tagId, name: row.tagName }"
                  class="px-2 py-1 text-[11px] font-semibold text-[#C53030] bg-[#FFF5F5] hover:bg-[#FED7D7] transition-colors rounded shadow-sm border border-[#FEB2B2]"
                >
                  ลบ
                </button>
              </div>
            </template>
          </AdminDataTable>
        </div>

        <AdminEmptyState v-if="!loading && hashtags.length === 0" title="ยังไม่มีแฮชแท็ก" description="กดเพิ่มแท็กเพื่อเริ่มต้น" icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
        <AdminEmptyState v-else-if="!loading && filteredHashtags.length === 0" title="ไม่พบแฮชแท็ก" description="ไม่มีแฮชแท็กที่ตรงกับคำค้นหา" icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
      
        <!-- Pagination wrapper (Moved inside Card) -->
        <div v-if="totalPages > 1" class="px-6 py-4 flex items-center justify-between border-t border-black/[0.06] bg-white">
          <div class="hidden sm:block text-[13px] text-[#666660]">
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
      </div>
    </div>

    <!-- Tag Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="tagModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="tagModal.open = false" />
          <div class="relative bg-white/95 backdrop-blur-[15px] rounded-[24px] shadow-2xl border border-black/[0.06] w-full max-w-sm p-0 overflow-hidden flex flex-col max-h-[90vh]">
            
            <!-- Modal Header -->
            <div class="p-6 pb-4 border-b border-black/[0.06] bg-white">
              <h3 class="text-[17px] font-semibold text-[#171717] tracking-tight mb-2">{{ tagModal.mode === "edit" ? "แก้ไขแฮชแท็ก" : "เพิ่มแฮชแท็ก" }}</h3>
              <p class="text-[13px] text-[#666666]">{{ tagModal.mode === "edit" ? "แก้ไขชื่อแฮชแท็กในระบบ" : "เพิ่มแฮชแท็กใหม่สำหรับจัดระเบียบรูปภาพ" }}</p>
            </div>
            
            <!-- Modal Body -->
            <div class="p-6 overflow-y-auto flex-1 bg-[#FDFDFB]/50">
              <div class="space-y-4">
                <div>
                  <label class="block text-xs font-semibold text-[#171717] mb-1.5">ชื่อแฮชแท็ก (ไม่ต้องใส่ #) *</label>
                  <input v-model="tagModal.name" type="text" placeholder="เช่น portrait, anime..." class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717] placeholder:text-[#9A9A95]" />
                </div>
              </div>
            </div>
            
            <!-- Modal Footer -->
            <div class="p-6 pt-4 border-t border-black/[0.06] bg-white flex gap-2 justify-end">
              <button type="button" @click="tagModal.open = false" class="px-4 py-2 text-[13px] font-medium text-[#666666] hover:text-[#171717] hover:bg-black/[0.04] transition-colors rounded-xl">
                ยกเลิก
              </button>
              <button
                type="button"
                :disabled="tagModal.loading || !tagModal.name.trim()"
                @click="saveTag"
                class="inline-flex items-center justify-center px-4 py-2 text-[13px] font-semibold text-white bg-black hover:bg-[#171717] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl shadow-sm border border-black/[0.06]"
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

/* Override shared DataTable styles to match Dashboard neutral tones */
.worktypes-table-scope :deep(.rounded-xl) {
  border-radius: 0 !important;
  border-color: rgba(0, 0, 0, 0.06) !important;
}

.worktypes-table-scope :deep(thead.bg-gray-50) {
  background-color: rgba(247, 247, 245, 0.8) !important;
  border-bottom-color: rgba(0, 0, 0, 0.06) !important;
}

.worktypes-table-scope :deep(tbody.bg-white tr:hover) {
  background-color: #FDFDFB !important;
}

.worktypes-table-scope :deep(tbody.bg-white.divide-gray-100 > tr) {
  border-color: rgba(0, 0, 0, 0.04) !important;
}
</style>
