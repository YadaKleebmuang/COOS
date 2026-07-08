<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { orderService } from "~/services/order.service"
import type { OrderSummary, OrderStatus } from "~/types/order.types"

definePageMeta({
  layout: "editor",
  middleware: ["auth", "editor"]
})

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

onMounted(() => { fetchJobs() })

const filteredJobs = computed(() => {
  if (selectedStatusFilter.value === "all") return jobs.value
  return jobs.value.filter(j => j.orderStatus === selectedStatusFilter.value)
})

const filterOptions = computed(() => [
  { key: "all",               label: "ทั้งหมด",          count: jobs.value.length },
  { key: "waiting_to_start",  label: "รอเริ่มงาน",        count: jobs.value.filter(j => j.orderStatus === "waiting_to_start").length },
  { key: "in_progress",       label: "กำลังดำเนินงาน",    count: jobs.value.filter(j => j.orderStatus === "in_progress").length },
  { key: "waiting_selection", label: "รอเลือกรูปภาพ",     count: jobs.value.filter(j => j.orderStatus === "waiting_selection").length },
  { key: "completed",         label: "เสร็จสมบูรณ์",      count: jobs.value.filter(j => j.orderStatus === "completed").length }
])

const tableColumns = [
  { key: "orderId",            label: "เลขที่คำสั่งงาน" },
  { key: "workTypeName",       label: "ประเภทงาน" },
  { key: "packageName",        label: "แพ็กเกจ" },
  { key: "orderRequiredDate",  label: "กำหนดส่งงาน" },
  { key: "orderTotalPrice",    label: "ราคารวม" },
  { key: "orderStatus",        label: "สถานะ" },
  { key: "action",             label: "การจัดการ", align: "center" as const }
]

const tableRows = computed(() =>
  filteredJobs.value.map(j => ({
    orderId:           j.orderId,
    workTypeName:      j.workTypeName,
    packageName:       j.packageName,
    orderRequiredDate: j.orderRequiredDate,
    orderTotalPrice:   j.orderTotalPrice,
    orderStatus:       j.orderStatus
  }))
)

const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 })

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-"
  return new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric", month: "long", day: "numeric"
  })
}

const breadcrumb = [
  { label: "หน้าแรก", to: "/editor/dashboard" },
  { label: "ประวัติการทำงาน" }
]
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">ประวัติการทำงาน</h1>
        <p class="mt-0.5 text-sm text-gray-500">เรียกดูประวัติและสรุปผลงานทั้งหมดที่ได้รับมอบหมายในระบบ</p>
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
    <div v-if="loading" class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-6 py-3 border-b border-gray-100 h-12 animate-pulse bg-gray-50" />
      <div class="divide-y divide-gray-50">
        <div v-for="i in 5" :key="i" class="px-6 py-4 h-14 animate-pulse" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="bg-white border border-red-200 rounded-xl p-6 text-center">
      <p class="text-sm text-red-600 font-medium">{{ error }}</p>
      <button @click="fetchJobs" class="mt-3 text-xs text-gray-500 hover:text-gray-700 underline">
        ลองโหลดใหม่
      </button>
    </div>

    <!-- Table Card -->
    <template v-else>
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <!-- Filter bar -->
        <div class="px-6 py-3 border-b border-gray-100 overflow-x-auto">
          <AdminFilterBar v-model="selectedStatusFilter" :filters="filterOptions" />
        </div>

        <!-- Data table -->
        <AdminDataTable :columns="tableColumns" :rows="tableRows" row-key="orderId">
          <!-- Order ID -->
          <template #cell-orderId="{ value }">
            <span class="font-mono text-xs font-semibold text-gray-900">#{{ value }}</span>
          </template>

          <!-- Work type -->
          <template #cell-workTypeName="{ value }">
            <span class="text-sm text-gray-700">{{ value }}</span>
          </template>

          <!-- Package -->
          <template #cell-packageName="{ value }">
            <span class="text-xs text-gray-500">{{ value }}</span>
          </template>

          <!-- Date -->
          <template #cell-orderRequiredDate="{ value }">
            <span class="text-xs text-gray-500">{{ formatDate(value) }}</span>
          </template>

          <!-- Price -->
          <template #cell-orderTotalPrice="{ value }">
            <span class="text-sm font-bold text-gray-900">฿{{ formatPrice(value) }}</span>
          </template>

          <!-- Status -->
          <template #cell-orderStatus="{ value }">
            <AdminStatusBadge :status="value" />
          </template>

          <!-- Action -->
          <template #cell-action="{ row }">
            <NuxtLink :to="`/editor/jobs/${row.orderId}`">
              <AdminActionButton variant="ghost" size="sm">
                เข้าทำงาน
              </AdminActionButton>
            </NuxtLink>
          </template>
        </AdminDataTable>

        <!-- Empty state inside table -->
        <AdminEmptyState
          v-if="tableRows.length === 0"
          title="ไม่พบข้อมูลงาน"
          description="คุณไม่มีประวัติงานแต่งภาพในหมวดหมู่นี้"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </div>
    </template>
  </div>
</template>
