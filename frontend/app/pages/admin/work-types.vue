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
    alert(err?.message || "ดำเนินการไม่สำเร็จ")
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
    alert(err?.message || "ดำเนินการไม่สำเร็จ")
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
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">จัดการประเภทงาน</h1>
        <p class="mt-0.5 text-sm text-gray-500">กำหนดประเภทงานที่ให้บริการตกแต่งภาพในระบบ</p>
      </div>
      <div class="flex gap-2">
        <AdminActionButton variant="secondary" size="sm" :loading="loading" @click="fetchWorkTypes">รีเฟรช</AdminActionButton>
        <AdminActionButton variant="primary" size="sm" icon="M12 4v16m8-8H4" @click="openAdd">เพิ่มประเภทงาน</AdminActionButton>
      </div>
    </div>

    <!-- Search -->
    <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 max-w-sm">
      <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input v-model="searchQuery" type="text" placeholder="ค้นหาประเภทงาน..." class="text-sm text-gray-700 bg-transparent outline-none flex-1 placeholder:text-gray-400" />
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-white border border-red-200 rounded-xl p-6 text-center">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <AdminDataTable :columns="columns" :rows="filteredWorkTypes" :loading="loading" row-key="workTypeId">
        <!-- Name -->
        <template #cell-workTypeName="{ value }">
          <span class="text-sm font-semibold text-gray-900">{{ value }}</span>
        </template>
        <!-- Description -->
        <template #cell-workTypeDescription="{ value }">
          <span class="text-xs text-gray-500 max-w-xs block truncate">{{ value || "—" }}</span>
        </template>
        <!-- Status -->
        <template #cell-workTypeIsActive="{ value }">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
            :class="value ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'"
          >
            {{ value ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
          </span>
        </template>
        <!-- Date -->
        <template #cell-workTypeCreatedAt="{ value }">
          <span class="text-xs text-gray-400">{{ formatDate(value) }}</span>
        </template>
        <!-- Actions -->
        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-1.5">
            <AdminActionButton variant="secondary" size="sm" @click="openEdit(row)">แก้ไข</AdminActionButton>
            <AdminActionButton variant="danger" size="sm" @click="openDelete(row)">ลบ</AdminActionButton>
          </div>
        </template>
      </AdminDataTable>
      <AdminEmptyState v-if="!loading && filteredWorkTypes.length === 0" title="ไม่พบประเภทงาน" description="ไม่มีประเภทงานที่ตรงกับคำค้นหา" icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="modal.open = false" />
          <div class="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6">
            <h3 class="text-sm font-bold text-gray-900 mb-5">{{ modal.mode === "edit" ? "แก้ไขประเภทงาน" : "เพิ่มประเภทงานใหม่" }}</h3>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label for="workTypeName" class="block text-xs font-medium text-gray-500 mb-1">ชื่อประเภทงาน *</label>
                <input id="workTypeName" v-model="form.workTypeName" required type="text" placeholder="เช่น Realistic, Anime, Watercolor" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400" />
              </div>
              <div>
                <label for="workTypeDescription" class="block text-xs font-medium text-gray-500 mb-1">คำอธิบาย</label>
                <textarea id="workTypeDescription" v-model="form.workTypeDescription" rows="3" placeholder="คำอธิบายสั้นๆ สำหรับแสดงให้ลูกค้าเห็น..." class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none" />
              </div>
              <div class="flex items-center gap-2">
                <input v-model="form.workTypeIsActive" type="checkbox" :true-value="1" :false-value="0" id="wt-active" class="rounded" />
                <label for="wt-active" class="text-sm text-gray-700">เปิดใช้งานประเภทงานนี้</label>
              </div>
              <div class="flex gap-2 justify-end pt-2 border-t border-gray-100 mt-2">
                <AdminActionButton variant="secondary" size="md" @click="modal.open = false">ยกเลิก</AdminActionButton>
                <AdminActionButton variant="primary" size="md" :loading="saving">
                  <button type="submit" class="contents">บันทึก</button>
                </AdminActionButton>
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
      :message="`คุณต้องการลบประเภทงาน '${deleteDialog.name}' ใช่หรือไม่?`"
      confirm-label="ลบประเภทงาน"
      :danger="true"
      :loading="deleteDialog.loading"
      @confirm="confirmDelete"
      @cancel="deleteDialog.open = false"
    />
  </div>
</template>
