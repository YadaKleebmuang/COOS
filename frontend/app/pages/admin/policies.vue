<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()
const { alert } = useAlert()

// ── Types ──────────────────────────────────────────────────────
type PolicyType = "privacy" | "terms" | "refund"

interface Policy {
  policyId: number
  policyTitle: string
  policyContent: string
  policyType: PolicyType
  policyIsActive: 0 | 1
  policyCreatedAt?: string
}

// ── Tabs ───────────────────────────────────────────────────────
const tabs: { key: PolicyType; label: string }[] = [
  { key: "privacy", label: "นโยบายความเป็นส่วนตัว" },
  { key: "terms", label: "เงื่อนไขการใช้งาน" },
  { key: "refund", label: "นโยบายการคืนเงิน" }
]
const activeTab = ref<PolicyType>("privacy")

// ── State ──────────────────────────────────────────────────────
const policies = ref<Policy[]>([])
const loading = ref(true)
const error = ref("")
const saving = ref(false)
const preview = ref(true)

const notification = ref<{ show: boolean, type: 'success' | 'error', message: string }>({ show: false, type: 'success', message: '' })

const showNotification = (type: 'success' | 'error', message: string) => {
  notification.value = { show: true, type, message }
  if (type === 'success') {
    setTimeout(() => {
      notification.value.show = false
    }, 3000)
  }
}

// Per-tab edit form
const form = reactive<Record<PolicyType, { policyId: number | null; policyTitle: string; policyContent: string; policyIsActive: 0 | 1 }>>({
  privacy: { policyId: null, policyTitle: "", policyContent: "", policyIsActive: 1 },
  terms: { policyId: null, policyTitle: "", policyContent: "", policyIsActive: 1 },
  refund: { policyId: null, policyTitle: "", policyContent: "", policyIsActive: 1 }
})

// Delete
const deleteDialog = ref({ open: false, loading: false, policyId: 0, name: "" })

// ── API ────────────────────────────────────────────────────────
const fetchPolicies = async () => {
  loading.value = true
  error.value = ""
  try {
    const data = await apiFetch<Policy[]>("/policies")
    policies.value = data

    // Populate forms from fetched data
    for (const tab of tabs) {
      const found = data.find(p => p.policyType === tab.key)
      if (found) {
        form[tab.key] = {
          policyId: found.policyId,
          policyTitle: found.policyTitle,
          policyContent: found.policyContent,
          policyIsActive: found.policyIsActive
        }
      } else {
        // Default placeholder text
        const defaultTitles: Record<PolicyType, string> = {
          privacy: "นโยบายความเป็นส่วนตัว",
          terms: "เงื่อนไขการใช้งาน",
          refund: "นโยบายการคืนเงิน"
        }
        form[tab.key] = { policyId: null, policyTitle: defaultTitles[tab.key], policyContent: "", policyIsActive: 1 }
      }
    }
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถโหลดข้อมูลนโยบายได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchPolicies())

// ── Current tab form ───────────────────────────────────────────
const currentForm = computed(() => form[activeTab.value])

// ── Save ───────────────────────────────────────────────────────
const handleSave = async () => {
  saving.value = true
  notification.value.show = false
  const f = currentForm.value
  const payload = {
    policyTitle: f.policyTitle,
    policyContent: f.policyContent,
    policyType: activeTab.value,
    policyIsActive: f.policyIsActive
  }
  try {
    if (f.policyId) {
      await apiFetch(`/policies/${f.policyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    } else {
      const res = await apiFetch<{ policyId: number }>("/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      form[activeTab.value].policyId = res.policyId ?? null
    }
    await fetchPolicies()
    showNotification("success", "บันทึกข้อมูลสำเร็จ")
    preview.value = true
  } catch (err: any) {
    showNotification("error", err?.message || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง")
  } finally {
    saving.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────
const asPolicy = (row: Record<string, unknown>): Policy => row as unknown as Policy

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

const currentTabPolicy = computed(() => policies.value.find(p => p.policyType === activeTab.value))

const breadcrumb = [
  { label: "หน้าแรก", to: "/admin/dashboard" },
  { label: "นโยบายและเงื่อนไข" }
]
</script>

<template>
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">จัดการนโยบายและเงื่อนไข</h1>
        <p class="mt-0.5 text-sm text-gray-500">แก้ไขข้อความนโยบายต่างๆ ที่แสดงบนหน้าเว็บไซต์</p>
      </div>
      <AdminActionButton variant="secondary" size="sm" :loading="loading" @click="fetchPolicies">รีเฟรช</AdminActionButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl p-16 text-center">
      <div class="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-3" />
      <p class="text-sm text-gray-400">กำลังโหลดข้อมูลนโยบาย...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white border border-red-200 rounded-xl p-6 text-center">
      <p class="text-sm text-red-600">{{ error }}</p>
    </div>

    <template v-else>
      <!-- Tabs -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <!-- Tab bar -->
        <div class="flex border-b border-gray-200 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key; preview = true; notification.show = false"
            class="flex-shrink-0 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px"
            :class="activeTab === tab.key
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Editor area -->
        <div class="p-6 space-y-4">
          <!-- Status badge + existing -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <h2 class="text-sm font-bold text-gray-900">{{ currentForm.policyTitle || tabs.find(t => t.key === activeTab)?.label }}</h2>
              <span
                v-if="currentTabPolicy"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
                :class="currentTabPolicy.policyIsActive ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'"
              >
                {{ currentTabPolicy.policyIsActive ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
              </span>
              <span v-else class="text-xs text-gray-400">ยังไม่มีข้อมูล</span>
            </div>
            <div class="flex items-center gap-2">
              <AdminActionButton variant="secondary" size="sm" @click="preview = !preview">
                {{ preview ? "แก้ไข" : "ดูตัวอย่าง" }}
              </AdminActionButton>
              <AdminActionButton v-if="currentTabPolicy" variant="danger" size="sm" @click="openDelete(currentTabPolicy)">ลบ</AdminActionButton>
            </div>
          </div>

          <!-- Title input -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">หัวข้อนโยบาย</label>
            <input
              v-model="currentForm.policyTitle"
              type="text"
              class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
              :placeholder="tabs.find(t => t.key === activeTab)?.label"
            />
          </div>

          <!-- Preview mode -->
          <div v-if="preview" class="min-h-64 p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <h3 class="text-sm font-bold text-gray-900 mb-3">{{ currentForm.policyTitle }}</h3>
            <div class="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {{ currentForm.policyContent || "ยังไม่มีเนื้อหา" }}
            </div>
          </div>

          <!-- Editor mode -->
          <div v-else>
            <label class="block text-xs font-medium text-gray-500 mb-1">เนื้อหาของนโยบาย</label>
            <textarea
              v-model="currentForm.policyContent"
              rows="14"
              class="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none leading-relaxed font-mono"
              placeholder="พิมพ์หรือวางข้อความนโยบายที่นี่..."
            />
          </div>

          <!-- Active toggle -->
          <div class="flex items-center gap-2 pt-2 border-t border-gray-100">
            <input v-model="currentForm.policyIsActive" type="checkbox" :true-value="1" :false-value="0" id="policy-active" class="rounded" />
            <label for="policy-active" class="text-sm text-gray-700">เปิดใช้งานนโยบายนี้</label>
          </div>

          <!-- Save + Preview buttons -->
          <div class="flex items-center justify-between pt-2">
            <div>
              <p v-if="!notification.show" class="text-xs text-gray-400">
                {{ currentTabPolicy ? `บันทึกล่าสุด: แก้ไขข้อมูล` : "นโยบายนี้ยังไม่เคยบันทึก" }}
              </p>
              <div v-else class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border" :class="notification.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'">
                <svg v-if="notification.type === 'success'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                <span>{{ notification.message }}</span>
              </div>
            </div>
            
            <AdminActionButton variant="primary" size="md" @click="handleSave">
              บันทึกนโยบาย
            </AdminActionButton>
          </div>
        </div>
      </div>

      <!-- All policies summary table -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-sm font-bold text-gray-900">รายการนโยบายทั้งหมด</h2>
        </div>
        <AdminDataTable
          :columns="[
            { key: 'policyTitle', label: 'หัวข้อนโยบาย' },
            { key: 'policyType', label: 'ประเภท' },
            { key: 'policyIsActive', label: 'สถานะ', align: 'center' },
            { key: 'action', label: 'การจัดการ', align: 'center' }
          ]"
          :rows="policies"
          row-key="policyId"
        >
          <template #cell-policyTitle="{ value }">
            <span class="text-sm font-medium text-gray-900">{{ value }}</span>
          </template>
          <template #cell-policyType="{ value }">
            <span class="text-xs text-gray-500 capitalize">{{ value }}</span>
          </template>
          <template #cell-policyIsActive="{ value }">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
              :class="value ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200'"
            >
              {{ value ? "เปิดใช้งาน" : "ปิดใช้งาน" }}
            </span>
          </template>
          <template #cell-action="{ row }">
            <div class="flex items-center justify-center gap-1.5">
              <AdminActionButton variant="secondary" size="sm" @click="activeTab = row.policyType; preview = false">แก้ไข</AdminActionButton>
              <AdminActionButton variant="danger" size="sm" @click="openDelete(asPolicy(row))">ลบ</AdminActionButton>
            </div>
          </template>
        </AdminDataTable>
        <AdminEmptyState v-if="policies.length === 0" title="ยังไม่มีนโยบาย" description="บันทึกข้อความในแต่ละแท็บเพื่อสร้างนโยบาย" icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </div>
    </template>

    <!-- Delete confirm -->
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
