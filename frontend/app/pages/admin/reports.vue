<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()
const { alert } = useAlert()

// ── State ──────────────────────────────────────────────────────
const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCurrentYearFirstDay = () => {
  const d = new Date();
  return `${d.getFullYear()}-01-01`;
};

const loading = ref(true)
const dateFrom = ref(getCurrentYearFirstDay())
const dateTo = ref(getLocalDateString())

const activeCalendar = ref<"from" | "to" | null>(null);
const calendarMonth = ref(new Date().getMonth());
const calendarYear = ref(new Date().getFullYear());

const daysOfWeek = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

const toggleCalendar = (type: "from" | "to") => {
  if (activeCalendar.value === type) {
    activeCalendar.value = null;
  } else {
    activeCalendar.value = type;
    const dateVal = type === "from" ? dateFrom.value : dateTo.value;
    if (dateVal) {
      const [y, m, d] = dateVal.split("-");
      calendarYear.value = parseInt(y, 10);
      calendarMonth.value = parseInt(m, 10) - 1;
    } else {
      const d = new Date();
      calendarYear.value = d.getFullYear();
      calendarMonth.value = d.getMonth();
    }
  }
};

const closeCalendar = () => {
  activeCalendar.value = null;
};

const calendarDays = computed(() => {
  const days = [];
  const year = calendarYear.value;
  const month = calendarMonth.value;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, dateStr: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, "0")}-${String(daysInPrevMonth - i).padStart(2, "0")}` });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, isCurrentMonth: true, dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}` });
  }
  
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false, dateStr: `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, "0")}-${String(i).padStart(2, "0")}` });
  }
  
  return days;
});

const prevMonth = () => {
  if (calendarMonth.value === 0) {
    calendarMonth.value = 11;
    calendarYear.value--;
  } else {
    calendarMonth.value--;
  }
};

const nextMonth = () => {
  if (calendarMonth.value === 11) {
    calendarMonth.value = 0;
    calendarYear.value++;
  } else {
    calendarMonth.value++;
  }
};

const selectDate = (dateStr: string) => {
  if (activeCalendar.value === "from") {
    dateFrom.value = dateStr;
  } else if (activeCalendar.value === "to") {
    dateTo.value = dateStr;
  }
  closeCalendar();
};

const setTodayAction = () => {
  const todayStr = getLocalDateString();
  if (activeCalendar.value === "from") {
    dateFrom.value = todayStr;
  } else if (activeCalendar.value === "to") {
    dateTo.value = todayStr;
  }
  closeCalendar();
};

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return "เลือกวันที่";
  const [y, m, d] = dateStr.split("-");
  return `${parseInt(d, 10)} ${monthNames[parseInt(m, 10) - 1]} ${parseInt(y, 10) + 543}`;
};

const reportData = ref({
  totalOrders: 0,
  totalRevenue: 0,
  completedOrders: 0,
  cancelledOrders: 0,
  newCustomers: 0,
  activeEditors: 0,
  avgOrderValue: 0,
  avgDeliveryDays: 0,
  ordersByStatus: [] as any[],
  popularPackages: [] as any[],
  editorWorkload: [] as any[],
  revenueByMonth: [] as any[]
})

const fetchReport = async () => {
  if (dateFrom.value && dateTo.value && dateFrom.value > dateTo.value) {
    alert("แจ้งเตือน", "วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด", "warning")
    return
  }
  loading.value = true
  try {
    const data = await apiFetch<any>(`/reports?from=${dateFrom.value}&to=${dateTo.value}`)
    reportData.value = {
      ...reportData.value,
      ...data,
      ordersByStatus: data.ordersByStatus?.map((s: any) => ({
        status: s.status,
        label: s.status === 'completed' ? 'เสร็จสมบูรณ์' : s.status === 'in_progress' ? 'กำลังดำเนินการ' : s.status === 'cancelled' ? 'ยกเลิก' : s.status === 'waiting_deposit' ? 'รอมัดจำ' : s.status === 'waiting_assignment' ? 'รอมอบหมาย' : s.status === 'final_payment' ? 'รอชำระยอดเหลือ' : s.status,
        count: s.count
      })) || []
    }
  } catch (error: any) {
    alert("แจ้งเตือน", "เกิดข้อผิดพลาด: " + error.message, "error")
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchReport())

const formatCurrency = (n: number) => `฿${Number(n).toLocaleString("th-TH")}`
const maxRevenue = computed(() => {
  if (!reportData.value.revenueByMonth || reportData.value.revenueByMonth.length === 0) return 1
  return Math.max(...reportData.value.revenueByMonth.map(r => Number(r.revenue)))
})

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "รายงาน" }]

const statCards = computed(() => [
  {
    label: "คำสั่งงานทั้งหมด",
    value: reportData.value.totalOrders,
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
  },
  {
    label: "รายได้รวม",
    value: formatCurrency(Number(reportData.value.totalRevenue)),
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  },
  {
    label: "งานเสร็จสมบูรณ์",
    value: reportData.value.completedOrders,
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
  },
  {
    label: "ลูกค้าใหม่",
    value: reportData.value.newCustomers,
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
  }
])
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-2xl sm:text-3xl font-semibold text-[#171717] tracking-tight">รายงาน</h1>
        <p class="mt-1 text-sm font-medium text-[#666666]">สรุปและติดตามข้อมูลการดำเนินงานของระบบ</p>
      </div>
      <div class="flex items-center gap-2 mt-1 sm:mt-0">
        <button
          @click="fetchReport"
          :disabled="loading"
          class="px-4 py-2 rounded-full border border-black/[0.06] bg-white text-[13px] font-medium text-[#171717] hover:bg-[#F7F7F5] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          <svg v-if="!loading" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          รีเฟรช
        </button>
      </div>
    </div>

    <!-- Date range filter -->
    <div class="relative z-30 bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] px-6 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-wrap items-center gap-4">
      <p class="text-[13px] font-semibold text-[#171717]">ช่วงเวลา:</p>

      <!-- Click outside overlay -->
      <div v-if="activeCalendar" @click="closeCalendar" class="fixed inset-0 z-40 cursor-default"></div>

      <!-- FROM Field -->
      <div class="relative z-50">
        <div @click="toggleCalendar('from')" class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl px-3 py-2 hover:bg-white hover:border-black/[0.12] transition-all cursor-pointer">
          <span class="text-xs font-medium text-[#666666]">จาก</span>
          <div class="text-xs font-medium text-[#171717] min-w-[80px]">{{ formatDisplayDate(dateFrom) }}</div>
        </div>
        
        <!-- FROM Calendar -->
        <div v-if="activeCalendar === 'from'" class="absolute top-full left-0 mt-2 bg-white border border-black/[0.06] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-4 w-[280px]">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <button @click.stop="prevMonth" class="p-1 hover:bg-[#F7F7F5] rounded-full transition-colors text-[#171717]" aria-label="Previous month">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div class="text-[13px] font-semibold text-[#171717]">{{ monthNames[calendarMonth] }} {{ calendarYear + 543 }}</div>
            <button @click.stop="nextMonth" class="p-1 hover:bg-[#F7F7F5] rounded-full transition-colors text-[#171717]" aria-label="Next month">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <!-- Days of Week -->
          <div class="grid grid-cols-7 gap-1 mb-2 text-center">
            <div v-for="d in daysOfWeek" :key="d" class="text-[11px] font-semibold text-[#666666]">{{ d }}</div>
          </div>
          <!-- Days -->
          <div class="grid grid-cols-7 gap-1">
            <button v-for="d in calendarDays" :key="d.dateStr" @click.stop="selectDate(d.dateStr)" class="h-8 rounded-full flex items-center justify-center text-[12px] font-medium transition-all" :class="{'bg-[#171717] text-white': dateFrom === d.dateStr, 'text-[#171717] hover:bg-[#F7F7F5]': dateFrom !== d.dateStr && d.isCurrentMonth, 'text-[#9A9A95] hover:bg-[#F7F7F5]': !d.isCurrentMonth, 'border border-black/[0.06]': getLocalDateString() === d.dateStr && dateFrom !== d.dateStr}">
              {{ d.day }}
            </button>
          </div>
          <!-- Footer Action -->
          <div class="mt-4 pt-3 border-t border-black/[0.06] text-center">
            <button @click.stop="setTodayAction" class="text-[12px] font-medium text-[#171717] hover:bg-[#F7F7F5] px-4 py-1.5 rounded-lg transition-colors border border-transparent hover:border-black/[0.06]">
              วันนี้
            </button>
          </div>
        </div>
      </div>

      <!-- TO Field -->
      <div class="relative z-50">
        <div @click="toggleCalendar('to')" class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl px-3 py-2 hover:bg-white hover:border-black/[0.12] transition-all cursor-pointer">
          <span class="text-xs font-medium text-[#666666]">ถึง</span>
          <div class="text-xs font-medium text-[#171717] min-w-[80px]">{{ formatDisplayDate(dateTo) }}</div>
        </div>
        
        <!-- TO Calendar -->
        <div v-if="activeCalendar === 'to'" class="absolute top-full left-0 mt-2 bg-white border border-black/[0.06] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-4 w-[280px]">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <button @click.stop="prevMonth" class="p-1 hover:bg-[#F7F7F5] rounded-full transition-colors text-[#171717]" aria-label="Previous month">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div class="text-[13px] font-semibold text-[#171717]">{{ monthNames[calendarMonth] }} {{ calendarYear + 543 }}</div>
            <button @click.stop="nextMonth" class="p-1 hover:bg-[#F7F7F5] rounded-full transition-colors text-[#171717]" aria-label="Next month">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <!-- Days of Week -->
          <div class="grid grid-cols-7 gap-1 mb-2 text-center">
            <div v-for="d in daysOfWeek" :key="d" class="text-[11px] font-semibold text-[#666666]">{{ d }}</div>
          </div>
          <!-- Days -->
          <div class="grid grid-cols-7 gap-1">
            <button v-for="d in calendarDays" :key="d.dateStr" @click.stop="selectDate(d.dateStr)" class="h-8 rounded-full flex items-center justify-center text-[12px] font-medium transition-all" :class="{'bg-[#171717] text-white': dateTo === d.dateStr, 'text-[#171717] hover:bg-[#F7F7F5]': dateTo !== d.dateStr && d.isCurrentMonth, 'text-[#9A9A95] hover:bg-[#F7F7F5]': !d.isCurrentMonth, 'border border-black/[0.06]': getLocalDateString() === d.dateStr && dateTo !== d.dateStr}">
              {{ d.day }}
            </button>
          </div>
          <!-- Footer Action -->
          <div class="mt-4 pt-3 border-t border-black/[0.06] text-center">
            <button @click.stop="setTodayAction" class="text-[12px] font-medium text-[#171717] hover:bg-[#F7F7F5] px-4 py-1.5 rounded-lg transition-colors border border-transparent hover:border-black/[0.06]">
              วันนี้
            </button>
          </div>
        </div>
      </div>
      
      <button 
        @click="fetchReport" 
        :disabled="loading"
        class="px-4 py-2 rounded-xl bg-[#171717] text-white text-[13px] font-medium hover:bg-black transition-colors shadow-sm disabled:opacity-50"
      >
        กรองข้อมูล
      </button>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[120px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] hover:border-black/10 transition-all duration-300"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-semibold text-[#666666] tracking-wide">{{ card.label }}</span>
          <div class="w-8 h-8 rounded-full bg-[#F7F7F5] flex items-center justify-center text-[#171717] flex-shrink-0 border border-black/[0.03]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="card.icon" />
            </svg>
          </div>
        </div>
        <div class="mt-2 flex items-baseline">
          <span class="text-3xl font-bold text-[#171717] tracking-tight">{{ card.value }}</span>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Revenue bar chart (CSS-based) -->
      <div class="xl:col-span-2 bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col">
        <div class="mb-5">
          <h2 class="text-lg font-semibold text-[#171717] tracking-tight">รายได้รายเดือน</h2>
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">แนวโน้มรายได้จากคำสั่งงานในช่วงเวลาที่เลือก</p>
        </div>
        <div class="flex-1 flex items-end gap-3 min-h-[160px] pt-4">
          <div v-for="item in reportData.revenueByMonth" :key="item.month" class="flex-1 flex flex-col items-center gap-2 group">
            <span class="text-[10px] text-[#666666] opacity-0 group-hover:opacity-100 transition-opacity font-number whitespace-nowrap">{{ formatCurrency(item.revenue) }}</span>
            <div class="w-full bg-[#171717] rounded-t-sm transition-all hover:bg-[#666666] border border-black/[0.06]" :style="{ height: `${Math.round((Number(item.revenue) / maxRevenue) * 120)}px` }"/>
            <span class="text-[10px] font-semibold text-[#9A9A95]">{{ item.month }}</span>
          </div>
          <div v-if="!reportData.revenueByMonth?.length" class="w-full h-full flex items-center justify-center text-[13px] text-[#9A9A95]">
            ไม่มีข้อมูลในระบบ
          </div>
        </div>
      </div>

      <!-- Order status donut (text-based) -->
      <div class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        <div class="mb-5">
          <h2 class="text-lg font-semibold text-[#171717] tracking-tight">สรุปสถานะออเดอร์</h2>
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">สัดส่วนของงานแต่ละสถานะ</p>
        </div>
        <div class="space-y-4">
          <div v-for="s in reportData.ordersByStatus" :key="s.status" class="flex items-center gap-3">
            <div class="flex-1">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[12px] font-medium text-[#171717]">{{ s.label }}</span>
                <span class="text-[12px] font-bold text-[#171717] font-number">{{ s.count }}</span>
              </div>
              <div class="h-1.5 bg-[#F7F7F5] rounded-full overflow-hidden border border-black/[0.03]">
                <div class="h-full bg-[#171717] rounded-full transition-all" :style="{ width: reportData.totalOrders ? `${Math.round((s.count / reportData.totalOrders) * 100)}%` : '0%' }"/>
              </div>
            </div>
          </div>
          <div v-if="!reportData.ordersByStatus?.length" class="text-[13px] text-[#9A9A95] text-center py-4">
            ไม่มีข้อมูลในระบบ
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom grid -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

      <!-- Popular packages -->
      <div class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
        <div class="px-6 py-5 border-b border-black/[0.06]">
          <h2 class="text-lg font-semibold text-[#171717] tracking-tight">แพ็กเกจยอดนิยม</h2>
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">แพ็กเกจที่ลูกค้าเลือกใช้งานมากที่สุด</p>
        </div>
        <div class="flex-1 overflow-x-auto bg-[#FDFDFB]/30 orders-table-scope">
          <AdminDataTable
            :columns="[{ key: 'name', label: 'แพ็กเกจ' }, { key: 'count', label: 'คำสั่งงาน', align: 'center' }, { key: 'revenue', label: 'รายได้', align: 'right' }]"
            :rows="reportData.popularPackages"
            row-key="name"
          >
            <template #cell-name="{ value }">
              <span class="text-[13px] font-medium text-[#171717]">{{ value }}</span>
            </template>
            <template #cell-count="{ value }">
              <span class="text-[13px] font-number font-semibold text-[#171717] bg-[#F7F7F5] border border-black/[0.06] rounded-md px-2 py-0.5 shadow-sm">{{ value }}</span>
            </template>
            <template #cell-revenue="{ value }">
              <span class="text-[13px] font-bold font-number text-[#171717]">{{ formatCurrency(value) }}</span>
            </template>
          </AdminDataTable>
          <div v-if="!reportData.popularPackages?.length" class="py-12 px-6 text-center border-t border-black/[0.04]">
            <p class="text-[14px] font-medium text-[#171717]">ไม่พบข้อมูล</p>
          </div>
        </div>
      </div>

      <!-- Editor performance -->
      <div class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
        <div class="px-6 py-5 border-b border-black/[0.06]">
          <h2 class="text-lg font-semibold text-[#171717] tracking-tight">ปริมาณงาน Editor</h2>
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">สรุปงานที่รับผิดชอบและระยะเวลาเฉลี่ยในการทำงาน</p>
        </div>
        <div class="flex-1 overflow-x-auto bg-[#FDFDFB]/30 orders-table-scope">
          <AdminDataTable
            :columns="[{ key: 'name', label: 'Editor' }, { key: 'completedJobs', label: 'งานเสร็จ', align: 'center' }, { key: 'avgDays', label: 'เฉลี่ย (วัน)', align: 'center' }]"
            :rows="reportData.editorWorkload"
            row-key="name"
          >
            <template #cell-name="{ value }">
              <span class="text-[13px] font-medium text-[#171717]">{{ value }}</span>
            </template>
            <template #cell-completedJobs="{ value }">
              <span class="text-[13px] font-number font-semibold text-[#171717] bg-[#F7F7F5] border border-black/[0.06] rounded-md px-2 py-0.5 shadow-sm">{{ value || 0 }}</span>
            </template>
            <template #cell-avgDays="{ value }">
              <span class="text-[12px] font-medium text-[#666666]">{{ Number(value || 0).toFixed(1) }}</span>
            </template>
          </AdminDataTable>
          <div v-if="!reportData.editorWorkload?.length" class="py-12 px-6 text-center border-t border-black/[0.04]">
            <p class="text-[14px] font-medium text-[#171717]">ไม่พบข้อมูล</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Orders table visual language */
.orders-table-scope :deep(.rounded-xl) {
  border-radius: 0 !important;
  border-color: rgba(0, 0, 0, 0.06) !important;
  border-width: 0 !important;
}

.orders-table-scope :deep(thead.bg-gray-50) {
  background-color: rgba(247, 247, 245, 0.8) !important;
  border-bottom-color: rgba(0, 0, 0, 0.06) !important;
}

.orders-table-scope :deep(th) {
  padding: 0.75rem 1.5rem !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  color: #666666 !important;
  letter-spacing: 0.05em !important;
}

.orders-table-scope :deep(td) {
  padding: 0.75rem 1.5rem !important;
}

.orders-table-scope :deep(tbody.bg-white tr:hover) {
  background-color: #FDFDFB !important;
}

.orders-table-scope :deep(tbody.bg-white.divide-gray-100 > tr) {
  border-color: rgba(0, 0, 0, 0.04) !important;
}

.orders-table-scope :deep(table) {
  width: 100%;
}
</style>
