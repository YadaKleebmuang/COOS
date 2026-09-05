<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { useApi } from "~/composables/useApi"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()
const { alert } = useAlert()

type PolicyType = "privacy" | "terms" | "refund"
interface Policy {
  policyId: number
  policyTitle: string
  policyContent: string
  policyType: PolicyType
  policyIsActive: 0 | 1
  policyCreatedAt?: string
}

const typeMap: Record<PolicyType, string> = {
  privacy: "นโยบายความเป็นส่วนตัว",
  terms: "เงื่อนไขการใช้งาน",
  refund: "นโยบายการคืนเงิน"
}

const policies = ref<Policy[]>([])
const loading = ref(true)
const error = ref("")

// Delete Dialog
const deleteDialog = ref({ open: false, loading: false, policyId: 0, name: "" })

// Add/Edit Modal
const policyModal = ref({
  open: false,
  mode: "add" as "add" | "edit",
  loading: false
})
const form = reactive<{
  policyId: number | null
  policyTitle: string
  policyContent: string
  policyType: PolicyType
  policyIsActive: 0 | 1
}>({
  policyId: null,
  policyTitle: "",
  policyContent: "",
  policyType: "privacy",
  policyIsActive: 1
})

const fetchPolicies = async () => {
  loading.value = true
  error.value = ""
  try {
    const data = await apiFetch<Policy[]>("/policies")
    policies.value = data
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถโหลดข้อมูลนโยบายได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchPolicies())

const openAdd = () => {
  form.policyId = null
  form.policyTitle = ""
  form.policyContent = ""
  form.policyType = "privacy"
  form.policyIsActive = 1
  policyModal.value = { open: true, mode: "add", loading: false }
}

const openEdit = (policy: Policy) => {
  form.policyId = policy.policyId
  form.policyTitle = policy.policyTitle
  form.policyContent = policy.policyContent
  form.policyType = policy.policyType
  form.policyIsActive = policy.policyIsActive
  policyModal.value = { open: true, mode: "edit", loading: false }
}

const submitPolicy = async () => {
  policyModal.value.loading = true
  const payload = {
    policyTitle: form.policyTitle,
    policyContent: form.policyContent,
    policyType: form.policyType,
    policyIsActive: form.policyIsActive
  }
  
  try {
    if (form.policyId) {
      await apiFetch(`/policies/${form.policyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    } else {
      await apiFetch("/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    }
    policyModal.value.open = false
    await fetchPolicies()
    alert("สำเร็จ", "บันทึกข้อมูลสำเร็จ", "success")
  } catch (err: any) {
    alert("แจ้งเตือน", err?.message || "ไม่สามารถบันทึกข้อมูลได้", "error")
  } finally {
    policyModal.value.loading = false
  }
}

const openDelete = (policy: Policy) => {
  deleteDialog.value = { open: true, loading: false, policyId: policy.policyId, name: policy.policyTitle }
}

const confirmDelete = async () => {
  deleteDialog.value.loading = true
  try {
    await apiFetch(`/policies/${deleteDialog.value.policyId}`, { method: "DELETE" })
    deleteDialog.value.open = false
    fetchPolicies()
  } catch (err: any) {
    alert("แจ้งเตือน", err?.message || "ลบไม่สำเร็จ", "error")
  } finally {
    deleteDialog.value.loading = false
  }
}

const breadcrumb = [
  { label: "หน้าแรก", to: "/admin/dashboard" },
  { label: "นโยบายและเงื่อนไข" }
]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <AdminBreadcrumb :items="breadcrumb" />
      <div class="flex items-center gap-2">
        <button
          @click="fetchPolicies"
          class="px-4 py-2 rounded-full border border-black/[0.06] bg-white text-[13px] font-medium text-[#171717] hover:bg-[#F7F7F5] transition-colors shadow-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          รีเฟรช
        </button>
      </div>
    </div>

    <!-- Workspace Card -->
    <div class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-lg font-semibold text-[#171717] tracking-tight">นโยบายและเงื่อนไข</h1>
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">แก้ไขข้อความนโยบายต่างๆ ที่แสดงบนหน้าเว็บไซต์</p>
        </div>
                <button
          @click="openAdd"
          class="px-4 py-2 rounded-full border border-black bg-black text-[13px] font-medium text-white hover:bg-[#171717] transition-colors shadow-sm flex items-center gap-2"
        >
          เพิ่มนโยบาย
        </button>
      </div>

      <!-- Error State -->
      <div v-if="error" class="p-12 text-center">
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button @click="fetchPolicies" class="mt-2 text-xs text-[#9A9A95] underline">ลองใหม่</button>
      </div>

      <!-- Table -->
      <div v-else class="flex flex-col flex-1">
        <div class="overflow-x-auto bg-[#FDFDFB]/30 policies-table-scope">
          <AdminDataTable
            :columns="[
              { key: 'policyTitle', label: 'หัวข้อนโยบาย' },
              { key: 'policyType', label: 'ประเภท' },
              { key: 'policyIsActive', label: 'สถานะ', align: 'center' },
              { key: 'action', label: 'การจัดการ', align: 'right' }
            ]"
            :rows="policies"
            :loading="loading"
            row-key="policyId"
          >
            <!-- Title -->
            <template #cell-policyTitle="{ value }">
              <span class="text-[13px] font-medium text-[#171717]">{{ value }}</span>
            </template>
            <!-- Type -->
            <template #cell-policyType="{ value }">
              <span class="text-[13px] text-[#666666]">{{ typeMap[value as keyof typeof typeMap] || value }}</span>
            </template>
            <!-- Status -->
            <template #cell-policyIsActive="{ value }">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border"
                :class="value ? 'bg-[#171717] text-white border-[#171717]' : 'bg-[#F7F7F5] text-[#666666] border-black/[0.06]'"
              >
                {{ value ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
              </span>
            </template>
            <!-- Actions -->
            <template #cell-action="{ row }">
              <div class="flex items-center justify-end gap-2">
                <button
                  @click="openEdit(row as Policy)"
                  class="px-3 py-1.5 text-[11px] font-semibold text-[#171717] bg-white hover:bg-[#F7F7F5] transition-colors rounded-lg shadow-sm border border-black/[0.06]"
                >
                  แก้ไข
                </button>
                <button
                  @click="openDelete(row as Policy)"
                  class="px-3 py-1.5 text-[11px] font-semibold text-[#C53030] bg-[#FFF5F5] hover:bg-[#FED7D7] transition-colors rounded-lg shadow-sm border border-[#FEB2B2]"
                >
                  ลบ
                </button>
              </div>
            </template>
          </AdminDataTable>
        </div>

        <!-- Empty state -->
        <AdminEmptyState
          v-if="!loading && policies.length === 0"
          title="ยังไม่มีนโยบาย"
          description="คลิกเพิ่มนโยบายเพื่อสร้างนโยบายสำหรับใช้งานบนเว็บไซต์"
          icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </div>
    </div>

    <!-- Modal Form (Assignment style) -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="policyModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="policyModal.open = false" />
          <div class="relative bg-white/95 backdrop-blur-[15px] rounded-[24px] shadow-2xl border border-black/[0.06] w-full max-w-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
            
            <!-- Modal Header -->
            <div class="p-6 pb-4 border-b border-black/[0.06] bg-white">
              <h3 class="text-[17px] font-semibold text-[#171717] tracking-tight">{{ policyModal.mode === 'add' ? 'เพิ่มนโยบาย' : 'แก้ไขนโยบาย' }}</h3>
            </div>
            
            <!-- Modal Body -->
            <div class="p-6 overflow-y-auto flex-1 bg-[#FDFDFB]/50 space-y-4">
              <div>
                <label class="block text-xs font-semibold text-[#171717] mb-1.5">หัวข้อนโยบาย</label>
                <input
                  v-model="form.policyTitle"
                  type="text"
                  placeholder="ระบุหัวข้อนโยบาย"
                  class="w-full text-[13px] text-[#171717] bg-white border border-black/[0.12] rounded-xl px-3 py-2.5 focus:border-black/[0.2] focus:shadow-[0_2px_8px_rgba(0,0,0,0.04)] outline-none transition-all placeholder:text-[#9A9A95]"
                />
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-[#171717] mb-1.5">ประเภทนโยบาย</label>
                <select
                  v-model="form.policyType"
                  class="w-full text-[13px] text-[#171717] bg-white border border-black/[0.12] rounded-xl px-3 py-2.5 focus:border-black/[0.2] outline-none transition-all"
                >
                  <option v-for="(label, key) in typeMap" :key="key" :value="key">{{ label }}</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-semibold text-[#171717] mb-1.5">เนื้อหานโยบาย</label>
                <textarea
                  v-model="form.policyContent"
                  rows="14"
                  placeholder="พิมพ์หรือวางข้อความนโยบายที่นี่..."
                  class="w-full text-[13px] text-[#171717] bg-white border border-black/[0.12] rounded-xl px-3 py-2.5 focus:border-black/[0.2] focus:shadow-[0_2px_8px_rgba(0,0,0,0.04)] outline-none transition-all resize-none leading-relaxed font-mono placeholder:text-[#9A9A95]"
                />
              </div>
              
              <div class="flex items-center gap-2 pt-2">
                <input v-model="form.policyIsActive" type="checkbox" :true-value="1" :false-value="0" id="policy-active" class="w-4 h-4 rounded text-black border-gray-300 focus:ring-black" />
                <label for="policy-active" class="text-[13px] text-[#171717] font-medium cursor-pointer">เปิดใช้งานนโยบายนี้</label>
              </div>
            </div>
            
            <!-- Modal Footer -->
            <div class="p-6 pt-4 border-t border-black/[0.06] bg-white flex justify-end gap-3">
              <button
                @click="policyModal.open = false"
                class="px-5 py-2.5 text-[13px] font-semibold text-[#666666] bg-white hover:bg-[#F7F7F5] transition-colors rounded-[10px] border border-black/[0.06]"
              >
                ยกเลิก
              </button>
              <button
                @click="submitPolicy"
                :disabled="policyModal.loading"
                class="px-5 py-2.5 text-[13px] font-semibold text-white bg-black hover:bg-[#171717] transition-colors rounded-[10px] border border-black/[0.06] flex items-center gap-2"
              >
                <svg v-if="policyModal.loading" class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm Dialog -->
    <AdminConfirmDialog
      :open="deleteDialog.open"
      title="ยืนยันการลบนโยบาย"
      :message="`คุณต้องการลบนโยบาย '${deleteDialog.name}' ใช่หรือไม่?`"
      confirm-label="ลบนโยบาย"
      :danger="true"
      :loading="deleteDialog.loading"
      @confirm="confirmDelete"
      @cancel="deleteDialog.open = false"
    />
  </div>
</template>

<style scoped>
/* 
  Override shared DataTable styles to match Dashboard neutral tones
  and remove rounded corners.
*/
.policies-table-scope :deep(.rounded-xl) {
  border-radius: 0 !important;
  border-color: rgba(0, 0, 0, 0.06) !important;
}

.policies-table-scope :deep(thead.bg-gray-50) {
  background-color: rgba(247, 247, 245, 0.8) !important;
  border-bottom-color: rgba(0, 0, 0, 0.06) !important;
}

.policies-table-scope :deep(tbody.bg-white tr:hover) {
  background-color: #FDFDFB !important;
}

.policies-table-scope :deep(tbody.bg-white.divide-gray-100 > tr) {
  border-color: rgba(0, 0, 0, 0.04) !important;
}
</style>
