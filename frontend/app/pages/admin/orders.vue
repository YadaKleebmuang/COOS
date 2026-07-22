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
    // Request up to 1000 users for the editor dropdown, but paginate orders
    const statusQuery = selectedFilter.value !== "all" ? selectedFilter.value : undefined
    const [usersRes, ordersRes] = await Promise.all([
      apiFetch<any>("/users?limit=1000"),
      orderService.getMyOrders(page, limit, statusQuery)
    ])
    
    orders.value = ordersRes.data || []
    currentPage.value = ordersRes.page || 1
    totalPages.value = ordersRes.totalPages || 1
    totalRecords.value = ordersRes.total || 0

    editors.value = (usersRes.data || []).filter((u: any) => u.userRole === "editor")
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
const filterOptions = computed(() => [
  { key: "all", label: "ทั้งหมด" },
  { key: "waiting_deposit", label: "รอมัดจำ" },
  { key: "waiting_assignment", label: "รอมอบหมาย" },
  { key: "in_progress", label: "กำลังดำเนินการ" },
  { key: "waiting_final_payment", label: "รอชำระส่วนที่เหลือ" },
  { key: "completed", label: "ส่งงานแล้ว" },
  { key: "cancelled", label: "ยกเลิก" }
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
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">คำสั่งงาน</h1>
        <p class="mt-0.5 text-sm text-gray-500">มอบหมายงาน, อนุมัติสลิปการโอนเงิน</p>
      </div>
      <AdminActionButton
        variant="secondary"
        size="sm"
        icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        :loading="loading"
        @click="fetchAdminData"
      >
        รีเฟรช
      </AdminActionButton>
    </div>

    <!-- Filter + Search -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <div class="overflow-x-auto flex-1">
        <AdminFilterBar v-model="selectedFilter" :filters="filterOptions" />
      </div>
      <div class="flex-shrink-0">
        <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาออเดอร์..."
            class="text-sm text-gray-700 bg-transparent outline-none w-44 placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="bg-white border border-red-200 rounded-xl p-6 text-center">
      <p class="text-sm text-red-600 font-medium">{{ error }}</p>
      <button @click="() => fetchAdminData()" class="mt-2 text-xs text-gray-500 underline">ลองใหม่</button>
    </div>

    <!-- Table -->
    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <AdminDataTable
        :columns="columns"
        :rows="filteredOrders"
        :loading="loading"
        row-key="orderId"
      >
        <!-- Order ID -->
        <template #cell-orderId="{ value }">
          <span class="font-mono text-xs font-semibold text-gray-900">#{{ value }}</span>
        </template>

        <!-- Work type -->
        <template #cell-workTypeName="{ value }">
          <span class="text-xs text-gray-600">{{ value ?? "—" }}</span>
        </template>

        <!-- Package -->
        <template #cell-packageName="{ value }">
          <span class="text-xs text-gray-600">{{ value ?? "—" }}</span>
        </template>

        <!-- Price -->
        <template #cell-orderTotalPrice="{ value }">
          <span class="text-xs font-semibold text-gray-900 font-number">{{ formatPrice(value) }}</span>
        </template>

        <!-- Status -->
        <template #cell-orderStatus="{ value }">
          <AdminStatusBadge :status="value" />
        </template>

        <!-- Required date -->
        <template #cell-orderRequiredDate="{ value }">
          <span class="text-xs text-gray-500">{{ formatDate(value) }}</span>
        </template>

        <!-- Editor Assign dropdown -->
        <template #cell-editorAssign="{ row }">
          <span v-if="row.editorId" class="text-xs text-gray-700 font-medium bg-gray-100 px-2 py-1 rounded-md">
            {{ getEditorName(row.editorId) }}
          </span>
          <span v-else class="text-xs text-gray-400">— ยังไม่มอบหมาย —</span>
        </template>

        <!-- Payment slip -->
        <template #cell-paymentAction="{ row }">
          <div v-if="pendingPayment(row)" class="flex items-center gap-1.5 justify-center">
            <a
              :href="pendingPayment(row).paymentSlipUrl"
              target="_blank"
              class="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              ดูสลิป
            </a>
            <AdminActionButton
              variant="primary"
              size="sm"
              @click="openVerifyDialog(row.orderId, pendingPayment(row).paymentId, 'approved')"
            >
              อนุมัติ
            </AdminActionButton>
            <AdminActionButton
              variant="danger"
              size="sm"
              @click="openVerifyDialog(row.orderId, pendingPayment(row).paymentId, 'rejected')"
            >
              ปฏิเสธ
            </AdminActionButton>
          </div>
          <span v-else class="text-xs text-gray-300 block text-center">—</span>
        </template>

        <!-- Created at -->
        <template #cell-orderCreatedAt="{ value }">
          <span class="text-xs text-gray-500">{{ formatDate(value) }}</span>
        </template>
      </AdminDataTable>
      <Pagination 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        :total="totalRecords" 
        :limit="limit" 
        @page-change="handlePageChange" 
      />

      <!-- Empty state -->
      <AdminEmptyState
        v-if="!loading && filteredOrders.length === 0"
        title="ไม่พบคำสั่งงาน"
        description="ไม่มีคำสั่งงานที่ตรงกับเงื่อนไขที่เลือก ลองเปลี่ยนตัวกรองใหม่"
        icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
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
