<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import { orderService } from "~/services/order.service"
import type { WorkType } from "~/types/order.types"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()
const { alert } = useAlert()

// ── State ──────────────────────────────────────────────────────
const workTypes = ref<WorkType[]>([])
const loading = ref(true)
const error = ref("")
const saving = ref(false)
const searchQuery = ref("")

const modal = ref({ open: false, mode: "add" as "add" | "edit" })
const deleteDialog = ref({ open: false, loading: false, workTypeId: 0, name: "" })
const editingId = ref<number | null>(null)

const form = reactive({
  workTypeName: "",
  workTypeDescription: "",
  workTypeIsActive: 1 as 0 | 1
})

// ── API ────────────────────────────────────────────────────────
const fetchWorkTypes = async () => {
  loading.value = true
  error.value = ""
  try {
    workTypes.value = await orderService.getWorkTypes(true)
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถโหลดประเภทงานได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchWorkTypes())

// ── Filters ────────────────────────────────────────────────────
const filteredWorkTypes = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return workTypes.value
  return workTypes.value.filter(wt =>
    wt.workTypeName.toLowerCase().includes(q) ||
    (wt.workTypeDescription ?? "").toLowerCase().includes(q)
  )
})

// ── Table columns ──────────────────────────────────────────────
const columns = [
  { key: "workTypeName", label: "ชื่อประเภทงาน" },
  { key: "workTypeDescription", label: "คำอธิบาย" },
  { key: "workTypeIsActive", label: "สถานะ", align: "center" as const },
  { key: "workTypeCreatedAt", label: "วันที่สร้าง" },
  { key: "action", label: "การจัดการ", align: "center" as const }
]

// ── Modal ──────────────────────────────────────────────────────
const openAdd = () => {
  editingId.value = null
  form.workTypeName = ""
  form.workTypeDescription = ""
  form.workTypeIsActive = 1
  modal.value = { open: true, mode: "add" }
}

const openEdit = (wt: WorkType) => {
  editingId.value = wt.workTypeId
  form.workTypeName = wt.workTypeName
  form.workTypeDescription = wt.workTypeDescription ?? ""
  form.workTypeIsActive = wt.workTypeIsActive as 0 | 1
  modal.value = { open: true, mode: "edit" }
}

const handleSubmit = async () => {
  saving.value = true
  try {
    if (modal.value.mode === "edit" && editingId.value) {
      await apiFetch(`/work-types/${editingId.value}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
    } else {
      await apiFetch("/work-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
    }
    modal.value.open = false
    fetchWorkTypes()
  } catch (err: any) {
    alert("แจ้งเตือน", err?.message || "ดำเนินการไม่สำเร็จ", "error")
  } finally {
    saving.value = false
  }
}

const openDelete = (wt: WorkType) => {
  deleteDialog.value = { open: true, loading: false, workTypeId: wt.workTypeId, name: wt.workTypeName }
}

const confirmDelete = async () => {
  deleteDialog.value.loading = true
  try {
    await apiFetch(`/work-types/${deleteDialog.value.workTypeId}`, { method: "DELETE" })
    deleteDialog.value.open = false
    fetchWorkTypes()
  } catch (err: any) {
    alert("แจ้งเตือน", err?.message || "ดำเนินการไม่สำเร็จ", "error")
  } finally {
    deleteDialog.value.loading = false
  }
}

const formatDate = (d: string | Date) => d ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "—"

const breadcrumb = [
  { label: "หน้าแรก", to: "/admin/dashboard" },
  { label: "ประเภทงาน" }
]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <AdminBreadcrumb :items="breadcrumb" />
      <button
        @click="fetchWorkTypes"
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
          <h2 class="text-lg font-semibold text-[#171717] tracking-tight">ประเภทงานทั้งหมด</h2>
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">จัดการประเภทงานและบริการที่ลูกค้าสามารถเลือกใช้</p>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-black/[0.12] focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all">
            <svg class="w-4 h-4 text-[#929292] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="searchQuery" type="text" placeholder="ค้นหาประเภทงาน..." class="text-xs text-[#171717] bg-transparent outline-none w-48 placeholder:text-[#9A9A95]" />
          </div>
          <button @click="openAdd" class="px-4 py-2 text-[13px] font-semibold text-white bg-black hover:bg-[#171717] transition-colors rounded-xl shadow-sm border border-black/[0.06] whitespace-nowrap">
            เพิ่มประเภทงาน
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-12 text-center">
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button @click="fetchWorkTypes" class="mt-2 text-xs text-[#9A9A95] underline">ลองใหม่</button>
      </div>

      <!-- Table -->
      <div v-else class="flex flex-col flex-1">
        <div class="overflow-x-auto bg-[#FDFDFB]/30 worktypes-table-scope">
          <AdminDataTable :columns="columns" :rows="filteredWorkTypes" :loading="loading" row-key="workTypeId">
            <!-- Name -->
            <template #cell-workTypeName="{ value }">
              <span class="text-[13px] font-medium text-[#171717]">{{ value }}</span>
            </template>
            <!-- Description -->
            <template #cell-workTypeDescription="{ value }">
              <span class="text-xs text-[#666666] max-w-md block truncate">{{ value || "—" }}</span>
            </template>
            <!-- Status -->
            <template #cell-workTypeIsActive="{ value }">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap"
                :class="value ? 'bg-[#F7F7F5] text-[#171717] border-black/[0.06] shadow-sm' : 'bg-[#FDFDFB] text-[#666666] border-black/[0.04]'"
              >
                {{ value ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
              </span>
            </template>
            <!-- Date -->
            <template #cell-workTypeCreatedAt="{ value }">
              <span class="text-xs text-[#9A9A95]">{{ formatDate(value) }}</span>
            </template>
            <!-- Actions -->
            <template #cell-action="{ row }">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  @click="openEdit(row as any)"
                  class="px-2 py-1 text-[11px] font-semibold text-[#171717] bg-white hover:bg-[#F7F7F5] transition-colors rounded shadow-sm border border-black/[0.06]"
                >
                  แก้ไข
                </button>
                <button
                  @click="openDelete(row as any)"
                  class="px-2 py-1 text-[11px] font-semibold text-[#C53030] bg-[#FFF5F5] hover:bg-[#FED7D7] transition-colors rounded shadow-sm border border-[#FEB2B2]"
                >
                  ลบ
                </button>
              </div>
            </template>
          </AdminDataTable>
        </div>

        <AdminEmptyState v-if="!loading && filteredWorkTypes.length === 0" title="ไม่พบประเภทงาน" description="ไม่มีประเภทงานที่ตรงกับคำค้นหา" icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="modal.open = false" />
          <div class="relative bg-white/95 backdrop-blur-[15px] rounded-[24px] shadow-2xl border border-black/[0.06] w-full max-w-md p-0 overflow-hidden flex flex-col max-h-[90vh]">
            
            <!-- Modal Header -->
            <div class="p-6 pb-4 border-b border-black/[0.06] bg-white">
              <h3 class="text-[17px] font-semibold text-[#171717] tracking-tight mb-2">{{ modal.mode === "edit" ? "แก้ไขประเภทงาน" : "เพิ่มประเภทงานใหม่" }}</h3>
              <p class="text-[13px] text-[#666666]">{{ modal.mode === "edit" ? "แก้ไขข้อมูลรายละเอียดของประเภทงานในระบบ" : "สร้างประเภทงานใหม่สำหรับให้บริการบนระบบ" }}</p>
            </div>
            
            <!-- Modal Body -->
            <div class="p-6 overflow-y-auto flex-1 bg-[#FDFDFB]/50">
              <form id="workTypeForm" @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                  <label for="workTypeName" class="block text-xs font-semibold text-[#171717] mb-1.5">ชื่อประเภทงาน *</label>
                  <input id="workTypeName" v-model="form.workTypeName" required type="text" placeholder="เช่น Realistic, Anime, Watercolor" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717] placeholder:text-[#9A9A95]" />
                </div>
                <div>
                  <label for="workTypeDescription" class="block text-xs font-semibold text-[#171717] mb-1.5">คำอธิบาย</label>
                  <textarea id="workTypeDescription" v-model="form.workTypeDescription" rows="3" placeholder="คำอธิบายสั้นๆ สำหรับแสดงให้ลูกค้าเห็น..." class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717] placeholder:text-[#9A9A95] resize-none" />
                </div>
                <div class="flex items-center gap-3 bg-white border border-black/[0.06] rounded-xl p-3.5 shadow-sm">
                  <input v-model="form.workTypeIsActive" type="checkbox" :true-value="1" :false-value="0" id="wt-active" class="w-4 h-4 rounded border-gray-300 text-black focus:ring-0 focus:ring-offset-0 transition-colors" />
                  <label for="wt-active" class="text-[13px] font-medium text-[#171717] select-none cursor-pointer flex-1">เปิดใช้งานประเภทงานนี้</label>
                </div>
              </form>
            </div>
            
            <!-- Modal Footer -->
            <div class="p-6 pt-4 border-t border-black/[0.06] bg-white flex gap-2 justify-end">
              <button type="button" @click="modal.open = false" class="px-4 py-2 text-[13px] font-medium text-[#666666] hover:text-[#171717] hover:bg-black/[0.04] transition-colors rounded-xl">
                ยกเลิก
              </button>
              <button
                type="submit"
                form="workTypeForm"
                :disabled="saving"
                class="inline-flex items-center justify-center px-4 py-2 text-[13px] font-semibold text-white bg-black hover:bg-[#171717] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl shadow-sm border border-black/[0.06]"
              >
                <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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

    <!-- Delete confirm -->
    <AdminConfirmDialog
      :open="deleteDialog.open"
      title="ยืนยันการลบประเภทงาน"
      :message="`คุณต้องการลบประเภทงาน '${deleteDialog.name}' ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`"
      confirm-label="ลบประเภทงาน"
      :danger="true"
      :loading="deleteDialog.loading"
      @confirm="confirmDelete"
      @cancel="deleteDialog.open = false"
    />
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
