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
    alert(err?.message || "ดำเนินการไม่สำเร็จ")
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
    alert(err?.message || "ลบไม่สำเร็จ")
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
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">จัดการแพ็กเกจบริการ</h1>
        <p class="mt-0.5 text-sm text-gray-500">เพิ่ม แก้ไข หรือปิดใช้งานแพ็กเกจบริการตกแต่งภาพ</p>
      </div>
      <div class="flex gap-2">
        <AdminActionButton variant="secondary" size="sm" :loading="loading" @click="fetchPackages">รีเฟรช</AdminActionButton>
        <AdminActionButton variant="primary" size="sm" icon="M12 4v16m8-8H4" @click="openAdd">เพิ่มแพ็กเกจ</AdminActionButton>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-white border border-red-200 rounded-xl p-6 text-center">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <AdminDataTable :columns="columns" :rows="packages" :loading="loading" row-key="packageId">
        <!-- Name + Description -->
        <template #cell-packageName="{ row }">
          <div>
            <p class="text-sm font-semibold text-gray-900">{{ row.packageName }}</p>
            <p v-if="row.packageDescription" class="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{{ row.packageDescription }}</p>
          </div>
        </template>
        <!-- Image count -->
        <template #cell-packageImageCount="{ value }">
          <span class="text-sm font-number text-gray-700">{{ value }} ภาพ</span>
        </template>
        <!-- Resolution -->
        <template #cell-packageResolution="{ value }">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            {{ value }}
          </span>
        </template>
        <!-- Delivery days -->
        <template #cell-packageDeliveryDays="{ value }">
          <span class="text-sm font-number text-gray-700">{{ value }} วัน</span>
        </template>
        <!-- Price -->
        <template #cell-packagePrice="{ value }">
          <span class="text-sm font-bold text-gray-900 font-number">{{ formatPrice(value) }}</span>
        </template>
        <!-- Urgent price -->
        <template #cell-packageUrgentPrice="{ value }">
          <span class="text-xs text-gray-500 font-number">{{ formatPrice(value) }}</span>
        </template>
        <!-- Status -->
        <template #cell-packageIsActive="{ value }">
          <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
            :class="value ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'"
          >
            {{ value ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
          </span>
        </template>
        <!-- Actions -->
        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-1.5">
            <AdminActionButton variant="secondary" size="sm" @click="openEdit(row)">แก้ไข</AdminActionButton>
            <AdminActionButton variant="danger" size="sm" @click="openDelete(row)">ลบ</AdminActionButton>
          </div>
        </template>
      </AdminDataTable>
      <AdminEmptyState v-if="!loading && packages.length === 0" title="ยังไม่มีแพ็กเกจ" description="กดปุ่มเพิ่มแพ็กเกจเพื่อสร้างรายการแรก" icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="modal.open = false" />
          <div class="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 class="text-sm font-bold text-gray-900 mb-5">{{ modal.mode === "edit" ? "แก้ไขแพ็กเกจ" : "เพิ่มแพ็กเกจใหม่" }}</h3>
            <form @submit.prevent="handleSubmit" class="space-y-4">
              <!-- Name -->
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">ชื่อแพ็กเกจ *</label>
                <input v-model="form.packageName" required type="text" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400" placeholder="เช่น Basic, Standard, Professional" />
              </div>
              <!-- Description -->
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">คำอธิบาย</label>
                <textarea v-model="form.packageDescription" rows="2" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none" />
              </div>
              <!-- Row 1 -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">จำนวนภาพ *</label>
                  <input v-model.number="form.packageImageCount" required type="number" min="1" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">ความละเอียด *</label>
                  <select v-model="form.packageResolution" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400">
                    <option value="FullHD">Full HD</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
              </div>
              <!-- Row 2 -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">ราคา (฿) *</label>
                  <input v-model.number="form.packagePrice" required type="number" min="0" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">ระยะเวลาส่งงาน (วัน) *</label>
                  <input v-model.number="form.packageDeliveryDays" required type="number" min="1" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400" />
                </div>
              </div>
              <!-- Row 3 -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">ค่าบริการเร่งด่วน (฿)</label>
                  <input v-model.number="form.packageUrgentPrice" type="number" min="0" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1">ส่วนลด Gallery (%)</label>
                  <input v-model.number="form.packageGalleryDiscount" type="number" min="0" max="100" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400" />
                </div>
              </div>
              <!-- Active toggle -->
              <div class="flex items-center gap-2">
                <input v-model="form.packageIsActive" type="checkbox" :true-value="1" :false-value="0" id="pkg-active" class="rounded" />
                <label for="pkg-active" class="text-sm text-gray-700">เปิดใช้งานแพ็กเกจนี้</label>
              </div>
              <!-- Actions -->
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
      title="ยืนยันการลบแพ็กเกจ"
      :message="`คุณต้องการลบแพ็กเกจ '${deleteDialog.name}' ใช่หรือไม่?`"
      confirm-label="ลบแพ็กเกจ"
      :danger="true"
      :loading="deleteDialog.loading"
      @confirm="confirmDelete"
      @cancel="deleteDialog.open = false"
    />
  </div>
</template>
