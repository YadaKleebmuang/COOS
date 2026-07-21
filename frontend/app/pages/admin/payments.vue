<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import type { Payment } from "~/types/order.types"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()

// ── Mock data (API-ready) ──────────────────────────────────────
interface PaymentRow {
  paymentId: number
  orderId: number
  customerFirstName?: string
  customerLastName?: string
  paymentType: "deposit" | "final"
  paymentAmount: number
  paymentSlipUrl: string
  paymentStatus: "pending" | "approved" | "rejected"
  paymentCreatedAt: string
}


// ── State ──────────────────────────────────────────────────────
const payments = ref<PaymentRow[]>([])
const loading = ref(true)
const searchQuery = ref("")
const activeTab = ref<"all" | "deposit" | "final" | "approved" | "rejected">("all")

const confirmDialog = ref({ open: false, loading: false, paymentId: 0, orderId: 0, action: "approved" as "approved" | "rejected", error: "" })

const error = ref("")

// ── Fetch ──────────────────────────────────────────────────────
const fetchPayments = async () => {
  loading.value = true
  error.value = ""
  try {
    const data = await apiFetch<PaymentRow[]>("/payments")
    payments.value = data
  } catch (err: any) {
    error.value = "เกิดข้อผิดพลาดในการโหลดข้อมูล: " + err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchPayments())

// ── Tabs ───────────────────────────────────────────────────────
const tabs = computed(() => [
  { key: "all", label: "ทั้งหมด", count: payments.value.length },
  { key: "deposit", label: "ค่ามัดจำ", count: payments.value.filter(p => p.paymentType === "deposit").length },
  { key: "final", label: "ยอดคงเหลือ", count: payments.value.filter(p => p.paymentType === "final").length },
  { key: "approved", label: "ผ่านแล้ว", count: payments.value.filter(p => p.paymentStatus === "approved").length },
  { key: "rejected", label: "ไม่ผ่าน", count: payments.value.filter(p => p.paymentStatus === "rejected").length }
])

const filteredPayments = computed(() => {
  let result = payments.value
  if (activeTab.value === "deposit") result = result.filter(p => p.paymentType === "deposit")
  else if (activeTab.value === "final") result = result.filter(p => p.paymentType === "final")
  else if (activeTab.value === "approved") result = result.filter(p => p.paymentStatus === "approved")
  else if (activeTab.value === "rejected") result = result.filter(p => p.paymentStatus === "rejected")

  const q = searchQuery.value.toLowerCase().trim()
  if (q) result = result.filter(p => String(p.orderId).includes(q) || (p.customerFirstName + ' ' + p.customerLastName).toLowerCase().includes(q))
  return result
})

// ── Columns ────────────────────────────────────────────────────
const columns = [
  { key: "orderId", label: "เลขที่คำสั่งงาน" },
  { key: "customerName", label: "ลูกค้า" },
  { key: "paymentType", label: "ประเภทการชำระ" },
  { key: "paymentAmount", label: "จำนวนเงิน", align: "right" as const },
  { key: "paymentCreatedAt", label: "วันที่อัปโหลด" },
  { key: "paymentStatus", label: "สถานะ", align: "center" as const },
  { key: "action", label: "การจัดการ", align: "center" as const }
]

// ── Actions ────────────────────────────────────────────────────
const openConfirm = (p: PaymentRow, action: "approved" | "rejected") => {
  confirmDialog.value = { open: true, loading: false, paymentId: p.paymentId, orderId: p.orderId, action, error: "" }
}

const confirmVerify = async () => {
  confirmDialog.value.loading = true
  confirmDialog.value.error = ""
  try {
    const routeAction = confirmDialog.value.action === 'approved' ? 'approve' : 'reject';
    await apiFetch(`/payments/${confirmDialog.value.paymentId}/${routeAction}`, {
      method: "PATCH"
    })
    
    // Refresh data after success
    await fetchPayments()
    
    confirmDialog.value.open = false
  } catch (err: any) {
    confirmDialog.value.error = "เกิดข้อผิดพลาด: " + err.message
  } finally {
    confirmDialog.value.loading = false
  }
}

// ── Helpers ────────────────────────────────────────────────────
const formatPrice = (n: number) => `฿${n.toLocaleString("th-TH")}`
const formatDate = (d: string) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })

const statusConfig: Record<string, { label: string; classes: string }> = {
  pending: { label: "รอตรวจสอบ", classes: "bg-gray-100 text-gray-600 border-gray-200" },
  approved: { label: "ผ่านการตรวจสอบ", classes: "bg-black text-white border-black" },
  rejected: { label: "ไม่ผ่านการตรวจสอบ", classes: "bg-white text-red-600 border-red-200" }
}

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "ตรวจสอบการชำระเงิน" }]
</script>

<template>
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">ตรวจสอบการชำระเงิน</h1>
        <p class="mt-0.5 text-sm text-gray-500">อนุมัติหรือปฏิเสธหลักฐานการโอนเงินจากลูกค้า</p>
      </div>
      <AdminActionButton variant="secondary" size="sm" :loading="loading" icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" @click="fetchPayments">รีเฟรช</AdminActionButton>
    </div>

    <!-- Search + Tabs -->
    <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input v-model="searchQuery" type="text" placeholder="ค้นหาเลขออเดอร์, ชื่อลูกค้า..." class="text-sm text-gray-700 bg-transparent outline-none w-52 placeholder:text-gray-400"/>
      </div>
      <div class="overflow-x-auto">
        <AdminFilterBar v-model="activeTab" :filters="tabs" />
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-white border border-red-200 rounded-xl p-6 text-center">
      <p class="text-sm text-red-600 font-medium">{{ error }}</p>
      <button @click="fetchPayments" class="mt-2 text-xs text-gray-500 underline">ลองใหม่</button>
    </div>

    <!-- Table -->
    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <AdminDataTable :columns="columns" :rows="filteredPayments" :loading="loading" row-key="paymentId">
        <template #cell-orderId="{ value }">
          <span class="font-mono text-xs font-bold text-gray-900">#{{ value }}</span>
        </template>
        <template #cell-customerName="{ row }">
          <span class="text-sm text-gray-700">{{ row.customerFirstName }} {{ row.customerLastName }}</span>
        </template>
        <template #cell-paymentType="{ value }">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" :class="value === 'deposit' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-gray-800 text-white border-gray-800'">
            {{ value === "deposit" ? "ค่ามัดจำ" : "ยอดคงเหลือ" }}
          </span>
        </template>
        <template #cell-paymentAmount="{ value }">
          <span class="text-sm font-bold font-number text-gray-900">{{ formatPrice(value) }}</span>
        </template>
        <template #cell-paymentCreatedAt="{ value }">
          <span class="text-xs text-gray-400">{{ formatDate(value) }}</span>
        </template>
        <template #cell-paymentStatus="{ value }">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border" :class="statusConfig[value]?.classes">
            {{ statusConfig[value]?.label ?? value }}
          </span>
        </template>
        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-1.5">
            <a :href="row.paymentSlipUrl" target="_blank" class="text-xs text-gray-500 hover:text-gray-700 underline whitespace-nowrap">ดูสลิป</a>
            <template v-if="row.paymentStatus === 'pending'">
              <AdminActionButton variant="primary" size="sm" @click="openConfirm(row as any, 'approved')">อนุมัติ</AdminActionButton>
              <AdminActionButton variant="danger" size="sm" @click="openConfirm(row as any, 'rejected')">ปฏิเสธ</AdminActionButton>
            </template>
            <span v-else class="text-xs text-gray-300">—</span>
          </div>
        </template>
      </AdminDataTable>
      <AdminEmptyState v-if="!loading && filteredPayments.length === 0" title="ไม่พบรายการชำระเงิน" description="ไม่มีหลักฐานการชำระเงินที่ตรงกับเงื่อนไข" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </div>

    <!-- Confirm Dialog -->
    <AdminConfirmDialog
      :open="confirmDialog.open"
      :title="confirmDialog.action === 'approved' ? 'ยืนยันการอนุมัติสลิป' : 'ยืนยันการปฏิเสธสลิป'"
      :message="confirmDialog.action === 'approved' ? 'คุณตรวจสอบหลักฐานการโอนเงินและยืนยันความถูกต้องแล้ว?' : 'คุณต้องการปฏิเสธหลักฐานการโอนเงินนี้ใช่หรือไม่?'"
      :confirm-label="confirmDialog.action === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'"
      :danger="confirmDialog.action === 'rejected'"
      :loading="confirmDialog.loading"
      :error="confirmDialog.error"
      @confirm="confirmVerify"
      @cancel="confirmDialog.open = false"
    />
  </div>
</template>
