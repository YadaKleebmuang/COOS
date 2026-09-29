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

const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

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

const getThaiStatus = (status: string) => {
  const map: Record<string, string> = {
    waiting_deposit: 'รอชำระมัดจำ',
    waiting_assignment: 'รอมอบหมายงาน',
    waiting_to_start: 'รอเริ่มงาน',
    in_progress: 'กำลังดำเนินการ',
    waiting_selection: 'รอเลือกผลงาน',
    waiting_final_payment: 'รอชำระส่วนที่เหลือ',
    delivered: 'ส่งมอบแล้ว',
    completed: 'เสร็จสมบูรณ์',
    cancelled: 'ยกเลิก'
  }
  return map[status] || status
}

const getThaiMonth = (month: string) => {
  if (!month) return month;
  const map: Record<string, string> = {
    'Jan': 'ม.ค.', 'Feb': 'ก.พ.', 'Mar': 'มี.ค.', 'Apr': 'เม.ย.',
    'May': 'พ.ค.', 'Jun': 'มิ.ย.', 'Jul': 'ก.ค.', 'Aug': 'ส.ค.',
    'Sep': 'ก.ย.', 'Oct': 'ต.ค.', 'Nov': 'พ.ย.', 'Dec': 'ธ.ค.'
  }
  const prefix = month.substring(0, 3).charAt(0).toUpperCase() + month.substring(1, 3).toLowerCase();
  return map[prefix] || month;
}

const exportPdf = () => {
  closeCalendar();
  const originalTitle = document.title;
  document.title = `COOS_Report_${dateFrom.value}_to_${dateTo.value}`;
  document.body.classList.add('reports-printing');
  setTimeout(() => {
    window.print();
    document.title = originalTitle;
    document.body.classList.remove('reports-printing');
  }, 100);
};

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
        label: getThaiStatus(s.status),
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

const formatCurrency = (n: number) => `${Number(n).toLocaleString("th-TH")}`
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
  <div class="space-y-6 max-w-7xl mx-auto reports-print-area">
    <!-- Print Only Header -->
    <div class="reports-print-only mb-8">
      <h1 class="text-2xl font-bold text-[#171717] mb-2">รายงานสรุปการดำเนินงานระบบ COOS</h1>
      <p class="text-[13px] text-[#666666] mb-6">เว็บแอปพลิเคชันบริหารจัดการคำสั่งงานสร้างภาพสำหรับสตูดิโอออนไลน์</p>
      
      <div class="flex items-center justify-between text-[13px] text-[#171717]">
        <div>
          <span class="font-semibold">ช่วงข้อมูล:</span> {{ formatDisplayDate(dateFrom) }} – {{ formatDisplayDate(dateTo) }}
        </div>
        <div>
          <span class="font-semibold">ออกรายงานเมื่อ:</span> {{ formatDisplayDate(getLocalDateString()) }}
        </div>
      </div>
    </div>
    
    <!-- Empty Report Warning for Print -->
    <div class="reports-print-only text-center py-20" v-if="reportData.totalOrders === 0">
      <p class="text-lg font-medium text-[#171717]">ไม่พบข้อมูลในช่วงเวลาที่เลือก</p>
    </div>

    <!-- Print Only Report Content -->
    <div class="reports-print-only space-y-8" v-if="reportData.totalOrders > 0">
      
      <!-- Section 2: Summary -->
      <div>
        <h2 class="text-[15px] font-bold text-[#171717] mb-3 border-b border-black/[0.1] pb-1" style="break-after: avoid;">สรุปข้อมูลหลัก</h2>
        <table class="w-full text-[12px] border-collapse border border-black/[0.1] text-[#171717]">
          <tbody>
            <tr class="border-b border-black/[0.1]">
              <td class="py-1.5 px-3 border-r border-black/[0.1] w-1/2">คำสั่งงานทั้งหมด</td>
              <td class="py-1.5 px-3 font-number font-bold text-right">{{ reportData.totalOrders }}</td>
            </tr>
            <tr class="border-b border-black/[0.1]">
              <td class="py-1.5 px-3 border-r border-black/[0.1]">รายได้รวม / ยอดรวม</td>
              <td class="py-1.5 px-3 font-number font-bold text-right">{{ formatCurrency(reportData.totalRevenue) }}</td>
            </tr>
            <tr class="border-b border-black/[0.1]">
              <td class="py-1.5 px-3 border-r border-black/[0.1]">งานเสร็จสมบูรณ์</td>
              <td class="py-1.5 px-3 font-number font-bold text-right">{{ reportData.completedOrders }}</td>
            </tr>
            <tr class="border-b border-black/[0.1]">
              <td class="py-1.5 px-3 border-r border-black/[0.1]">ลูกค้าใหม่</td>
              <td class="py-1.5 px-3 font-number font-bold text-right">{{ reportData.newCustomers }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section 3: Status Summary -->
      <div v-if="reportData.ordersByStatus?.length">
        <h2 class="text-[15px] font-bold text-[#171717] mb-3 border-b border-black/[0.1] pb-1" style="break-after: avoid;">สรุปสถานะออเดอร์</h2>
        <table class="w-full text-[12px] border-collapse border border-black/[0.1] text-[#171717]">
          <thead class="bg-[#F7F7F5]">
            <tr class="border-b border-black/[0.1]">
              <th class="py-1.5 px-3 text-left border-r border-black/[0.1]">สถานะ</th>
              <th class="py-1.5 px-3 text-right">จำนวน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in reportData.ordersByStatus" :key="s.status" class="border-b border-black/[0.1]">
              <td class="py-1.5 px-3 border-r border-black/[0.1]">{{ getThaiStatus(s.status) }}</td>
              <td class="py-1.5 px-3 font-number text-right">{{ s.count }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section 4: Monthly Financial -->
      <div class="break-inside-avoid" v-if="reportData.revenueByMonth?.length">
        <h2 class="text-[15px] font-bold text-[#171717] mb-3 border-b border-black/[0.1] pb-1">สรุปรายได้รายเดือน</h2>
        
        <table class="w-full text-[12px] border-collapse border border-black/[0.1] text-[#171717]">
          <thead class="bg-[#F7F7F5]">
            <tr class="border-b border-black/[0.1]">
              <th class="py-1.5 px-3 text-left border-r border-black/[0.1]">เดือน</th>
              <th class="py-1.5 px-3 text-right">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reportData.revenueByMonth" :key="item.month" class="border-b border-black/[0.1]" style="break-inside: avoid;">
              <td class="py-1.5 px-3 border-r border-black/[0.1]" style="color: #171717;">{{ getThaiMonth(item.month) }}</td>
              <td class="py-1.5 px-3 font-number text-right" style="color: #171717;">{{ formatCurrency(item.revenue) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section 5: Additional Summaries (Packages) -->
      <div v-if="reportData.popularPackages?.length" style="display: block; position: static; height: auto; min-height: 0; max-height: none; overflow: visible; opacity: 1; visibility: visible; background: #ffffff;">
        <h2 class="text-[15px] font-bold text-[#171717] mb-3 border-b border-black/[0.1] pb-1" style="color: #171717; break-after: avoid;">สรุปแพ็กเกจยอดนิยม</h2>
        <table class="w-full text-[12px] border-collapse border border-black/[0.1] text-[#171717]" style="width: 100%; border-collapse: collapse; display: table;">
          <thead class="bg-[#F7F7F5]" style="display: table-header-group;">
            <tr class="border-b border-black/[0.1]" style="break-inside: avoid;">
              <th class="py-1.5 px-3 text-left border-r border-black/[0.1]" style="color: #171717;">แพ็กเกจ</th>
              <th class="py-1.5 px-3 text-center border-r border-black/[0.1]" style="color: #171717;">คำสั่งงาน</th>
              <th class="py-1.5 px-3 text-right" style="color: #171717;">รายได้</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in reportData.popularPackages" :key="p.name" class="border-b border-black/[0.1]" style="break-inside: avoid;">
              <td class="py-1.5 px-3 border-r border-black/[0.1]" style="color: #171717;">{{ p.name }}</td>
              <td class="py-1.5 px-3 font-number text-center border-r border-black/[0.1]" style="color: #171717;">{{ p.count }}</td>
              <td class="py-1.5 px-3 font-number text-right" style="color: #171717;">{{ formatCurrency(p.revenue) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Section 6: Additional Summaries (Editors) -->
      <div v-if="reportData.editorWorkload?.length" style="display: block; position: static; height: auto; min-height: 0; max-height: none; overflow: visible; opacity: 1; visibility: visible; background: #ffffff;">
        <h2 class="text-[15px] font-bold text-[#171717] mb-3 border-b border-black/[0.1] pb-1" style="color: #171717; break-after: avoid;">สรุปปริมาณงาน Editor</h2>
        <table class="w-full text-[12px] border-collapse border border-black/[0.1] text-[#171717]" style="width: 100%; border-collapse: collapse; display: table;">
          <thead class="bg-[#F7F7F5]" style="display: table-header-group;">
            <tr class="border-b border-black/[0.1]">
              <th class="py-1.5 px-3 text-left border-r border-black/[0.1]" style="color: #171717;">นักออกแบบ</th>
              <th class="py-1.5 px-3 text-center border-r border-black/[0.1]" style="color: #171717;">งานในมือ</th>
              <th class="py-1.5 px-3 text-center border-r border-black/[0.1]" style="color: #171717;">รอลูกค้า</th>
              <th class="py-1.5 px-3 text-center" style="color: #171717;">เสร็จสมบูรณ์</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in reportData.editorWorkload" :key="e.name" class="border-b border-black/[0.1]" style="break-inside: avoid;">
              <td class="py-1.5 px-3 border-r border-black/[0.1]" style="color: #171717;">{{ e.name }}</td>
              <td class="py-1.5 px-3 font-number text-center border-r border-black/[0.1]" style="color: #171717;">{{ e.inProgressJobs || 0 }}</td>
              <td class="py-1.5 px-3 font-number text-center border-r border-black/[0.1]" style="color: #171717;">{{ e.pendingCustomerJobs || 0 }}</td>
              <td class="py-1.5 px-3 font-number text-center" style="color: #171717;">{{ e.completedJobs || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 reports-no-print">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-2xl sm:text-3xl font-semibold text-[#171717] tracking-tight">รายงาน</h1>
        <p class="mt-1 text-sm font-medium text-[#666666]">สรุปและติดตามข้อมูลการดำเนินงานของระบบ</p>
      </div>
      <div class="flex items-center gap-2 mt-1 sm:mt-0">
        <button 
          @click="exportPdf" 
          :disabled="loading"
          class="px-4 py-2 rounded-full border border-black/[0.06] bg-white text-[13px] font-medium text-[#171717] hover:bg-[#F7F7F5] transition-colors shadow-sm disabled:opacity-50"
        >
          ส่งออก PDF
        </button>
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
    <div class="relative z-30 bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] px-6 py-5 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-wrap items-center gap-4 reports-no-print">
      <p class="text-[13px] font-semibold text-[#171717]">ช่วงเวลา:</p>

      <!-- FROM Field -->
      <BaseCalendar v-model="dateFrom" variant="compact" label="จาก" />

      <!-- TO Field -->
      <BaseCalendar v-model="dateTo" variant="compact" label="ถึง" />
      
      <button 
        @click="fetchReport" 
        :disabled="loading"
        class="px-4 py-2 rounded-xl bg-[#171717] text-white text-[13px] font-medium hover:bg-black transition-colors shadow-sm disabled:opacity-50"
      >
        กรองข้อมูล
      </button>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 break-inside-avoid reports-no-print">
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
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 reports-no-print">

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
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 reports-no-print">

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
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">สรุปงานที่รับผิดชอบทั้งหมด</p>
        </div>
        <div class="flex-1 overflow-x-auto bg-[#FDFDFB]/30 orders-table-scope">
          <AdminDataTable
            :columns="[
              { key: 'name', label: 'Editor' }, 
              { key: 'inProgressJobs', label: 'งานในมือ', align: 'center' }, 
              { key: 'pendingCustomerJobs', label: 'รอลูกค้า', align: 'center' }, 
              { key: 'completedJobs', label: 'เสร็จสมบูรณ์', align: 'center' }
            ]"
            :rows="reportData.editorWorkload"
            row-key="name"
          >
            <template #cell-name="{ value }">
              <span class="text-[13px] font-medium text-[#171717]">{{ value }}</span>
            </template>
            <template #cell-inProgressJobs="{ value }">
              <span class="text-[13px] font-number font-semibold text-[#171717] bg-[#F7F7F5] border border-black/[0.06] rounded-md px-2 py-0.5 shadow-sm">{{ value || 0 }}</span>
            </template>
            <template #cell-pendingCustomerJobs="{ value }">
              <span class="text-[13px] font-number font-semibold text-[#171717] bg-[#F7F7F5] border border-black/[0.06] rounded-md px-2 py-0.5 shadow-sm">{{ value || 0 }}</span>
            </template>
            <template #cell-completedJobs="{ value }">
              <span class="text-[13px] font-number font-semibold text-[#171717] bg-[#F7F7F5] border border-black/[0.06] rounded-md px-2 py-0.5 shadow-sm">{{ value || 0 }}</span>
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

<style>
/* Print Styles for Reports */
@media print {
  @page {
    size: A4 portrait;
    margin: 15mm;
  }

  body.reports-printing * {
    visibility: hidden;
  }
  
  body.reports-printing .reports-print-area,
  body.reports-printing .reports-print-area * {
    visibility: visible;
  }
  
  body.reports-printing .reports-print-area {
    position: static;
    overflow: visible;
    height: auto;
    min-height: 0;
    max-height: none;
    width: 100%;
    padding: 0;
    margin: 0;
  }

  body.reports-printing .reports-no-print {
    display: none !important;
  }
  
  body.reports-printing .reports-print-only {
    display: block !important;
  }

  body.reports-printing .break-inside-avoid {
    break-inside: avoid;
  }
  
  body.reports-printing thead {
    display: table-header-group;
  }
}

.reports-print-only {
  display: none;
}
</style>

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
