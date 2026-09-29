<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { orderService } from '~/services/order.service'
import type { OrderSummary } from '~/types/order.types'
import Pagination from '~/components/ui/Pagination.vue'

definePageMeta({
  layout: 'editor',
  middleware: ['auth', 'editor']
})

const route = useRoute()
const router = useRouter()

const jobs = ref<OrderSummary[]>([])
const loading = ref(true)
const error = ref('')
const selectedStatusFilter = ref<string>((route.query.status as string) || 'all')
const currentPage = ref(1)
const totalPages = ref(1)
const totalRecords = ref(0)
const limit = 10

const fetchJobs = async (page = 1) => {
  loading.value = true
  error.value = ''
  try {
    const statusQuery = selectedStatusFilter.value !== 'all' ? selectedStatusFilter.value : undefined
    const response = await orderService.getMyOrders(page, limit, statusQuery)
    jobs.value = response.data || []
    currentPage.value = response.page || 1
    totalPages.value = response.totalPages || 1
    totalRecords.value = response.total || 0
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลประวัติงานได้'
  } finally {
    loading.value = false
  }
}

watch(selectedStatusFilter, (newStatus) => {
  router.replace({
    query: { ...route.query, status: newStatus === 'all' ? undefined : newStatus }
  })
  currentPage.value = 1
  fetchJobs(1)
})

onMounted(() => fetchJobs())

const handlePageChange = (page: number) => fetchJobs(page)

const filterOptions = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'waiting_to_start', label: 'รอเริ่มงาน' },
  { key: 'in_progress', label: 'กำลังดำเนินการ' },
  { key: 'waiting_selection', label: 'รอเลือกผลงาน' },
  { key: 'completed', label: 'เสร็จสมบูรณ์' }
]

const tableColumns = [
  { key: 'orderId', label: 'เลขที่คำสั่งงาน' },
  { key: 'workTypeName', label: 'ประเภทงาน' },
  { key: 'packageName', label: 'แพ็กเกจ' },
  { key: 'orderRequiredDate', label: 'กำหนดส่งงาน' },
  { key: 'orderTotalPrice', label: 'ราคารวม', align: 'right' as const },
  { key: 'orderStatus', label: 'สถานะ' },
  { key: 'action', label: 'การจัดการ', align: 'center' as const }
]

const tableRows = computed(() => jobs.value.map(job => ({
  orderId: job.orderId,
  workTypeName: job.workTypeName,
  packageName: job.packageName,
  orderRequiredDate: job.orderRequiredDate,
  orderTotalPrice: job.orderTotalPrice,
  orderStatus: job.orderStatus
})))

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

const formatPrice = (value: number) => `฿${Number(value).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`
const formatDate = (date: string) => date
  ? new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })
  : '—'

const breadcrumb = [
  { label: 'หน้าแรก', to: '/editor/dashboard' },
  { label: 'งานที่ได้รับมอบหมาย' }
]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <AdminBreadcrumb :items="breadcrumb" />
      <button
        class="px-4 py-2 rounded-full border border-black/[0.06] bg-white text-[13px] font-medium text-[#171717] hover:bg-[#F7F7F5] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
        :disabled="loading"
        @click="fetchJobs()"
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

    <div class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
      <div class="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-[#171717] tracking-tight">
            งานที่ได้รับมอบหมายทั้งหมด
          </h2>
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">
            ติดตามและจัดการคำสั่งงานที่ได้รับมอบหมาย
          </p>
        </div>
      </div>

      <div class="px-4 sm:px-6 pb-4 border-b border-black/[0.06] overflow-x-auto">
        <AdminFilterBar
          v-model="selectedStatusFilter"
          :filters="filterOptions"
        />
      </div>

      <div
        v-if="error"
        class="p-12 text-center"
      >
        <p class="text-sm text-red-600 font-medium">
          {{ error }}
        </p>
        <button
          class="mt-2 text-xs text-[#929292] underline hover:text-[#171717]"
          @click="fetchJobs()"
        >
          ลองใหม่
        </button>
      </div>

      <div
        v-else
        class="flex flex-col flex-1"
      >
        <div class="overflow-x-auto bg-[#FDFDFB]/30 editor-jobs-table-scope">
          <AdminDataTable
            :columns="tableColumns"
            :rows="tableRows"
            :loading="loading"
            row-key="orderId"
          >
            <template #cell-orderId="{ value }">
              <span class="font-mono text-xs font-semibold text-[#171717]">#{{ value }}</span>
            </template>

            <template #cell-workTypeName="{ value }">
              <span class="text-[13px] font-medium text-[#171717]">{{ value ?? '—' }}</span>
            </template>

            <template #cell-packageName="{ value }">
              <span class="text-xs text-[#666666]">{{ value ?? '—' }}</span>
            </template>

            <template #cell-orderRequiredDate="{ value }">
              <span class="text-xs text-[#929292] whitespace-nowrap">{{ formatDate(value) }}</span>
            </template>

            <template #cell-orderTotalPrice="{ value }">
              <span class="text-[13px] font-bold text-[#171717] font-number whitespace-nowrap">{{ formatPrice(value) }}</span>
            </template>

            <template #cell-orderStatus="{ value }">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap"
                :class="{
                  'bg-[#171717] text-white border-[#171717] shadow-sm': value === 'completed' || value === 'delivered',
                  'bg-[#FFF5F5] text-[#C53030] border-[#FEB2B2]': value === 'cancelled',
                  'bg-[#F7F7F5] text-[#666666] border-black/[0.06]': value !== 'completed' && value !== 'delivered' && value !== 'cancelled'
                }"
              >
                {{ statusLabels[value] ?? value }}
              </span>
            </template>

            <template #cell-action="{ row }">
              <NuxtLink
                :to="`/editor/jobs/${row.orderId}`"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors shadow-sm whitespace-nowrap"
              >
                เข้าทำงาน
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                /></svg>
              </NuxtLink>
            </template>
          </AdminDataTable>
        </div>

        <AdminEmptyState
          v-if="!loading && tableRows.length === 0"
          title="ไม่มีรายการงาน"
          description="ไม่มีงานที่ตรงกับสถานะที่เลือกในขณะนี้"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />

        <div
          v-if="!loading && tableRows.length > 0"
          class="px-6 py-4 border-t border-black/[0.06] flex items-center justify-between bg-[#FDFDFB]/50"
        >
          <div class="hidden sm:block text-xs text-[#666666]">
            <span class="font-bold text-[#171717]">{{ ((currentPage - 1) * limit) + 1 }}</span>–<span class="font-bold text-[#171717]">{{ Math.min(currentPage * limit, totalRecords) }}</span> จาก <span class="font-bold text-[#171717]">{{ totalRecords }}</span> รายการ
          </div>
          <Pagination
            class="!border-0 !shadow-none !mt-0 !rounded-none !p-0 !bg-transparent flex-1 sm:flex-initial"
            :current-page="currentPage"
            :total-pages="totalPages"
            :total="totalRecords"
            :limit="limit"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(p.text-sm.text-gray-700) {
  display: none !important;
}

.editor-jobs-table-scope :deep(.rounded-xl) {
  border-radius: 0 !important;
  border-color: rgba(0, 0, 0, 0.06) !important;
}

.editor-jobs-table-scope :deep(thead.bg-gray-50) {
  background-color: rgba(247, 247, 245, 0.8) !important;
  border-bottom-color: rgba(0, 0, 0, 0.06) !important;
}

.editor-jobs-table-scope :deep(tbody.bg-white tr:hover) {
  background-color: #FDFDFB !important;
}

.editor-jobs-table-scope :deep(tbody.bg-white.divide-gray-100 > tr) {
  border-color: rgba(0, 0, 0, 0.04) !important;
}
</style>
