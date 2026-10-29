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
      apiFetch("/users?limit=1000"),
      apiFetch("/orders?limit=1000")
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
  { key: "editor", label: "ผู้รับผิดชอบ" }
]

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
  { key: "all", label: "ทั้งหมด", count: stats.value.total },
  { key: "waiting_deposit", label: getStatusLabel("waiting_deposit"), count: stats.value.waitingDeposit },
  { key: "waiting_assignment", label: getStatusLabel("waiting_assignment"), count: stats.value.waitingAssignment },
  { key: "in_progress", label: getStatusLabel("in_progress"), count: stats.value.inProgress },
  { key: "completed", label: getStatusLabel("completed"), count: stats.value.completed },
  { key: "cancelled", label: getStatusLabel("cancelled"), count: stats.value.cancelled }
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
      email: e.userEmail,
      activeJobs,
      completedJobs
    }
  }).sort((a, b) => (b.activeJobs + b.completedJobs) - (a.activeJobs + a.completedJobs))
})

const breadcrumb = [
  { label: "หน้าแรก", to: "/admin/dashboard" },
  { label: "แดชบอร์ด" }
]
</script>

<template>
  <div class="admin-page space-y-6 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="admin-page-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p class="admin-eyebrow">ADMIN OVERVIEW</p>
        <h1 class="text-2xl sm:text-3xl font-semibold text-[#172c3b] tracking-tight">แดชบอร์ดผู้ดูแลระบบ</h1>
        <p class="mt-1 text-sm font-medium text-[#52616a]">ภาพรวมสถานะออเดอร์และระบบ COOS Studio</p>
      </div>
      <button
        @click="fetchData"
        class="px-4 py-2 rounded-full border border-[#172c3b]/10 bg-[#fcf9f3] text-[13px] font-medium text-[#172c3b] hover:bg-[#eee7db] transition-colors shadow-sm flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        รีเฟรช
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
      <div v-for="i in 6" :key="i" class="bg-[#fcf9f3] border border-[#ded7cb]/60 rounded-2xl p-5 h-28 animate-pulse" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-[#fcf9f3] border border-red-100 rounded-2xl p-6 text-center">
      <p class="text-sm text-red-600 font-medium">{{ error }}</p>
      <button @click="fetchData" class="mt-3 text-xs text-[#69777f] hover:text-[#172c3b] underline">
        ลองโหลดใหม่
      </button>
    </div>

    <!-- Main content -->
    <template v-else>
      <!-- ── Stat Cards ── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <div
          v-for="card in statCards"
          :key="card.label"
          class="admin-metric bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[120px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] hover:border-black/10 transition-all duration-300"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-[#52616a] tracking-wide">{{ card.label }}</span>
            <div class="w-8 h-8 rounded-full bg-[#eee7db] flex items-center justify-center text-[#172c3b] flex-shrink-0 border border-black/[0.03]">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="card.icon" />
              </svg>
            </div>
          </div>
          <div class="mt-2 flex items-baseline">
            <span class="text-3xl font-bold text-[#172c3b] tracking-tight">{{ card.value }}</span>
          </div>
        </div>
      </div>

      <!-- ── Operational Insight Section ── -->
      <div class="bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div class="mb-5">
          <h2 class="text-lg font-semibold text-[#172c3b] tracking-tight">งานและภาพรวมที่ควรติดตาม</h2>
          <p class="text-[13px] font-medium text-[#52616a] mt-0.5">ข้อมูลสำคัญสำหรับการดำเนินงานของผู้ดูแลระบบ</p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Panel 1 -->
          <div>
            <h3 class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#69777f] mb-3">งานที่ต้องดำเนินการ</h3>
            <div class="space-y-2">
              <NuxtLink to="/admin/payments" class="flex items-center justify-between p-3 rounded-xl border border-[#172c3b]/10 hover:bg-[#172c3b]/[0.03] transition-colors group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-[#eee7db] flex items-center justify-center text-[#172c3b]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <p class="text-[13px] font-medium text-[#172c3b]">ตรวจสอบการชำระเงิน</p>
                    <p class="text-[11px] text-[#52616a] mt-0.5">{{ stats.waitingDeposit }} รายการ</p>
                  </div>
                </div>
                <svg class="w-4 h-4 text-[#69777f] group-hover:text-[#172c3b] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </NuxtLink>
              <NuxtLink to="/admin/assignments" class="flex items-center justify-between p-3 rounded-xl border border-[#172c3b]/10 hover:bg-[#172c3b]/[0.03] transition-colors group">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-[#eee7db] flex items-center justify-center text-[#172c3b]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <p class="text-[13px] font-medium text-[#172c3b]">รอมอบหมายงาน</p>
                    <p class="text-[11px] text-[#52616a] mt-0.5">{{ stats.waitingAssignment }} รายการ</p>
                  </div>
                </div>
                <svg class="w-4 h-4 text-[#69777f] group-hover:text-[#172c3b] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </NuxtLink>
            </div>
          </div>

          <!-- Panel 3 -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#69777f]">ภาระงานทีมผลิตภาพ</h3>
              <NuxtLink to="/admin/assignments" class="text-[11px] font-semibold text-[#172c3b] hover:underline">
                ดูทั้งหมด
              </NuxtLink>
            </div>
            <div class="p-4 rounded-xl border border-[#172c3b]/10 bg-[#eee7db]">
              <div class="space-y-4">
                <div v-for="editor in editorsWorkload.slice(0, 5)" :key="editor.name" class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-[#fcf9f3] text-[#172c3b] text-[10px] font-bold flex items-center justify-center border border-[#172c3b]/10 shadow-sm">
                      {{ editor.initials }}
                    </div>
                    <div>
                      <p class="text-[13px] font-medium text-[#172c3b] truncate max-w-[120px]">{{ editor.name }}</p>
                      <p class="text-[11px] text-[#52616a] mt-0.5">Editor</p>
                    </div>
                  </div>
                  <span class="text-[13px] font-semibold text-[#172c3b] bg-[#fcf9f3] px-2.5 py-1 rounded-full border border-[#172c3b]/10 shadow-sm">{{ editor.activeJobs }} งาน</span>
                </div>
                <div v-if="editorsWorkload.length === 0" class="text-[12px] text-[#69777f] text-center py-4">
                  ไม่มีข้อมูลทีมผลิตภาพ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Recent Orders ── -->
      <div class="bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
        <!-- Section header -->
        <div class="px-6 py-5 border-b border-[#172c3b]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-[#172c3b] tracking-tight">คำสั่งงานล่าสุด</h2>
            <p class="text-[13px] font-medium text-[#52616a] mt-0.5">รายการคำสั่งงานที่ต้องดำเนินการ</p>
          </div>
          <button
            @click="router.push('/admin/orders')"
            class="px-4 py-2 rounded-lg border border-[#172c3b]/10 bg-[#fcf9f3] text-[12px] font-medium text-[#172c3b] hover:bg-[#eee7db] transition-colors shadow-sm"
          >
            ดูทั้งหมด
          </button>
        </div>

        <!-- Filter bar -->
        <div class="px-6 py-3 border-b border-[#172c3b]/10 overflow-x-auto bg-[#e5e9e1]">
          <div class="flex gap-2 min-w-max">
            <button
              v-for="filter in filterOptions"
              :key="filter.key"
              @click="statusFilter = filter.key"
              class="min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 border"
              :class="statusFilter === filter.key
                ? 'bg-[#172c3b] text-white border-[#172c3b]'
                : 'bg-transparent text-[#52616a] border-[#172c3b]/10 hover:border-[#172c3b]/20 hover:text-[#172c3b]'"
            >
              {{ filter.label }}
              <span
                class="px-1.5 py-0.5 rounded-sm text-[10px] font-bold tracking-wide"
                :class="statusFilter === filter.key ? 'bg-white/20 text-white' : 'bg-[#ded7cb] text-[#52616a]'"
              >
                {{ filter.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#eee7db] border-b border-[#172c3b]/10">
                <th class="px-6 py-3 text-[11px] font-semibold text-[#52616a] tracking-wider whitespace-nowrap w-[100px]">เลขที่</th>
                <th class="px-6 py-3 text-[11px] font-semibold text-[#52616a] tracking-wider whitespace-nowrap">ลูกค้า</th>
                <th class="px-6 py-3 text-[11px] font-semibold text-[#52616a] tracking-wider whitespace-nowrap w-[140px]">แพ็กเกจ</th>
                <th class="px-6 py-3 text-[11px] font-semibold text-[#52616a] tracking-wider whitespace-nowrap w-[160px]">สถานะ</th>
                <th class="px-6 py-3 text-[11px] font-semibold text-[#52616a] tracking-wider whitespace-nowrap w-[120px]">วันที่สั่งงาน</th>
                <th class="px-6 py-3 text-[11px] font-semibold text-[#52616a] tracking-wider whitespace-nowrap w-[140px]">ผู้รับผิดชอบ</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in tableRows"
                :key="row.orderId"
                class="border-b border-[#172c3b]/10 last:border-0 hover:bg-[#f5f0e7] transition-colors group"
              >
                <!-- Order ID -->
                <td class="px-6 py-3">
                  <span class="font-mono text-xs font-semibold text-[#172c3b]">#{{ row.orderId }}</span>
                </td>

                <!-- Customer -->
                <td class="px-6 py-3">
                  <span class="text-[13px] font-medium text-[#172c3b]">{{ row.customer }}</span>
                </td>

                <!-- Package -->
                <td class="px-6 py-3">
                  <span class="text-xs text-[#52616a]">{{ row.packageName }}</span>
                </td>

                <!-- Status badge -->
                <td class="px-6 py-3">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap"
                    :class="{
                      'bg-[#172c3b] text-white border-[#172c3b] shadow-sm': row.orderStatus === 'completed' || row.orderStatus === 'delivered',
                      'bg-[#FFF5F5] text-[#C53030] border-[#FEB2B2]': row.orderStatus === 'cancelled',
                      'bg-[#eee7db] text-[#52616a] border-[#172c3b]/10': row.orderStatus !== 'completed' && row.orderStatus !== 'delivered' && row.orderStatus !== 'cancelled'
                    }"
                  >
                    {{ getStatusLabel(row.orderStatus) }}
                  </span>
                </td>

                <!-- Date -->
                <td class="px-6 py-3">
                  <span class="text-xs text-[#69777f]">{{ formatDate(row.orderCreatedAt) }}</span>
                </td>

                <!-- Editor -->
                <td class="px-6 py-3">
                  <span class="text-xs text-[#52616a]">{{ row.editor }}</span>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="tableRows.length === 0">
                <td colspan="6">
                  <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
                    <p class="text-[14px] font-medium text-[#172c3b]">ไม่พบคำสั่งงาน</p>
                    <p class="text-[13px] text-[#69777f] mt-1">ไม่มีคำสั่งงานที่ตรงกับสถานะที่เลือก</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>
  </div>
</template>
