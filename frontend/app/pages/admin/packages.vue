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
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-lg font-black text-[#171717] tracking-tight">แพ็กเกจ</h1>
        <p class="mt-0.5 text-xs text-[#9A9A95]">จัดการราคาและรายละเอียดแพ็กเกจบริการ</p>
      </div>
      <div class="flex gap-2">
        <AdminActionButton variant="secondary" size="sm" :loading="loading" icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" @click="fetchPackages">รีเฟรช</AdminActionButton>
        <AdminActionButton variant="primary" size="sm" icon="M12 4v16m8-8H4" @click="openAdd">เพิ่มแพ็กเกจ</AdminActionButton>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-white border border-red-100 rounded-2xl p-6 text-center">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white border border-[#EFEFEA]/60 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.01)] overflow-hidden">
      <AdminDataTable :columns="columns" :rows="packages" :loading="loading" row-key="packageId">
        <!-- Name + Description -->
        <template #cell-packageName="{ row }">
          <div>
            <p class="text-xs font-bold text-[#171717]">{{ row.packageName }}</p>
            <p v-if="row.packageDescription" class="text-[11px] text-[#9A9A95] mt-0.5 max-w-xs truncate">{{ row.packageDescription }}</p>
          </div>
        </template>
        <!-- Image count -->
        <template #cell-packageImageCount="{ value }">
          <span class="text-xs font-medium text-[#171717] font-number">{{ value }} ภาพ</span>
        </template>
        <!-- Resolution -->
        <template #cell-packageResolution="{ value }">
          <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#EFEFEA] text-[#171717] border border-white/50 shadow-[0_1px_4px_rgba(0,0,0,0.005)]">
            {{ value === 'FullHD' ? 'Full HD' : value }}
          </span>
        </template>
        <!-- Delivery days -->
        <template #cell-packageDeliveryDays="{ value }">
          <span class="text-xs font-medium text-[#171717] font-number">{{ value }} วัน</span>
        </template>
        <!-- Price -->
        <template #cell-packagePrice="{ value }">
          <span class="text-xs font-bold text-[#171717] font-number">{{ formatPrice(value) }}</span>
        </template>
        <!-- Urgent price -->
        <template #cell-packageUrgentPrice="{ value }">
          <span class="text-xs text-[#9A9A95] font-number font-medium">{{ formatPrice(value) }}</span>
        </template>
        <!-- Status -->
        <template #cell-packageIsActive="{ value }">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold border"
            :class="value ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-[#F7F7F5] text-[#9A9A95] border-[#EFEFEA]'"
          >
            {{ value ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
          </span>
        </template>
        <!-- Actions -->
        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-2">
            <button
              @click="openEdit(asPackage(row))"
              class="px-2 py-1 text-[11px] font-bold text-[#666660] hover:text-[#171717] bg-[#F7F7F5] hover:bg-[#EFEFEA] border border-[#EFEFEA] transition-colors rounded-lg"
            >
              แก้ไข
            </button>
            <button
              @click="openDelete(asPackage(row))"
              class="px-2 py-1 text-[11px] font-bold text-red-600 bg-white hover:bg-red-50/50 border border-red-200 transition-colors rounded-lg"
            >
              ลบ
            </button>
          </div>
        </template>
      </AdminDataTable>
      <AdminEmptyState v-if="!loading && packages.length === 0" title="ยังไม่มีแพ็กเกจ" description="กดปุ่มเพิ่มแพ็กเกจเพื่อสร้างรายการแรก" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" @click="modal.open = false" />
          <div class="relative bg-white/90 backdrop-blur-[15px] rounded-[24px] shadow-2xl border border-[#EFEFEA]/80 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 class="text-base font-black text-[#171717] tracking-tight mb-1">{{ modal.mode === "edit" ? "แก้ไขแพ็กเกจ" : "เพิ่มแพ็กเกจใหม่" }}</h3>
            <p class="text-xs text-[#9A9A95] pb-3 border-b border-[#EFEFEA]/60">{{ modal.mode === "edit" ? "แก้ไขข้อมูลรายละเอียดของแพ็กเกจในระบบ" : "สร้างแพ็กเกจบริการใหม่สำหรับลูกค้าบนระบบ" }}</p>
            <form @submit.prevent="handleSubmit" class="space-y-4 mt-5">
              <!-- Name -->
              <div>
                <label class="block text-xs font-bold text-[#666660] mb-1.5">ชื่อแพ็กเกจ *</label>
                <input v-model="form.packageName" required type="text" class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717] placeholder:text-[#9A9A95]" placeholder="เช่น Basic, Standard, Professional" />
              </div>
              <!-- Description -->
              <div>
                <label class="block text-xs font-bold text-[#666660] mb-1.5">คำอธิบาย</label>
                <textarea v-model="form.packageDescription" rows="2" class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717] placeholder:text-[#9A9A95] resize-none" />
              </div>
              <!-- Row 1 -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-[#666660] mb-1.5">จำนวนภาพ *</label>
                  <input v-model.number="form.packageImageCount" required type="number" min="1" class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717]" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-[#666660] mb-1.5">ความละเอียด *</label>
                  <select v-model="form.packageResolution" class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717]">
                    <option value="FullHD">Full HD</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
              </div>
              <!-- Row 2 -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-[#666660] mb-1.5">ราคา (฿) *</label>
                  <input v-model.number="form.packagePrice" required type="number" min="0" class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717]" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-[#666660] mb-1.5">ระยะเวลาส่งงาน (วัน) *</label>
                  <input v-model.number="form.packageDeliveryDays" required type="number" min="1" class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717]" />
                </div>
              </div>
              <!-- Row 3 -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-[#666660] mb-1.5">ค่าบริการเร่งด่วน (฿)</label>
                  <input v-model.number="form.packageUrgentPrice" type="number" min="0" class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717]" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-[#666660] mb-1.5">ส่วนลดแกลเลอรี (%)</label>
                  <input v-model.number="form.packageGalleryDiscount" type="number" min="0" max="100" class="w-full text-xs px-3 py-2.5 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717]" />
                </div>
              </div>
              <!-- Active toggle -->
              <div class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl p-3">
                <input v-model="form.packageIsActive" type="checkbox" :true-value="1" :false-value="0" id="pkg-active" class="rounded border-[#EFEFEA] text-[#171717] focus:ring-0 focus:ring-offset-0" />
                <label for="pkg-active" class="text-xs font-bold text-[#171717] select-none cursor-pointer">เปิดใช้งานแพ็กเกจนี้</label>
              </div>
              <!-- Actions -->
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
