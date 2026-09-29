<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { orderService } from '~/services/order.service'
import type { OrderSummary } from '~/types/order.types'

definePageMeta({ layout: 'editor', middleware: ['auth', 'editor'] })

const jobs = ref<OrderSummary[]>([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('pending')

const fetchJobs = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await orderService.getMyOrders(1, 1000)
    jobs.value = res.data || []
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลรายการงานได้'
  } finally {
    loading.value = false
  }
}

onMounted(fetchJobs)

const stats = computed(() => ({
  toStart: jobs.value.filter(job => job.orderStatus === 'waiting_to_start').length,
  inProgress: jobs.value.filter(job => job.orderStatus === 'in_progress').length,
  completed: jobs.value.filter(job => ['waiting_selection', 'waiting_final_payment', 'delivered', 'completed'].includes(job.orderStatus)).length
}))

const statCards = computed(() => [
  { label: 'งานรอดำเนินการ', value: stats.value.toStart, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { label: 'กำลังแต่งภาพ', value: stats.value.inProgress, icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { label: 'ส่งงาน/เสร็จสิ้นแล้ว', value: stats.value.completed, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
])

const filterOptions = computed(() => [
  { key: 'pending', label: 'รอดำเนินการ', count: stats.value.toStart },
  { key: 'progress', label: 'กำลังทำ', count: stats.value.inProgress },
  { key: 'completed', label: 'ส่งงานแล้ว', count: stats.value.completed },
  { key: 'all', label: 'ทั้งหมด', count: jobs.value.length }
])

const filteredJobs = computed(() => {
  if (statusFilter.value === 'pending') return jobs.value.filter(job => job.orderStatus === 'waiting_to_start')
  if (statusFilter.value === 'progress') return jobs.value.filter(job => job.orderStatus === 'in_progress')
  if (statusFilter.value === 'completed') return jobs.value.filter(job => ['waiting_selection', 'waiting_final_payment', 'delivered', 'completed'].includes(job.orderStatus))
  return jobs.value
})

const statusLabels: Record<string, string> = {
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

const getStatusClasses = (status: string) => {
  if (status === 'in_progress') return 'bg-gray-800 text-white border-gray-800'
  if (['delivered', 'completed'].includes(status)) return 'bg-black text-white border-black'
  if (status === 'cancelled') return 'bg-white text-red-600 border-red-200'
  return 'bg-gray-100 text-gray-600 border-gray-200'
}

const formatPrice = (value: number) => Number(value).toLocaleString('th-TH', { minimumFractionDigits: 2 })
const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
const breadcrumb = [{ label: 'หน้าแรก', to: '/editor/dashboard' }, { label: 'แดชบอร์ด' }]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-2xl sm:text-3xl font-semibold text-[#171717] tracking-tight">
          แดชบอร์ด
        </h1>
        <p class="mt-1 text-sm font-medium text-[#666666]">
          ภาพรวมงานที่ได้รับมอบหมายและงานที่กำลังดำเนินการ
        </p>
      </div>
      <button
        class="px-4 py-2 rounded-full border border-black/[0.06] bg-white text-[13px] font-medium text-[#171717] hover:bg-[#F7F7F5] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
        :disabled="loading"
        @click="fetchJobs"
      >
        <svg
          class="w-4 h-4"
          :class="loading ? 'animate-spin' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        /></svg>
        รีเฟรช
      </button>
    </div>

    <template v-if="loading">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="index in 3"
          :key="index"
          class="bg-white border border-[#EFEFEA]/60 rounded-2xl p-5 h-[120px] animate-pulse"
        />
      </div>
      <div class="bg-white border border-[#EFEFEA]/60 rounded-[24px] h-80 animate-pulse" />
    </template>

    <div
      v-else-if="error"
      class="bg-white border border-red-100 rounded-2xl p-6 text-center"
    >
      <p class="text-sm text-red-600 font-medium">
        {{ error }}
      </p>
      <button
        class="mt-3 text-xs text-[#929292] hover:text-[#171717] underline"
        @click="fetchJobs"
      >
        ลองโหลดใหม่
      </button>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="card in statCards"
          :key="card.label"
          class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[120px] hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] hover:border-black/10 transition-all duration-300"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-semibold text-[#666666] tracking-wide">{{ card.label }}</span>
            <div class="w-8 h-8 rounded-full bg-[#F7F7F5] flex items-center justify-center text-[#171717] flex-shrink-0 border border-black/[0.03]">
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              ><path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="card.icon"
              /></svg>
            </div>
          </div>
          <span class="text-3xl font-bold text-[#171717] tracking-tight">{{ card.value }}</span>
        </div>
      </div>

      <div class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden">
        <div class="px-6 py-5 border-b border-black/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-[#171717] tracking-tight">
              รายการงานของฉัน
            </h2>
            <p class="text-[13px] font-medium text-[#666666] mt-0.5">
              ติดตามสถานะและเข้าสู่ห้องทำงานของงานที่ได้รับมอบหมาย
            </p>
          </div>
          <NuxtLink
            to="/editor/jobs"
            class="px-4 py-2 rounded-lg border border-black/[0.06] bg-white text-[12px] font-medium text-[#171717] hover:bg-[#F7F7F5] transition-colors shadow-sm"
          >ดูงานทั้งหมด</NuxtLink>
        </div>

        <div class="px-6 py-3 border-b border-black/[0.06] overflow-x-auto bg-[#FDFDFB]/50">
          <AdminFilterBar
            v-model="statusFilter"
            :filters="filterOptions"
          />
        </div>

        <AdminEmptyState
          v-if="filteredJobs.length === 0"
          title="ไม่มีรายการงาน"
          description="ไม่มีงานที่ตรงกับตัวกรองที่เลือกในขณะนี้"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />

        <div
          v-else
          class="overflow-x-auto"
        >
          <table class="w-full text-left border-collapse min-w-[780px]">
            <thead>
              <tr class="bg-[#F7F7F5]/80 border-b border-black/[0.06]">
                <th class="px-6 py-3 text-[11px] font-semibold text-[#666666] tracking-wider whitespace-nowrap">
                  เลขที่งาน
                </th>
                <th class="px-6 py-3 text-[11px] font-semibold text-[#666666] tracking-wider whitespace-nowrap">
                  ประเภทงาน
                </th>
                <th class="px-6 py-3 text-[11px] font-semibold text-[#666666] tracking-wider whitespace-nowrap">
                  แพ็กเกจ
                </th>
                <th class="px-6 py-3 text-[11px] font-semibold text-[#666666] tracking-wider whitespace-nowrap">
                  กำหนดส่ง
                </th>
                <th class="px-6 py-3 text-[11px] font-semibold text-[#666666] tracking-wider whitespace-nowrap">
                  สถานะ
                </th>
                <th class="px-6 py-3 text-right text-[11px] font-semibold text-[#666666] tracking-wider whitespace-nowrap">
                  ดำเนินการ
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="job in filteredJobs"
                :key="job.orderId"
                class="border-b border-black/[0.04] last:border-0 hover:bg-[#FDFDFB] transition-colors"
              >
                <td class="px-6 py-4 font-mono text-[13px] font-semibold text-[#171717]">
                  #{{ job.orderId }}
                </td>
                <td class="px-6 py-4 text-[13px] font-medium text-[#171717]">
                  {{ job.workTypeName }}
                </td>
                <td class="px-6 py-4">
                  <p class="text-[13px] text-[#666666]">
                    {{ job.packageName }}
                  </p><p class="mt-0.5 text-[11px] text-[#929292]">
                    ฿{{ formatPrice(job.orderTotalPrice) }}
                  </p>
                </td>
                <td class="px-6 py-4 text-xs text-[#666666] whitespace-nowrap">
                  {{ formatDate(job.orderRequiredDate) }}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap"
                    :class="getStatusClasses(job.orderStatus)"
                  >{{ statusLabels[job.orderStatus] ?? job.orderStatus }}</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <NuxtLink
                    :to="`/editor/jobs/${job.orderId}`"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors shadow-sm"
                  >เข้าทำงาน <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  /></svg></NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
