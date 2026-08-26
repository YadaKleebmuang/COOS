<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import { orderService } from "~/services/order.service"
import type { OrderSummary, OrderStatus } from "~/types/order.types"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()
const router = useRouter()

const users = ref<any[]>([])
const orders = ref<OrderSummary[]>([])
const loading = ref(true)
const error = ref("")

const fetchData = async () => {
  loading.value = true
  error.value = ""
  try {
    const [usersRes, ordersRes] = await Promise.all([
      apiFetch("/users"),
      apiFetch("/orders")
    ])
    users.value = usersRes.data || []
    orders.value = ordersRes.data || []
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถโหลดข้อมูลได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())

// ────────────────────────────────────────
// Stats
// ────────────────────────────────────────


const stats = computed(() => {
  const o = orders.value
  return {
    total: o.length,
    waitingDeposit: o.filter(x => x.orderStatus === "waiting_deposit").length,
    waitingAssignment: o.filter(x => x.orderStatus === "waiting_assignment").length,
    inProgress: o.filter(x => x.orderStatus === "in_progress").length,
    completed: o.filter(x => x.orderStatus === "completed" || x.orderStatus === "delivered").length,
    cancelled: o.filter(x => x.orderStatus === "cancelled").length,
    totalCustomers: users.value.filter(u => u.userRole === "customer").length,
    totalEditors: users.value.filter(u => u.userRole === "editor").length
  }
})

const statCards = computed(() => [
  {
    label: "คำสั่งงานทั้งหมด",
    value: stats.value.total,
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
  },
  {
    label: "รอชำระเงินมัดจำ",
    value: stats.value.waitingDeposit,
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  },
  {
    label: "รอมอบหมายงาน",
    value: stats.value.waitingAssignment,
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
  },
  {
    label: "กำลังดำเนินการ",
    value: stats.value.inProgress,
    icon: "M13 10V3L4 14h7v7l9-11h-7z"
  },
  {
    label: "เสร็จสมบูรณ์",
    value: stats.value.completed,
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
  },
  {
    label: "ยกเลิกออเดอร์",
    value: stats.value.cancelled,
    icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
  }
])

// ────────────────────────────────────────
// Recent Orders Table
// ────────────────────────────────────────
const statusFilter = ref("all")

const orderTableColumns = [
  { key: "orderId", label: "เลขที่คำสั่งงาน" },
  { key: "customer", label: "ลูกค้า" },
  { key: "packageName", label: "แพ็กเกจ" },
  { key: "orderStatus", label: "สถานะ" },
  { key: "orderCreatedAt", label: "วันที่สั่งงาน" },
  { key: "editor", label: "ผู้รับผิดชอบ" },
  { key: "action", label: "การจัดการ", align: "center" as const }
]

const filterOptions = computed(() => [
  { key: "all", label: "ทั้งหมด", count: stats.value.total },
  { key: "waiting_deposit", label: "รอมัดจำ", count: stats.value.waitingDeposit },
  { key: "waiting_assignment", label: "รอมอบหมาย", count: stats.value.waitingAssignment },
  { key: "in_progress", label: "กำลังทำงาน", count: stats.value.inProgress },
  { key: "completed", label: "เสร็จสมบูรณ์", count: stats.value.completed },
  { key: "cancelled", label: "ยกเลิก", count: stats.value.cancelled }
])

const tableRows = computed(() => {
  const source = [...orders.value]
    .sort((a, b) => b.orderId - a.orderId)
    .slice(0, 10)
    .map((o: any) => ({
      orderId: o.orderId,
      customer: (o.customerFirstName && o.customerLastName) ? `${o.customerFirstName} ${o.customerLastName}` : `ลูกค้า #${o.customerId}`,
      packageName: o.packageName,
      orderStatus: o.orderStatus,
      orderCreatedAt: o.orderCreatedAt,
      editor: o.editorId ? (o.editorFirstName ? `${o.editorFirstName} ${o.editorLastName?.charAt(0) || ''}.` : `Editor #${o.editorId}`) : "—"
    }))

  if (statusFilter.value === "all") return source
  if (statusFilter.value === "completed") return source.filter(r => r.orderStatus === "completed" || r.orderStatus === "delivered")
  return source.filter(r => r.orderStatus === statusFilter.value)
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric", month: "short", year: "numeric"
  })
}

// ────────────────────────────────────────
// Editor Workload
// ────────────────────────────────────────
const editorsWorkload = computed(() => {
  const editors = users.value.filter(u => u.userRole === "editor")
  return editors.map(e => {
    const editorOrders = orders.value.filter(o => o.editorId === e.userId)
    const activeJobs = editorOrders.filter(o => ['waiting_to_start', 'in_progress', 'waiting_selection', 'waiting_final_payment'].includes(o.orderStatus)).length
    const completedJobs = editorOrders.filter(o => o.orderStatus === 'completed').length
    return {
      initials: ((e.userFirstName?.[0] ?? "") + (e.userLastName?.[0] ?? "")).toUpperCase() || "ED",
      name: `${e.userFirstName} ${e.userLastName}`,
      activeJobs,
      completedJobs
    }
  }).sort((a, b) => (b.activeJobs + b.completedJobs) - (a.activeJobs + a.completedJobs)).slice(0, 5)
})

const breadcrumb = [
  { label: "หน้าแรก", to: "/admin/dashboard" },
  { label: "แดชบอร์ด" }
]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-lg font-black text-[#171717] tracking-tight">แดชบอร์ดผู้ดูแลระบบ</h1>
        <p class="mt-0.5 text-xs text-[#9A9A95]">ภาพรวมสถานะออเดอร์และระบบ COOS Studio</p>
      </div>
      <AdminActionButton
        variant="secondary"
        size="sm"
        icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        @click="fetchData"
      >
        รีเฟรช
      </AdminActionButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white border border-[#EFEFEA]/60 rounded-2xl p-5 h-28 animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white border border-red-100 rounded-2xl p-6 text-center">
      <p class="text-sm text-red-600 font-medium">{{ error }}</p>
      <button @click="fetchData" class="mt-3 text-xs text-[#9A9A95] hover:text-[#171717] underline">
        ลองโหลดใหม่
      </button>
    </div>

    <!-- Main content -->
    <template v-else>
      <!-- ── Stat Cards ── -->
      <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <div
          v-for="card in statCards"
          :key="card.label"
          class="bg-white border border-[#EFEFEA]/60 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between h-28 hover:shadow-md transition-all duration-300"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-[#666660] truncate">{{ card.label }}</span>
            <div class="w-7 h-7 rounded-lg bg-[#EFEFEA]/50 flex items-center justify-center text-[#9A9A95] flex-shrink-0">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="card.icon" />
              </svg>
            </div>
          </div>
          <div class="mt-2 flex items-baseline">
            <span class="text-2xl font-black text-[#171717] tracking-tight font-number">{{ card.value }}</span>
          </div>
        </div>
      </div>

      <!-- ── Recent Orders ── -->
      <div class="bg-white border border-[#EFEFEA]/60 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.01)] overflow-hidden">
        <!-- Section header -->
        <div class="px-6 py-4 border-b border-[#EFEFEA]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-sm font-black text-[#171717] tracking-tight">คำสั่งงานล่าสุด</h2>
            <p class="text-xs text-[#9A9A95] mt-0.5">รายการคำสั่งงานที่ต้องดำเนินการ</p>
          </div>
          <AdminActionButton
            variant="secondary"
            size="sm"
            @click="router.push('/admin/orders')"
          >
            ดูทั้งหมด
          </AdminActionButton>
        </div>

        <!-- Filter bar -->
        <div class="px-6 py-3 border-b border-[#EFEFEA]/60 overflow-x-auto">
          <AdminFilterBar
            v-model="statusFilter"
            :filters="filterOptions"
          />
        </div>

        <!-- Table -->
        <AdminDataTable
          :columns="orderTableColumns"
          :rows="tableRows"
          row-key="orderId"
        >
          <!-- Order ID -->
          <template #cell-orderId="{ value }">
            <span class="font-mono text-xs font-bold text-[#171717]">#{{ value }}</span>
          </template>

          <!-- Customer -->
          <template #cell-customer="{ value }">
            <span class="text-xs font-medium text-[#171717]">{{ value }}</span>
          </template>

          <!-- Package -->
          <template #cell-packageName="{ value }">
            <span class="text-xs text-[#666660]">{{ value }}</span>
          </template>

          <!-- Status badge -->
          <template #cell-orderStatus="{ value }">
            <AdminStatusBadge :status="value" />
          </template>

          <!-- Date -->
          <template #cell-orderCreatedAt="{ value }">
            <span class="text-xs text-[#9A9A95]">{{ formatDate(value) }}</span>
          </template>

          <!-- Editor -->
          <template #cell-editor="{ value }">
            <span class="text-xs text-[#666660]">{{ value }}</span>
          </template>

          <!-- Actions -->
          <template #cell-action="{ row }">
            <AdminActionButton
              variant="ghost"
              size="sm"
              @click="router.push('/admin/orders')"
              class="text-xs text-[#171717] hover:underline"
            >
              จัดการ
            </AdminActionButton>
          </template>
        </AdminDataTable>

        <!-- Empty state inside table -->
        <AdminEmptyState
          v-if="tableRows.length === 0"
          title="ไม่พบคำสั่งงาน"
          description="ไม่มีคำสั่งงานที่ตรงกับสถานะที่เลือก"
        />
      </div>

      <!-- ── Bottom Grid ── -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Order Status Summary -->
        <div class="bg-white border border-[#EFEFEA]/60 rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.01)]">
          <h2 class="text-sm font-black text-[#171717] tracking-tight mb-4">สรุปสถานะออเดอร์</h2>
          <div class="space-y-3">
            <div
              v-for="card in statCards.filter(c => c.label !== 'คำสั่งงานทั้งหมด')"
              :key="card.label"
              class="flex items-center justify-between"
            >
              <span class="text-xs text-[#666660]">{{ card.label }}</span>
              <span class="text-xs font-bold text-[#171717] font-number">{{ card.value }}</span>
            </div>
          </div>
        </div>

        <!-- Editor Workload -->
        <div class="bg-white border border-[#EFEFEA]/60 rounded-2xl p-6 xl:col-span-2 shadow-[0_4px_16px_rgba(0,0,0,0.01)]">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-black text-[#171717] tracking-tight">ภาระงาน Editor</h2>
            <AdminActionButton variant="ghost" size="sm" @click="router.push('/admin/assignments')">
              มอบหมายงาน
            </AdminActionButton>
          </div>
          <div class="space-y-2">
            <div
              v-for="editor in editorsWorkload"
              :key="editor.name"
              class="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F7F5]/50 transition-colors border border-transparent"
            >
              <!-- Avatar initials -->
              <div class="w-8 h-8 rounded-full bg-[#EFEFEA] text-[#171717] border border-white/50 text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                {{ editor.initials }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-[#171717] truncate">{{ editor.name }}</p>
                <p class="text-xs text-[#9A9A95] mt-0.5">Editor</p>
              </div>
              <div class="text-right flex-shrink-0 flex items-center gap-3">
                <div class="text-center">
                  <p class="text-sm font-bold text-[#171717] font-number">{{ editor.activeJobs }}</p>
                  <p class="text-[10px] text-[#9A9A95]">กำลังทำ</p>
                </div>
                <div class="text-center pl-3 border-l border-[#EFEFEA]">
                  <p class="text-sm font-bold text-emerald-600 font-number">{{ editor.completedJobs }}</p>
                  <p class="text-[10px] text-[#9A9A95]">เสร็จแล้ว</p>
                </div>
              </div>
            </div>
            <AdminEmptyState
              v-if="editorsWorkload.length === 0"
              title="ยังไม่มี Editor"
              description="ยังไม่มี Editor ในระบบ"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>