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
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-lg font-black text-[#171717] tracking-tight">ประเภทงาน</h1>
        <p class="mt-0.5 text-xs text-[#9A9A95]">จัดการประเภทงานและบริการที่ลูกค้าสามารถเลือกใช้</p>
      </div>
      <div class="flex gap-2">
        <AdminActionButton variant="secondary" size="sm" :loading="loading" icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" @click="fetchWorkTypes">รีเฟรช</AdminActionButton>
        <AdminActionButton variant="primary" size="sm" icon="M12 4v16m8-8H4" @click="openAdd">เพิ่มประเภทงาน</AdminActionButton>
      </div>
    </div>

    <!-- Search Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center gap-4 justify-between bg-white border border-[#EFEFEA]/60 rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
      <div class="flex-1 max-w-sm flex items-center gap-2 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-[#171717]/30 focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.015)] transition-all">
        <svg class="w-4 h-4 text-[#9A9A95] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchQuery" type="text" placeholder="ค้นหาประเภทงาน..." class="text-xs text-[#171717] bg-transparent outline-none flex-1 placeholder:text-[#9A9A95]" />
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-white border border-red-100 rounded-2xl p-6 text-center">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white border border-[#EFEFEA]/60 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.01)] overflow-hidden">
      <AdminDataTable :columns="columns" :rows="filteredWorkTypes" :loading="loading" row-key="workTypeId">
        <!-- Name -->
        <template #cell-workTypeName="{ value }">
          <span class="text-xs font-bold text-[#171717]">{{ value }}</span>
        </template>
        <!-- Description -->
        <template #cell-workTypeDescription="{ value }">
          <span class="text-xs text-[#666660] max-w-md block truncate font-medium">{{ value || "—" }}</span>
        </template>
        <!-- Status -->
        <template #cell-workTypeIsActive="{ value }">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border"
            :class="value ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#F7F7F5] text-[#9A9A95] border-[#EFEFEA]'"
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
          <div class="flex items-center justify-center gap-2">
            <button
              @click="openEdit(row as any)"
              class="px-2 py-1 text-[11px] font-bold text-[#666660] hover:text-[#171717] bg-[#F7F7F5] hover:bg-[#EFEFEA] border border-[#EFEFEA] transition-colors rounded-lg"
            >
              แก้ไข
            </button>
            <button
              @click="openDelete(row as any)"
              class="px-2 py-1 text-[11px] font-bold text-red-600 bg-white hover:bg-red-50/50 border border-red-200 transition-colors rounded-lg"
            >
              ลบ
            </button>
          </div>
        </template>
      </AdminDataTable>
      <AdminEmptyState v-if="!loading && filteredWorkTypes.length === 0" title="ไม่พบประเภทงาน" description="ไม่มีประเภทงานที่ตรงกับคำค้นหา" icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" @click="modal.open = false" />
          <div class="relative bg-white/90 backdrop-blur-[15px] rounded-[24px] shadow-2xl border border-[#EFEFEA]/80 w-full max-w-md p-6">
            <h3 class="text-base font-black text-[#171717] tracking-tight mb-1">{{ modal.mode === "edit" ? "แก้ไขประเภทงาน" : "เพิ่มประเภทงานใหม่" }}</h3>
            <p class="text-xs text-[#9A9A95] pb-3 border-b border-[#EFEFEA]/60">{{ modal.mode === "edit" ? "แก้ไขข้อมูลรายละเอียดของประเภทงานในระบบ" : "สร้างประเภทงานใหม่สำหรับให้บริการบนระบบ" }}</p>
            <form @submit.prevent="handleSubmit" class="space-y-4 mt-5">
              <div>
                <label for="workTypeName" class="block text-xs font-bold text-[#666660] mb-1.5">ชื่อประเภทงาน *</label>
                <input id="workTypeName" v-model="form.workTypeName" required type="text" placeholder="เช่น Realistic, Anime, Watercolor" class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717] placeholder:text-[#9A9A95]" />
              </div>
              <div>
                <label for="workTypeDescription" class="block text-xs font-bold text-[#666660] mb-1.5">คำอธิบาย</label>
                <textarea id="workTypeDescription" v-model="form.workTypeDescription" rows="3" placeholder="คำอธิบายสั้นๆ สำหรับแสดงให้ลูกค้าเห็น..." class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717] placeholder:text-[#9A9A95] resize-none" />
              </div>
              <div class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl p-3">
                <input v-model="form.workTypeIsActive" type="checkbox" :true-value="1" :false-value="0" id="wt-active" class="rounded border-[#EFEFEA] text-[#171717] focus:ring-0 focus:ring-offset-0" />
                <label for="wt-active" class="text-xs font-bold text-[#171717] select-none cursor-pointer">เปิดใช้งานประเภทงานนี้</label>
              </div>
              <div class="flex gap-2 justify-end pt-4 border-t border-[#EFEFEA]/60 mt-6">
                <AdminActionButton variant="secondary" size="md" @click="modal.open = false">ยกเลิก</AdminActionButton>
                <button
                  type="submit"
                  :disabled="saving"
                  class="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-[#171717] hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl border border-[#171717]"
                >
                  <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  บันทึก
                </button>
              </div>
            </form>
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
