<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { orderService } from "~/services/order.service"
import type { OrderSummary } from "~/types/order.types"

definePageMeta({
  layout: "editor",
  middleware: ["auth", "editor"]
})

const token = useCookie<string | null>("token")
const jobs = ref<OrderSummary[]>([])
const loading = ref(true)
const error = ref("")
const selectedFilter = ref<"pending" | "progress" | "completed" | "all">("pending")

const fetchJobs = async () => {
  loading.value = true
  error.value = ""
  try {
    // Backend GET /orders automatically filters by assigned editorId for editor users!
    const res = await orderService.getMyOrders()
    jobs.value = res
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถดึงข้อมูลรายการงานได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchJobs()
})

const stats = computed(() => {
  const toStart = jobs.value.filter(j => j.orderStatus === "waiting_to_start").length
  const inProgress = jobs.value.filter(j => j.orderStatus === "in_progress").length
  const completed = jobs.value.filter(j => 
    j.orderStatus === "waiting_selection" || 
    j.orderStatus === "waiting_final_payment" || 
    j.orderStatus === "delivered" || 
    j.orderStatus === "completed"
  ).length
  return { toStart, inProgress, completed }
})

const filteredJobs = computed(() => {
  if (selectedFilter.value === "pending") {
    return jobs.value.filter(j => j.orderStatus === "waiting_to_start")
  }
  if (selectedFilter.value === "progress") {
    return jobs.value.filter(j => j.orderStatus === "in_progress")
  }
  if (selectedFilter.value === "completed") {
    return jobs.value.filter(j => 
      j.orderStatus === "waiting_selection" || 
      j.orderStatus === "waiting_final_payment" || 
      j.orderStatus === "delivered" || 
      j.orderStatus === "completed"
    )
  }
  return jobs.value
})

const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 })

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    waiting_to_start: "bg-indigo-50 text-indigo-700 border-indigo-200",
    in_progress: "bg-purple-50 text-purple-700 border-purple-200",
    waiting_selection: "bg-pink-50 text-pink-700 border-pink-200",
    waiting_final_payment: "bg-orange-50 text-orange-700 border-orange-200",
    delivered: "bg-teal-50 text-teal-700 border-teal-200",
    completed: "bg-green-50 text-green-700 border-green-200"
  }
  return classes[status] || "bg-gray-50 text-gray-700 border-gray-200"
}
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="border-b border-slate-100 pb-4">
      <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">💻 แผงควบคุมงาน Editor</h1>
      <p class="text-slate-500 text-sm mt-1">ติดตาม จัดการ และทำงานตกแต่งภาพตามที่ลูกค้ามอบหมายในระบบ</p>
    </div>

    <!-- Stats Panel -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">🕒</div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">งานรอดำเนินการ</p>
          <p class="text-2xl font-black text-slate-800 mt-1">{{ stats.toStart }} รายการ</p>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">✍️</div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">กำลังรังสรรค์/แต่งภาพ</p>
          <p class="text-2xl font-black text-slate-800 mt-1">{{ stats.inProgress }} รายการ</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl">🏆</div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">ส่งงาน/เสร็จสิ้นแล้ว</p>
          <p class="text-2xl font-black text-slate-800 mt-1">{{ stats.completed }} รายการ</p>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="bg-white border rounded-xl p-1 flex gap-1 shadow-sm">
        <button
          @click="selectedFilter = 'pending'"
          class="px-4 py-2 text-xs font-bold rounded-lg transition-all"
          :class="selectedFilter === 'pending' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'"
        >
          รอดำเนินการ ({{ stats.toStart }})
        </button>
        <button
          @click="selectedFilter = 'progress'"
          class="px-4 py-2 text-xs font-bold rounded-lg transition-all"
          :class="selectedFilter === 'progress' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'"
        >
          กำลังทำ ({{ stats.inProgress }})
        </button>
        <button
          @click="selectedFilter = 'completed'"
          class="px-4 py-2 text-xs font-bold rounded-lg transition-all"
          :class="selectedFilter === 'completed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'"
        >
          ส่งงานแล้ว ({{ stats.completed }})
        </button>
        <button
          @click="selectedFilter = 'all'"
          class="px-4 py-2 text-xs font-bold rounded-lg transition-all"
          :class="selectedFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'"
        >
          ทั้งหมด ({{ jobs.length }})
        </button>
      </div>
      
      <button @click="fetchJobs" class="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:shadow-sm transition">
        🔄 รีเฟรชรายการ
      </button>
    </div>

    <!-- Job list grid -->
    <div v-if="loading" class="bg-white rounded-3xl p-16 text-center border shadow-sm">
      <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
      <p class="text-slate-400 font-medium">กำลังค้นหารายการงานของคุณ...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-2xl border text-center font-bold text-sm">
      ⚠️ {{ error }}
    </div>

    <div v-else-if="filteredJobs.length === 0" class="bg-white rounded-3xl p-16 text-center border shadow-sm space-y-4">
      <div class="text-5xl">📦</div>
      <h3 class="text-lg font-bold text-slate-700">ไม่มีรายการงานภาพถ่าย</h3>
      <p class="text-slate-400 text-sm max-w-sm mx-auto">ไม่มีงานที่ได้รับมอบหมายตรงกับตัวกรองที่ระบุในขณะนี้</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="job in filteredJobs"
        :key="job.orderId"
        :to="`/editor/jobs/${job.orderId}`"
        class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer"
      >
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-50 pb-3">
            <span class="font-black text-slate-800 text-sm group-hover:text-indigo-600 transition">งาน #{{ job.orderId }}</span>
            <span class="px-2.5 py-1 text-[10px] font-black border rounded-full uppercase" :class="getStatusBadgeClass(job.orderStatus)">
              {{ job.orderStatus.replace('_', ' ') }}
            </span>
          </div>

          <div class="space-y-2">
            <div>
              <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ประเภทภาพ</span>
              <p class="text-sm font-bold text-slate-700">🎨 {{ job.workTypeName }}</p>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">แพ็กเกจ</span>
                <p class="text-xs text-slate-600 font-medium">📦 {{ job.packageName }}</p>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">กำหนดส่งมอบ</span>
                <p class="text-xs text-slate-600 font-medium">📅 {{ formatDate(job.orderRequiredDate) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-50 mt-6 pt-4 flex items-center justify-between">
          <div class="text-left">
            <span class="text-[10px] text-slate-400 block font-bold">ราคาสุทธิ</span>
            <span class="text-base font-extrabold text-indigo-600">฿{{ formatPrice(job.orderTotalPrice) }}</span>
          </div>
          <span class="text-xs font-bold text-indigo-600 group-hover:translate-x-1.5 transition-transform inline-flex items-center gap-1">
            เข้าห้องทำงาน
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
