<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { orderService } from "~/services/order.service"
import type { OrderSummary } from "~/types/order.types"

definePageMeta({
  layout: "editor",
  middleware: ["auth", "editor"]
})

const jobs = ref<OrderSummary[]>([])
const loading = ref(true)
const error = ref("")
const statusFilter = ref("pending")

const fetchJobs = async () => {
  loading.value = true
  error.value = ""
  try {
    const res = await orderService.getMyOrders(1, 1000)
    jobs.value = res.data || []
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถดึงข้อมูลรายการงานได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchJobs() })

const stats = computed(() => {
  const toStart    = jobs.value.filter(j => j.orderStatus === "waiting_to_start").length
  const inProgress = jobs.value.filter(j => j.orderStatus === "in_progress").length
  const completed  = jobs.value.filter(j =>
    ["waiting_selection", "waiting_final_payment", "delivered", "completed"].includes(j.orderStatus)
  ).length
  return { toStart, inProgress, completed }
})

const statCards = computed(() => [
  {
    label: "งานรอดำเนินการ",
    value: stats.value.toStart,
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
  },
  {
    label: "กำลังแต่งภาพ",
    value: stats.value.inProgress,
    icon: "M13 10V3L4 14h7v7l9-11h-7z"
  },
  {
    label: "ส่งงาน/เสร็จสิ้นแล้ว",
    value: stats.value.completed,
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
  }
])

const filterOptions = computed(() => [
  { key: "pending",   label: "รอดำเนินการ", count: stats.value.toStart },
  { key: "progress",  label: "กำลังทำ",     count: stats.value.inProgress },
  { key: "completed", label: "ส่งงานแล้ว",  count: stats.value.completed },
  { key: "all",       label: "ทั้งหมด",     count: jobs.value.length }
])

const filteredJobs = computed(() => {
  if (statusFilter.value === "pending")   return jobs.value.filter(j => j.orderStatus === "waiting_to_start")
  if (statusFilter.value === "progress")  return jobs.value.filter(j => j.orderStatus === "in_progress")
  if (statusFilter.value === "completed") return jobs.value.filter(j =>
    ["waiting_selection", "waiting_final_payment", "delivered", "completed"].includes(j.orderStatus)
  )
  return jobs.value
})

const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 })

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric", month: "short", day: "numeric"
  })
}

const breadcrumb = [
  { label: "หน้าแรก", to: "/editor/dashboard" },
  { label: "ภาพรวม" }
]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">แดชบอร์ดช่างแต่งภาพ</h1>
        <p class="mt-0.5 text-sm text-gray-500">ติดตาม จัดการ และทำงานตกแต่งภาพตามที่ลูกค้ามอบหมาย</p>
      </div>
      <AdminActionButton
        variant="secondary"
        size="sm"
        icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        :loading="loading"
        @click="fetchJobs"
      >
        รีเฟรช
      </AdminActionButton>
    </div>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="bg-white border border-gray-200 rounded-xl p-5 h-24 animate-pulse" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="bg-white border border-gray-200 rounded-xl p-5 h-36 animate-pulse" />
      </div>
    </template>

    <!-- Error -->
    <div v-else-if="error" class="bg-white border border-red-200 rounded-xl p-6 text-center">
      <p class="text-sm text-red-600 font-medium">{{ error }}</p>
      <button @click="fetchJobs" class="mt-3 text-xs text-gray-500 hover:text-gray-700 underline">
        ลองโหลดใหม่
      </button>
    </div>

    <template v-else>
      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          v-for="card in statCards"
          :key="card.label"
          :label="card.label"
          :value="card.value"
          :icon="card.icon"
        />
      </div>

      <!-- Job Section -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <!-- Section header -->
        <div class="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-sm font-bold text-gray-900">รายการงานของฉัน</h2>
            <p class="text-xs text-gray-400 mt-0.5">คลิกที่การ์ดเพื่อเข้าห้องทำงาน</p>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="px-6 py-3 border-b border-gray-100 overflow-x-auto">
          <AdminFilterBar v-model="statusFilter" :filters="filterOptions" />
        </div>

        <!-- Empty State -->
        <AdminEmptyState
          v-if="filteredJobs.length === 0"
          title="ไม่มีรายการงาน"
          description="ไม่มีงานที่ตรงกับตัวกรองที่เลือกในขณะนี้"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />

        <!-- Job Cards Grid -->
        <div v-else class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NuxtLink
            v-for="job in filteredJobs"
            :key="job.orderId"
            :to="`/editor/jobs/${job.orderId}`"
            class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-gray-300 transition-all duration-150 flex flex-col justify-between group cursor-pointer"
          >
            <div class="space-y-3">
              <!-- Order ID + Status -->
              <div class="flex items-center justify-between">
                <span class="font-mono text-sm font-bold text-gray-900">#{{ job.orderId }}</span>
                <AdminStatusBadge :status="job.orderStatus" />
              </div>

              <!-- Work type -->
              <div>
                <span class="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">ประเภทงาน</span>
                <p class="text-sm font-semibold text-gray-800 mt-0.5">{{ job.workTypeName }}</p>
              </div>

              <!-- Package + Deadline -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <span class="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">แพ็กเกจ</span>
                  <p class="text-xs text-gray-600 font-medium mt-0.5">{{ job.packageName }}</p>
                </div>
                <div>
                  <span class="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">กำหนดส่ง</span>
                  <p class="text-xs text-gray-600 font-medium mt-0.5">{{ formatDate(job.orderRequiredDate) }}</p>
                </div>
              </div>
            </div>

            <!-- Footer: price + enter arrow -->
            <div class="border-t border-gray-100 mt-4 pt-3 flex items-center justify-between">
              <div>
                <span class="text-[10px] text-gray-400 block font-medium">ราคาสุทธิ</span>
                <span class="text-sm font-bold text-gray-900">฿{{ formatPrice(job.orderTotalPrice) }}</span>
              </div>
              <span class="text-xs font-medium text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all inline-flex items-center gap-1">
                เข้าทำงาน
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>
