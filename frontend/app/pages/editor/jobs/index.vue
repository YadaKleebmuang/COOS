<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { orderService } from "~/services/order.service"
import type { OrderSummary, OrderStatus } from "~/types/order.types"

definePageMeta({
  layout: "editor",
  middleware: ["auth", "editor"]
})

const token = useCookie<string | null>("token")
const jobs = ref<OrderSummary[]>([])
const loading = ref(true)
const error = ref("")
const selectedStatusFilter = ref<string>("all")

const fetchJobs = async () => {
  loading.value = true
  error.value = ""
  try {
    const res = await orderService.getMyOrders()
    jobs.value = res
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถดึงข้อมูลประวัติงานได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchJobs()
})

const filteredJobs = computed(() => {
  if (selectedStatusFilter.value === "all") {
    return jobs.value
  }
  return jobs.value.filter((j) => j.orderStatus === selectedStatusFilter.value)
})

const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 })

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

const statusMap: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
  waiting_deposit: {
    label: "รอชำระมัดจำ",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200"
  },
  waiting_assignment: {
    label: "รอจัดหาคนรับงาน",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200"
  },
  waiting_to_start: {
    label: "รอเริ่มงาน",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200"
  },
  in_progress: {
    label: "กำลังดำเนินการ",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200"
  },
  waiting_selection: {
    label: "รอเลือกภาพ",
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200"
  },
  waiting_final_payment: {
    label: "รอชำระส่วนที่เหลือ",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200"
  },
  delivered: {
    label: "ส่งมอบงานแล้ว",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200"
  },
  completed: {
    label: "เสร็จสมบูรณ์",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200"
  },
  cancelled: {
    label: "ยกเลิกออเดอร์",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200"
  }
}

const getStatusConfig = (status: OrderStatus) => {
  return statusMap[status] || {
    label: status,
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200"
  }
}

const filterTabs = [
  { value: "all", label: "ทั้งหมด" },
  { value: "waiting_to_start", label: "รอเริ่มงาน" },
  { value: "in_progress", label: "กำลังดำเนินงาน" },
  { value: "waiting_selection", label: "รอเลือกรูปภาพ" },
  { value: "completed", label: "เสร็จสมบูรณ์" }
]
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">📁 ประวัติการทำงานช่างภาพ</h1>
        <p class="text-slate-500 text-sm mt-1">เรียกดูประวัติและสรุปผลงานทั้งหมดที่คุณได้รับมอบหมายในระบบ</p>
      </div>
    </div>

    <!-- Filters Tab -->
    <div class="bg-white rounded-xl shadow-sm p-2 flex flex-wrap gap-1 border border-slate-100 overflow-x-auto">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        @click="selectedStatusFilter = tab.value"
        class="px-4 py-2 rounded-lg font-bold text-xs transition-all duration-200 whitespace-nowrap"
        :class="
          selectedStatusFilter === tab.value
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-50'
        "
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-3xl p-16 text-center border shadow-sm">
      <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
      <p class="text-slate-400 font-medium">กำลังโหลดประวัติการทำงานของคุณ...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-2xl border text-center font-bold text-sm">
      ⚠️ {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredJobs.length === 0" class="bg-white rounded-3xl p-16 text-center border shadow-sm space-y-4">
      <div class="text-5xl">📁</div>
      <h3 class="text-lg font-bold text-slate-700">ไม่พบข้อมูลงาน</h3>
      <p class="text-slate-400 text-sm">คุณไม่มีประวัติงานแต่งภาพในหมวดหมู่นี้</p>
    </div>

    <!-- Jobs Table List -->
    <div v-else class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase text-xs">
              <th class="px-6 py-4">หมายเลขออเดอร์</th>
              <th class="px-6 py-4">ประเภทงาน</th>
              <th class="px-6 py-4">แพ็กเกจ</th>
              <th class="px-6 py-4">วันกำหนดส่งงาน</th>
              <th class="px-6 py-4">ราคารวม</th>
              <th class="px-6 py-4">สถานะ</th>
              <th class="px-6 py-4 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="job in filteredJobs" :key="job.orderId" class="hover:bg-slate-50/40 text-slate-700 transition">
              <td class="px-6 py-4 font-bold text-slate-800">
                #{{ job.orderId }}
              </td>
              <td class="px-6 py-4 font-semibold text-slate-800">
                🎨 {{ job.workTypeName }}
              </td>
              <td class="px-6 py-4 text-slate-500 font-medium">
                📦 {{ job.packageName }}
              </td>
              <td class="px-6 py-4 text-slate-500 font-medium">
                📅 {{ formatDate(job.orderRequiredDate) }}
              </td>
              <td class="px-6 py-4 text-indigo-600 font-extrabold">
                ฿{{ formatPrice(job.orderTotalPrice) }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-black border uppercase"
                  :class="[
                    getStatusConfig(job.orderStatus).bg,
                    getStatusConfig(job.orderStatus).text,
                    getStatusConfig(job.orderStatus).border
                  ]"
                >
                  {{ getStatusConfig(job.orderStatus).label }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <NuxtLink :to="`/editor/jobs/${job.orderId}`" class="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                  เข้าทำงาน →
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
