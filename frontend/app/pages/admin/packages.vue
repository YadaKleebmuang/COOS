<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import { orderService } from "~/services/order.service"
import type { Package } from "~/types/order.types"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()
const { alert } = useAlert()

// ── State ──────────────────────────────────────────────────────
const packages = ref<Package[]>([])
const loading = ref(true)
const error = ref("")
const saving = ref(false)

const modal = ref({ open: false, mode: "add" as "add" | "edit" })
const deleteDialog = ref({ open: false, loading: false, packageId: 0, name: "" })

const form = reactive<Omit<Package, "packageId" | "packageCreatedAt" | "packageUpdatedAt">>({
  packageName: "",
  packageDescription: "",
  packagePrice: 0,
  packageImageCount: 5,
  packageResolution: "FullHD",
  packageDeliveryDays: 5,
  packageUrgentPrice: null,
  packageGalleryDiscount: 20,
  packageIsActive: 1
})
const editingId = ref<number | null>(null)

// ── API ────────────────────────────────────────────────────────
const fetchPackages = async () => {
  loading.value = true
  error.value = ""
  try {
    packages.value = await orderService.getPackages()
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถโหลดข้อมูลแพ็กเกจได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchPackages())

// ── Table columns ──────────────────────────────────────────────
const columns = [
  { key: "packageName", label: "ชื่อแพ็กเกจ" },
  { key: "packageImageCount", label: "จำนวนภาพ", align: "center" as const },
  { key: "packageResolution", label: "ความละเอียด", align: "center" as const },
  { key: "packageDeliveryDays", label: "ระยะเวลาส่ง", align: "center" as const },
  { key: "packagePrice", label: "ราคา (฿)", align: "right" as const },
  { key: "packageUrgentPrice", label: "ค่าเร่งด่วน (฿)", align: "right" as const },
  { key: "packageIsActive", label: "สถานะ", align: "center" as const },
  { key: "action", label: "การจัดการ", align: "center" as const }
]

// ── Modal ──────────────────────────────────────────────────────
const resetForm = () => {
  form.packageName = ""
  form.packageDescription = ""
  form.packagePrice = 0
  form.packageImageCount = 5
  form.packageResolution = "FullHD"
  form.packageDeliveryDays = 5
  form.packageUrgentPrice = null
  form.packageGalleryDiscount = 20
  form.packageIsActive = 1
}

const openAdd = () => {
  resetForm()
  editingId.value = null
  modal.value = { open: true, mode: "add" }
}

const asPackage = (row: Record<string, unknown>): Package => row as unknown as Package

const openEdit = (pkg: Package) => {
  editingId.value = pkg.packageId
  form.packageName = pkg.packageName
  form.packageDescription = pkg.packageDescription ?? ""
  form.packagePrice = pkg.packagePrice
  form.packageImageCount = pkg.packageImageCount
  form.packageResolution = pkg.packageResolution
  form.packageDeliveryDays = pkg.packageDeliveryDays
  form.packageUrgentPrice = pkg.packageUrgentPrice
  form.packageGalleryDiscount = pkg.packageGalleryDiscount
  form.packageIsActive = pkg.packageIsActive
  modal.value = { open: true, mode: "edit" }
}

const handleSubmit = async () => {
  saving.value = true
  try {
    if (modal.value.mode === "edit" && editingId.value) {
      await apiFetch(`/packages/${editingId.value}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
    } else {
      await apiFetch("/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
    }
    modal.value.open = false
    fetchPackages()
  } catch (err: any) {
    alert("แจ้งเตือน", err?.message || "ดำเนินการไม่สำเร็จ", "error")
  } finally {
    saving.value = false
  }
}

const openDelete = (pkg: Package) => {
  deleteDialog.value = { open: true, loading: false, packageId: pkg.packageId, name: pkg.packageName }
}

const confirmDelete = async () => {
  deleteDialog.value.loading = true
  try {
    await apiFetch(`/packages/${deleteDialog.value.packageId}`, { method: "DELETE" })
    deleteDialog.value.open = false
    fetchPackages()
  } catch (err: any) {
    alert("แจ้งเตือน", err?.message || "ลบไม่สำเร็จ", "error")
  } finally {
    deleteDialog.value.loading = false
  }
}

const formatPrice = (n: number | null) => n != null ? `฿${Number(n).toLocaleString("th-TH")}` : "—"

const breadcrumb = [
  { label: "หน้าแรก", to: "/admin/dashboard" },
  { label: "แพ็กเกจ" }
]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <AdminBreadcrumb :items="breadcrumb" />
      <button
        @click="fetchPackages"
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
      
      <!-- Header -->
      <div class="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.06]">
        <div>
          <h2 class="text-lg font-semibold text-[#171717] tracking-tight">แพ็กเกจทั้งหมด</h2>
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">จัดการราคาและรายละเอียดแพ็กเกจบริการ</p>
        </div>
        <div class="flex items-center gap-3">
          <button @click="openAdd" class="px-4 py-2 text-[13px] font-semibold text-white bg-black hover:bg-[#171717] transition-colors rounded-xl shadow-sm border border-black/[0.06] whitespace-nowrap">
            เพิ่มแพ็กเกจ
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="p-12 text-center">
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button @click="fetchPackages" class="mt-2 text-xs text-[#9A9A95] underline">ลองใหม่</button>
      </div>

      <!-- Table -->
      <div v-else class="flex flex-col flex-1">
        <div class="overflow-x-auto bg-[#FDFDFB]/30 packages-table-scope">
          <AdminDataTable :columns="columns" :rows="packages" :loading="loading" row-key="packageId">
            <!-- Name + Description -->
            <template #cell-packageName="{ row }">
              <div>
                <p class="text-[13px] font-medium text-[#171717]">{{ row.packageName }}</p>
                <p v-if="row.packageDescription" class="text-xs text-[#9A9A95] mt-0.5 max-w-xs truncate">{{ row.packageDescription }}</p>
              </div>
            </template>
            <!-- Image count -->
            <template #cell-packageImageCount="{ value }">
              <span class="text-[13px] font-medium text-[#171717] font-number">{{ value }} ภาพ</span>
            </template>
            <!-- Resolution -->
            <template #cell-packageResolution="{ value }">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#F7F7F5] text-[#171717] border border-black/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                {{ value === 'FullHD' ? 'Full HD' : value }}
              </span>
            </template>
            <!-- Delivery days -->
            <template #cell-packageDeliveryDays="{ value }">
              <span class="text-[13px] font-medium text-[#171717] font-number">{{ value }} วัน</span>
            </template>
            <!-- Price -->
            <template #cell-packagePrice="{ value }">
              <span class="text-[13px] font-semibold text-[#171717] font-number">{{ formatPrice(value) }}</span>
            </template>
            <!-- Urgent price -->
            <template #cell-packageUrgentPrice="{ value }">
              <span class="text-xs text-[#9A9A95] font-number font-medium">{{ formatPrice(value) }}</span>
            </template>
            <!-- Status -->
            <template #cell-packageIsActive="{ value }">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap"
                :class="value ? 'bg-[#F7F7F5] text-[#171717] border-black/[0.06] shadow-sm' : 'bg-[#FDFDFB] text-[#666666] border-black/[0.04]'"
              >
                {{ value ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
              </span>
            </template>
            <!-- Actions -->
            <template #cell-action="{ row }">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  @click="openEdit(asPackage(row))"
                  class="px-2 py-1 text-[11px] font-semibold text-[#171717] bg-white hover:bg-[#F7F7F5] transition-colors rounded shadow-sm border border-black/[0.06]"
                >
                  แก้ไข
                </button>
                <button
                  @click="openDelete(asPackage(row))"
                  class="px-2 py-1 text-[11px] font-semibold text-[#C53030] bg-[#FFF5F5] hover:bg-[#FED7D7] transition-colors rounded shadow-sm border border-[#FEB2B2]"
                >
                  ลบ
                </button>
              </div>
            </template>
          </AdminDataTable>
        </div>
        <AdminEmptyState v-if="!loading && packages.length === 0" title="ยังไม่มีแพ็กเกจ" description="กดปุ่มเพิ่มแพ็กเกจเพื่อสร้างรายการแรก" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="modal.open = false" />
          <div class="relative bg-white/95 backdrop-blur-[15px] rounded-[24px] shadow-2xl border border-black/[0.06] w-full max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">
            
            <!-- Modal Header -->
            <div class="p-6 pb-4 border-b border-black/[0.06] bg-white">
              <h3 class="text-[17px] font-semibold text-[#171717] tracking-tight mb-2">{{ modal.mode === "edit" ? "แก้ไขแพ็กเกจ" : "เพิ่มแพ็กเกจใหม่" }}</h3>
              <p class="text-[13px] text-[#666666]">{{ modal.mode === "edit" ? "แก้ไขข้อมูลรายละเอียดของแพ็กเกจในระบบ" : "สร้างแพ็กเกจบริการใหม่สำหรับลูกค้าบนระบบ" }}</p>
            </div>
            
            <!-- Modal Body -->
            <div class="p-6 overflow-y-auto flex-1 bg-[#FDFDFB]/50">
              <form id="packageForm" @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Name -->
                <div>
                  <label class="block text-xs font-semibold text-[#171717] mb-1.5">ชื่อแพ็กเกจ *</label>
                  <input v-model="form.packageName" required type="text" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717] placeholder:text-[#9A9A95]" placeholder="เช่น Basic, Standard, Professional" />
                </div>
                <!-- Description -->
                <div>
                  <label class="block text-xs font-semibold text-[#171717] mb-1.5">คำอธิบาย</label>
                  <textarea v-model="form.packageDescription" rows="2" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717] placeholder:text-[#9A9A95] resize-none" />
                </div>
                <!-- Row 1 -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-[#171717] mb-1.5">จำนวนภาพ *</label>
                    <input v-model.number="form.packageImageCount" required type="number" min="1" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717]" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[#171717] mb-1.5">ความละเอียด *</label>
                    <select v-model="form.packageResolution" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717]">
                      <option value="FullHD">Full HD</option>
                      <option value="4K">4K</option>
                    </select>
                  </div>
                </div>
                <!-- Row 2 -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-[#171717] mb-1.5">ราคา (฿) *</label>
                    <input v-model.number="form.packagePrice" required type="number" min="0" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717]" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[#171717] mb-1.5">ระยะเวลาส่งงาน (วัน) *</label>
                    <input v-model.number="form.packageDeliveryDays" required type="number" min="1" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717]" />
                  </div>
                </div>
                <!-- Row 3 -->
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-[#171717] mb-1.5">ค่าบริการเร่งด่วน (฿)</label>
                    <input v-model.number="form.packageUrgentPrice" type="number" min="0" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717]" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[#171717] mb-1.5">ส่วนลดแกลเลอรี (%)</label>
                    <input v-model.number="form.packageGalleryDiscount" type="number" min="0" max="100" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717]" />
                  </div>
                </div>
                <!-- Active toggle -->
                <div class="flex items-center gap-3 bg-white border border-black/[0.06] rounded-xl p-3.5 shadow-sm mt-2">
                  <input v-model="form.packageIsActive" type="checkbox" :true-value="1" :false-value="0" id="pkg-active" class="w-4 h-4 rounded border-gray-300 text-black focus:ring-0 focus:ring-offset-0 transition-colors" />
                  <label for="pkg-active" class="text-[13px] font-medium text-[#171717] select-none cursor-pointer flex-1">เปิดใช้งานแพ็กเกจนี้</label>
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
                form="packageForm"
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
      title="ยืนยันการลบแพ็กเกจ"
      :message="`คุณต้องการลบแพ็กเกจ '${deleteDialog.name}' ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`"
      confirm-label="ลบแพ็กเกจ"
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
.packages-table-scope :deep(.rounded-xl) {
  border-radius: 0 !important;
  border-color: rgba(0, 0, 0, 0.06) !important;
}

.packages-table-scope :deep(thead.bg-gray-50) {
  background-color: rgba(247, 247, 245, 0.8) !important;
  border-bottom-color: rgba(0, 0, 0, 0.06) !important;
}

.packages-table-scope :deep(tbody.bg-white tr:hover) {
  background-color: #FDFDFB !important;
}

.packages-table-scope :deep(tbody.bg-white.divide-gray-100 > tr) {
  border-color: rgba(0, 0, 0, 0.04) !important;
}
</style>
