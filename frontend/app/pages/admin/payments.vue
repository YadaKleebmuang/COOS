<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useApi } from "~/composables/useApi"
import Pagination from "~/components/ui/Pagination.vue"
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

// ── Pagination Setup ──
const currentPage = ref(1)
const pageSize = 10

const paginatedPayments = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize
  const endIndex = startIndex + pageSize
  return filteredPayments.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  return Math.ceil(filteredPayments.value.length / pageSize)
})

const totalRecords = computed(() => {
  return filteredPayments.value.length
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

watch([activeTab, searchQuery], () => {
  currentPage.value = 1
})

watch(filteredPayments, (newVal) => {
  const maxPage = Math.ceil(newVal.length / pageSize) || 1
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage
  }
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
  pending: { label: "รอตรวจสอบ", classes: "bg-[#EFEFEA] text-[#9A9A95] border-[#EFEFEA] px-2 py-0.5" },
  approved: { label: "ผ่านการตรวจสอบ", classes: "bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5" },
  rejected: { label: "ไม่ผ่านการตรวจสอบ", classes: "bg-red-50 text-red-600 border-red-200 px-2 py-0.5" }
}

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "ตรวจสอบการชำระเงิน" }]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <AdminBreadcrumb :items="breadcrumb" />
      <button
        @click="() => fetchPayments()"
        class="px-4 py-2 rounded-full border border-black/[0.06] bg-white text-[13px] font-medium text-[#171717] hover:bg-[#F7F7F5] transition-colors shadow-sm flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        รีเฟรช
      </button>
    </div>

    <!-- Payments Workspace Card -->
    <div class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
      
      <!-- Header & Search -->
      <div class="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-[#171717] tracking-tight">ตรวจสอบการชำระเงิน</h2>
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">ตรวจสอบหลักฐานและสถานะการชำระเงินของลูกค้า</p>
        </div>
        <div class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-black/[0.12] focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all">
          <svg class="w-4 h-4 text-[#929292] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาเลขออเดอร์, ลูกค้า..."
            class="text-xs text-[#171717] bg-transparent outline-none w-48 placeholder:text-[#9A9A95]"
          />
        </div>
      </div>

      <!-- Filter Row -->
      <div class="px-4 sm:px-6 pb-4 border-b border-black/[0.06] overflow-x-auto">
        <AdminFilterBar v-model="activeTab" :filters="tabs" />
      </div>

      <!-- Error State -->
      <div v-if="error" class="p-12 text-center">
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button @click="() => fetchPayments()" class="mt-2 text-xs text-[#9A9A95] underline">ลองใหม่</button>
      </div>

      <!-- Table -->
      <div v-else class="flex flex-col flex-1">
        <div class="overflow-x-auto bg-[#FDFDFB]/30 payments-table-scope">
          <AdminDataTable
            :columns="columns"
            :rows="paginatedPayments"
            :loading="loading"
            row-key="paymentId"
          >
            <!-- Order ID -->
            <template #cell-orderId="{ value }">
              <span class="font-mono text-xs font-semibold text-[#171717]">#{{ value }}</span>
            </template>
            
            <!-- Customer -->
            <template #cell-customerName="{ row }">
              <span class="text-[13px] font-medium text-[#171717]">{{ row.customerFirstName }} {{ row.customerLastName }}</span>
            </template>
            
            <!-- Payment Type -->
            <template #cell-paymentType="{ value }">
              <span class="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-[6px] border border-transparent" :class="value === 'deposit' ? 'bg-[#EFEFEA] text-[#171717] border-black/[0.06]' : 'bg-[#171717] text-white'">
                {{ value === "deposit" ? "ค่ามัดจำ" : "ยอดคงเหลือ" }}
              </span>
            </template>
            
            <!-- Amount -->
            <template #cell-paymentAmount="{ value }">
              <span class="text-[13px] font-semibold font-mono text-[#171717]">{{ formatPrice(value) }}</span>
            </template>
            
            <!-- Created At -->
            <template #cell-paymentCreatedAt="{ value }">
              <span class="text-xs text-[#666666]">{{ formatDate(value) }}</span>
            </template>
            
            <!-- Status -->
            <template #cell-paymentStatus="{ value }">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-[6px] text-xs font-medium border" :class="statusConfig[value]?.classes">
                {{ statusConfig[value]?.label ?? value }}
              </span>
            </template>
            
            <!-- Action -->
            <template #cell-action="{ row }">
              <div class="flex items-center justify-center gap-2">
                <a :href="row.paymentSlipUrl" target="_blank" class="px-2 py-1 text-[11px] font-semibold text-[#666666] hover:text-[#171717] hover:bg-black/[0.04] transition-colors rounded shadow-sm border border-black/[0.06] bg-white whitespace-nowrap">
                  ดูสลิป
                </a>
                <template v-if="row.paymentStatus === 'pending'">
                  <button
                    @click="openConfirm(row as any, 'approved')"
                    class="px-2 py-1 text-[11px] font-semibold text-white bg-[#171717] hover:bg-[#333333] transition-colors rounded shadow-sm border border-transparent"
                  >
                    อนุมัติ
                  </button>
                  <button
                    @click="openConfirm(row as any, 'rejected')"
                    class="px-2 py-1 text-[11px] font-semibold text-[#C53030] bg-[#FFF5F5] hover:bg-[#FED7D7] transition-colors rounded shadow-sm border border-[#FEB2B2]"
                  >
                    ปฏิเสธ
                  </button>
                </template>
                <span v-else class="text-xs text-[#EFEFEA] block text-center">—</span>
              </div>
            </template>
          </AdminDataTable>
        </div>

        <!-- Empty state -->
        <AdminEmptyState
          v-if="!loading && filteredPayments.length === 0"
          title="ไม่พบรายการชำระเงิน"
          description="ไม่มีหลักฐานการชำระเงินที่ตรงกับเงื่อนไข"
          icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />

        <!-- Pagination wrapper -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-black/[0.06] flex items-center justify-between bg-[#FDFDFB]/50">
          <!-- Thai Pagination Summary -->
          <div class="hidden sm:block text-xs text-[#666666]">
            <span class="font-bold text-[#171717]">{{ ((currentPage - 1) * pageSize) + 1 }}</span>–<span class="font-bold text-[#171717]">{{ Math.min(currentPage * pageSize, totalRecords) }}</span> จาก <span class="font-bold text-[#171717]">{{ totalRecords }}</span> รายการ
          </div>
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :total="totalRecords"
            :limit="pageSize"
            @page-change="handlePageChange"
            class="!border-0 !shadow-none !mt-0 !rounded-none !p-0 !bg-transparent flex-1 sm:flex-initial"
          />
        </div>
      </div>
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

<style scoped>
:deep(p.text-sm.text-gray-700) {
  display: none !important;
}

/* 
  Override shared DataTable styles to match Dashboard neutral tones
  and remove rounded corners.
*/
.payments-table-scope :deep(.rounded-xl) {
  border-radius: 0 !important;
  border-color: rgba(0, 0, 0, 0.06) !important;
}

.payments-table-scope :deep(thead.bg-gray-50) {
  background-color: rgba(247, 247, 245, 0.8) !important; /* bg-[#F7F7F5]/80 */
  border-bottom-color: rgba(0, 0, 0, 0.06) !important;
}

.payments-table-scope :deep(tbody.bg-white tr:hover) {
  background-color: #FDFDFB !important; /* hover:bg-[#FDFDFB] */
}

.payments-table-scope :deep(tbody.bg-white.divide-gray-100 > tr) {
  border-color: rgba(0, 0, 0, 0.04) !important;
}
</style>
