<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useApi } from "~/composables/useApi"
import { orderService } from "~/services/order.service"
import Pagination from "~/components/ui/Pagination.vue"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()
const { alert } = useAlert()
const route = useRoute()
const router = useRouter()

const orders = ref<any[]>([])
const editors = ref<any[]>([])
const loading = ref(true)
const error = ref("")
const selectedFilter = ref("all")
const searchQuery = ref("")
const confirmDialog = ref({
  open: false,
  orderId: 0,
  paymentId: 0,
  status: "" as "approved" | "rejected",
  loading: false
})

const currentPage = ref(1)
const totalPages = ref(1)
const totalRecords = ref(0)
const limit = 10

const fetchAdminData = async (page = 1) => {
  loading.value = true
  error.value = ""
  try {
    // Request up to 1000 users for the editor dropdown
    const usersRes = await apiFetch<any>("/users?limit=1000")
    editors.value = (usersRes.data || []).filter((u: any) => u.userRole === "editor")

    const statusQuery = selectedFilter.value !== "all" ? selectedFilter.value : undefined
    const ordersRes = await orderService.getMyOrders(page, limit, statusQuery)
    
    orders.value = ordersRes.data || []
    currentPage.value = ordersRes.page || 1
    totalPages.value = ordersRes.totalPages || 1
    totalRecords.value = ordersRes.total || 0
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถโหลดข้อมูลได้"
  } finally {
    loading.value = false
  }
}



onMounted(() => fetchAdminData())

const handlePageChange = (page: number) => {
  fetchAdminData(page)
}

// ── Filters ────────────────────────────────────────────────────
const statusMap: Record<string, string> = {
  waiting_deposit: "รอชำระมัดจำ",
  waiting_assignment: "รอมอบหมายงาน",
  waiting_to_start: "รอเริ่มงาน",
  in_progress: "กำลังดำเนินการ",
  waiting_selection: "รอเลือกผลงาน",
  waiting_final_payment: "รอชำระส่วนที่เหลือ",
  delivered: "ส่งมอบแล้ว",
  completed: "เสร็จสมบูรณ์",
  cancelled: "ยกเลิก"
}

const getStatusLabel = (status: string) => {
  return statusMap[status] || status
}

const filterOptions = computed(() => [
  { key: "all", label: "ทั้งหมด" },
  { key: "waiting_deposit", label: getStatusLabel("waiting_deposit") },
  { key: "waiting_assignment", label: getStatusLabel("waiting_assignment") },
  { key: "waiting_to_start", label: getStatusLabel("waiting_to_start") },
  { key: "in_progress", label: getStatusLabel("in_progress") },
  { key: "waiting_selection", label: getStatusLabel("waiting_selection") },
  { key: "waiting_final_payment", label: getStatusLabel("waiting_final_payment") },
  { key: "delivered", label: getStatusLabel("delivered") },
  { key: "completed", label: getStatusLabel("completed") },
  { key: "cancelled", label: getStatusLabel("cancelled") }
])

watch(selectedFilter, () => {
  currentPage.value = 1
  fetchAdminData(1)
})

const filteredOrders = computed(() => {
  let result = orders.value
  const q = searchQuery.value.trim()
  if (q) {
    result = result.filter(o =>
      String(o.orderId).includes(q) ||
      (o.packageName ?? "").toLowerCase().includes(q.toLowerCase()) ||
      (o.workTypeName ?? "").toLowerCase().includes(q.toLowerCase())
    )
  }
  return result
})

// ── Table columns ──────────────────────────────────────────────
const columns = [
  { key: "orderId", label: "เลขที่" },
  { key: "workTypeName", label: "ประเภทงาน" },
  { key: "packageName", label: "แพ็กเกจ" },
  { key: "orderTotalPrice", label: "ยอดรวม", align: "right" as const },
  { key: "orderStatus", label: "สถานะ" },
  { key: "orderRequiredDate", label: "วันที่ต้องการ" },
  { key: "editorAssign", label: "Editor", width: "160px" },
  { key: "paymentAction", label: "สลิปเงิน", align: "center" as const },
  { key: "orderCreatedAt", label: "สั่งเมื่อ" }
]

// ── Actions ────────────────────────────────────────────────────
const openVerifyDialog = (orderId: number, paymentId: number, status: "approved" | "rejected") => {
  confirmDialog.value = { open: true, orderId, paymentId, status, loading: false }
}

const confirmVerify = async () => {
  confirmDialog.value.loading = true
  const { orderId, paymentId, status } = confirmDialog.value
  const note = status === "approved"
    ? "ผู้ดูแลระบบตรวจสอบและอนุมัติแล้ว"
    : "ผู้ดูแลระบบปฏิเสธการชำระเงิน"
  try {
    const res = await apiFetch(`/orders/${orderId}/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: status, logNote: note })
    })
    alert("สำเร็จ", res.message || "บันทึกเรียบร้อย", "success")
    confirmDialog.value.open = false
    fetchAdminData()
  } catch (err: any) {
    alert("แจ้งเตือน", err?.message || "เกิดข้อผิดพลาด", "error")
  } finally {
    confirmDialog.value.loading = false
  }
}

// ── Formatters ─────────────────────────────────────────────────
const formatPrice = (n: number) =>
  `฿${Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric", month: "short", year: "2-digit"
  })
}

const pendingPayment = (order: any) =>
  order.payments?.find((p: any) => p.paymentStatus === "pending")

const getEditorName = (id: number) => {
  const editor = editors.value.find((e: any) => e.userId === id)
  return editor ? `${editor.userFirstName} ${editor.userLastName}` : "ไม่ทราบชื่อ"
}

const breadcrumb = [
  { label: "หน้าแรก", to: "/admin/dashboard" },
  { label: "คำสั่งงาน" }
]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <AdminBreadcrumb :items="breadcrumb" />
      <button
        @click="() => fetchAdminData()"
        class="px-4 py-2 rounded-full border border-black/[0.06] bg-white text-[13px] font-medium text-[#171717] hover:bg-[#F7F7F5] transition-colors shadow-sm flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        รีเฟรช
      </button>
    </div>

    <!-- Orders Workspace Card -->
    <div class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
      
      <!-- Header & Search -->
      <div class="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-[#171717] tracking-tight">คำสั่งงานทั้งหมด</h2>
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">ดูแลรายการคำสั่งงานและติดตามสถานะ</p>
        </div>
        <div class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-black/[0.12] focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all">
          <svg class="w-4 h-4 text-[#929292] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาเลขที่, แพ็กเกจ..."
            class="text-xs text-[#171717] bg-transparent outline-none w-48 placeholder:text-[#9A9A95]"
          />
        </div>
      </div>

      <!-- Filter Row -->
      <div class="px-4 sm:px-6 pb-4 border-b border-black/[0.06] overflow-x-auto">
        <AdminFilterBar v-model="selectedFilter" :filters="filterOptions" />
      </div>

      <!-- Error State -->
      <div v-if="error" class="p-12 text-center">
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button @click="() => fetchAdminData()" class="mt-2 text-xs text-[#9A9A95] underline">ลองใหม่</button>
      </div>

      <!-- Table -->
      <div v-else class="flex flex-col flex-1">
        <div class="overflow-x-auto bg-[#FDFDFB]/30 orders-table-scope">
        <AdminDataTable
          :columns="columns"
          :rows="filteredOrders"
          :loading="loading"
          row-key="orderId"
        >
          <!-- Order ID -->
          <template #cell-orderId="{ value }">
            <span class="font-mono text-xs font-semibold text-[#171717]">#{{ value }}</span>
          </template>

          <!-- Work type -->
          <template #cell-workTypeName="{ value }">
            <span class="text-[13px] font-medium text-[#171717]">{{ value ?? "—" }}</span>
          </template>

          <!-- Package -->
          <template #cell-packageName="{ value }">
            <span class="text-xs text-[#666666]">{{ value ?? "—" }}</span>
          </template>

          <!-- Price -->
          <template #cell-orderTotalPrice="{ value }">
            <span class="text-[13px] font-bold text-[#171717] font-number">{{ formatPrice(value) }}</span>
          </template>

          <!-- Status -->
          <template #cell-orderStatus="{ value }">
            <span 
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap"
              :class="{
                'bg-[#171717] text-white border-[#171717] shadow-sm': value === 'completed' || value === 'delivered',
                'bg-[#FFF5F5] text-[#C53030] border-[#FEB2B2]': value === 'cancelled',
                'bg-[#F7F7F5] text-[#666666] border-black/[0.06]': value !== 'completed' && value !== 'delivered' && value !== 'cancelled'
              }"
            >
              {{ getStatusLabel(value) }}
            </span>
          </template>

          <!-- Required date -->
          <template #cell-orderRequiredDate="{ value }">
            <span class="text-xs text-[#9A9A95]">{{ formatDate(value) }}</span>
          </template>

          <!-- Editor Assign dropdown -->
          <template #cell-editorAssign="{ row }">
            <span v-if="row.editorId" class="inline-flex items-center px-2 py-1 text-[11px] font-semibold text-[#171717] bg-[#F7F7F5] border border-black/[0.06] rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              {{ getEditorName(row.editorId) }}
            </span>
            <span v-else class="text-xs text-[#9A9A95]">— ยังไม่มอบหมาย —</span>
          </template>

          <!-- Payment slip -->
          <template #cell-paymentAction="{ row }">
            <div v-if="pendingPayment(row)" class="flex items-center gap-1.5 justify-center">
              <a
                :href="pendingPayment(row).paymentSlipUrl"
                target="_blank"
                class="px-2 py-1 text-[11px] font-semibold text-[#171717] bg-white hover:bg-[#F7F7F5] transition-colors rounded shadow-sm border border-black/[0.06]"
              >
                ดูสลิป
              </a>
              <button
                @click="openVerifyDialog(row.orderId, pendingPayment(row).paymentId, 'approved')"
                class="px-2 py-1 text-[11px] font-semibold text-white bg-[#171717] hover:bg-black transition-colors rounded shadow-sm border border-transparent"
              >
                อนุมัติ
              </button>
              <button
                @click="openVerifyDialog(row.orderId, pendingPayment(row).paymentId, 'rejected')"
                class="px-2 py-1 text-[11px] font-semibold text-[#C53030] bg-[#FFF5F5] hover:bg-[#FED7D7] transition-colors rounded shadow-sm border border-[#FEB2B2]"
              >
                ปฏิเสธ
              </button>
            </div>
            <span v-else class="text-xs text-[#EFEFEA] block text-center">—</span>
          </template>

          <!-- Created at -->
          <template #cell-orderCreatedAt="{ value }">
            <span class="text-xs text-[#9A9A95]">{{ formatDate(value) }}</span>
          </template>
        </AdminDataTable>
      </div>

      <!-- Empty state -->
      <AdminEmptyState
        v-if="!loading && filteredOrders.length === 0"
        title="ไม่พบคำสั่งงาน"
        description="ไม่มีคำสั่งงานที่ตรงกับเงื่อนไขที่เลือก ลองเปลี่ยนตัวกรองใหม่"
        icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />

      <!-- Pagination wrapper -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-black/[0.06] flex items-center justify-between bg-[#FDFDFB]/50">
        <!-- Thai Pagination Summary -->
        <div class="hidden sm:block text-xs text-[#666666]">
          <span class="font-bold text-[#171717]">{{ ((currentPage - 1) * limit) + 1 }}</span>–<span class="font-bold text-[#171717]">{{ Math.min(currentPage * limit, totalRecords) }}</span> จาก <span class="font-bold text-[#171717]">{{ totalRecords }}</span> รายการ
        </div>
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          :total="totalRecords"
          :limit="limit"
          @page-change="handlePageChange"
          class="!border-0 !shadow-none !mt-0 !rounded-none !p-0 !bg-transparent flex-1 sm:flex-initial"
        />
      </div>
    </div>
    </div>

    <!-- Confirm Dialog -->
    <AdminConfirmDialog
      :open="confirmDialog.open"
      :title="confirmDialog.status === 'approved' ? 'ยืนยันการอนุมัติสลิป' : 'ยืนยันการปฏิเสธสลิป'"
      :message="confirmDialog.status === 'approved'
        ? 'คุณยืนยันว่าตรวจสอบหลักฐานการโอนเงินและอนุมัติความถูกต้องแล้ว?'
        : 'คุณต้องการปฏิเสธหลักฐานการโอนเงินนี้ใช่หรือไม่?'"
      :confirm-label="confirmDialog.status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'"
      :danger="confirmDialog.status === 'rejected'"
      :loading="confirmDialog.loading"
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
.orders-table-scope :deep(.rounded-xl) {
  border-radius: 0 !important;
  border-color: rgba(0, 0, 0, 0.06) !important;
}

.orders-table-scope :deep(thead.bg-gray-50) {
  background-color: rgba(247, 247, 245, 0.8) !important; /* bg-[#F7F7F5]/80 */
  border-bottom-color: rgba(0, 0, 0, 0.06) !important;
}

.orders-table-scope :deep(tbody.bg-white tr:hover) {
  background-color: #FDFDFB !important; /* hover:bg-[#FDFDFB] */
}

.orders-table-scope :deep(tbody.bg-white.divide-gray-100 > tr) {
  border-color: rgba(0, 0, 0, 0.04) !important;
}
</style>
