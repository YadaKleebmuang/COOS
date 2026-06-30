<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

// ── State ──────────────────────────────────────────────────────
const loading = ref(true)
const dateFrom = ref("2025-06-01")
const dateTo = ref("2025-06-30")

// ── Mock report data ───────────────────────────────────────────
const reportData = ref({
  totalOrders: 42,
  totalRevenue: 185500,
  completedOrders: 28,
  cancelledOrders: 4,
  newCustomers: 15,
  activeEditors: 4,
  avgOrderValue: 4416,
  avgDeliveryDays: 6,
  ordersByStatus: [
    { status: "completed", label: "เสร็จสมบูรณ์", count: 28 },
    { status: "in_progress", label: "กำลังดำเนินการ", count: 8 },
    { status: "cancelled", label: "ยกเลิก", count: 4 },
    { status: "waiting_deposit", label: "รอมัดจำ", count: 2 }
  ],
  popularPackages: [
    { name: "Professional", count: 18, revenue: 90000 },
    { name: "Standard", count: 14, revenue: 56000 },
    { name: "Basic", count: 10, revenue: 18000 }
  ],
  editorWorkload: [
    { name: "Alex W.", completedJobs: 12, avgDays: 5.2 },
    { name: "Sarah J.", completedJobs: 10, avgDays: 6.1 },
    { name: "Mark L.", completedJobs: 4, avgDays: 7.3 },
    { name: "Chris P.", completedJobs: 2, avgDays: 5.8 }
  ],
  revenueByMonth: [
    { month: "ม.ค.", revenue: 28000 },
    { month: "ก.พ.", revenue: 32000 },
    { month: "มี.ค.", revenue: 25000 },
    { month: "เม.ย.", revenue: 40000 },
    { month: "พ.ค.", revenue: 38000 },
    { month: "มิ.ย.", revenue: 22500 }
  ]
})

const fetchReport = async () => {
  loading.value = true
  try {
    // Future: const data = await apiFetch(`/reports?from=${dateFrom.value}&to=${dateTo.value}`)
    await new Promise(r => setTimeout(r, 500))
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchReport())

const exportCsv = () => {
  // Future: trigger CSV download from API
  alert("ฟีเจอร์นี้จะพร้อมใช้งานเร็วๆ นี้")
}

const formatCurrency = (n: number) => `฿${n.toLocaleString("th-TH")}`
const maxRevenue = computed(() => Math.max(...reportData.value.revenueByMonth.map(r => r.revenue)))

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "รายงาน" }]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">รายงานและสถิติ</h1>
        <p class="mt-0.5 text-sm text-gray-500">ภาพรวมผลการดำเนินงานของ COOS Studio</p>
      </div>
      <div class="flex items-center gap-2">
        <AdminActionButton variant="secondary" size="sm" @click="exportCsv" icon="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">Export CSV</AdminActionButton>
        <AdminActionButton variant="primary" size="sm" :loading="loading" @click="fetchReport">โหลดรายงาน</AdminActionButton>
      </div>
    </div>

    <!-- Date range filter -->
    <div class="bg-white border border-gray-200 rounded-xl px-5 py-4 flex flex-wrap items-center gap-4">
      <p class="text-sm font-medium text-gray-700">ช่วงเวลา:</p>
      <div class="flex items-center gap-2">
        <label class="text-xs text-gray-500">จาก</label>
        <input v-model="dateFrom" type="date" class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-400"/>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-xs text-gray-500">ถึง</label>
        <input v-model="dateTo" type="date" class="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-400"/>
      </div>
      <AdminActionButton variant="secondary" size="sm" @click="fetchReport" :loading="loading">กรอง</AdminActionButton>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <AdminStatCard label="คำสั่งงานทั้งหมด" :value="reportData.totalOrders" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
      <AdminStatCard label="รายได้รวม" :value="formatCurrency(reportData.totalRevenue)" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      <AdminStatCard label="งานเสร็จสมบูรณ์" :value="reportData.completedOrders" icon="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      <AdminStatCard label="ลูกค้าใหม่" :value="reportData.newCustomers" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Revenue bar chart (CSS-based) -->
      <div class="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
        <h2 class="text-sm font-bold text-gray-900 mb-5">รายได้รายเดือน</h2>
        <div class="flex items-end gap-3 h-40">
          <div v-for="item in reportData.revenueByMonth" :key="item.month" class="flex-1 flex flex-col items-center gap-1.5 group">
            <span class="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity font-number whitespace-nowrap">{{ formatCurrency(item.revenue) }}</span>
            <div class="w-full bg-gray-900 rounded-t transition-all hover:bg-gray-700" :style="{ height: `${Math.round((item.revenue / maxRevenue) * 128)}px` }"/>
            <span class="text-[10px] text-gray-500">{{ item.month }}</span>
          </div>
        </div>
      </div>

      <!-- Order status donut (text-based) -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h2 class="text-sm font-bold text-gray-900 mb-4">สรุปสถานะออเดอร์</h2>
        <div class="space-y-3">
          <div v-for="s in reportData.ordersByStatus" :key="s.status" class="flex items-center gap-3">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-600">{{ s.label }}</span>
                <span class="text-xs font-bold text-gray-900 font-number">{{ s.count }}</span>
              </div>
              <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-gray-900 rounded-full" :style="{ width: `${Math.round((s.count / reportData.totalOrders) * 100)}%` }"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom grid -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

      <!-- Popular packages -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h2 class="text-sm font-bold text-gray-900 mb-4">แพ็กเกจยอดนิยม</h2>
        <AdminDataTable
          :columns="[{ key: 'name', label: 'แพ็กเกจ' }, { key: 'count', label: 'คำสั่งงาน', align: 'center' }, { key: 'revenue', label: 'รายได้', align: 'right' }]"
          :rows="reportData.popularPackages"
          row-key="name"
        >
          <template #cell-name="{ value }">
            <span class="text-sm font-medium text-gray-900">{{ value }}</span>
          </template>
          <template #cell-count="{ value }">
            <span class="text-sm font-number text-gray-700">{{ value }}</span>
          </template>
          <template #cell-revenue="{ value }">
            <span class="text-sm font-bold font-number text-gray-900">{{ formatCurrency(value) }}</span>
          </template>
        </AdminDataTable>
      </div>

      <!-- Editor performance -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h2 class="text-sm font-bold text-gray-900 mb-4">ประสิทธิภาพ Editor</h2>
        <AdminDataTable
          :columns="[{ key: 'name', label: 'Editor' }, { key: 'completedJobs', label: 'งานเสร็จ', align: 'center' }, { key: 'avgDays', label: 'เฉลี่ย (วัน)', align: 'center' }]"
          :rows="reportData.editorWorkload"
          row-key="name"
        >
          <template #cell-name="{ value }">
            <span class="text-sm font-medium text-gray-900">{{ value }}</span>
          </template>
          <template #cell-completedJobs="{ value }">
            <span class="text-sm font-number text-gray-700">{{ value }}</span>
          </template>
          <template #cell-avgDays="{ value }">
            <span class="text-sm font-number text-gray-500">{{ value }}</span>
          </template>
        </AdminDataTable>
      </div>
    </div>
  </div>
</template>
