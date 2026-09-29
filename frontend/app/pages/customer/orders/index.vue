<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { orderService } from '~/services/order.service'
import type { OrderSummary, OrderStatus } from '~/types/order.types'
import Pagination from '~/components/ui/Pagination.vue'

const token = useCookie<string | null>('token')
const router = useRouter()

definePageMeta({
  layout: 'customer',
  middleware: ['auth', 'customer']
})

type StatusConfig = {
  label: string
  tone: string
  progress: number
  actionLabel: string
}

type FilterGroup = {
  value: string
  label: string
  statuses: OrderStatus[]
}

const orders = ref<OrderSummary[]>([])
const loading = ref(true)
const error = ref('')
const selectedGroup = ref('all')
const searchQuery = ref('')

const currentPage = ref(1)
const totalPages = ref(1)
const totalRecords = ref(0)
const limit = 10

const activeStatuses: OrderStatus[] = ['waiting_assignment', 'waiting_to_start', 'in_progress']
const actionStatuses: OrderStatus[] = ['waiting_deposit', 'waiting_selection', 'waiting_final_payment']
const doneStatuses: OrderStatus[] = ['delivered', 'completed']

const statusMeta: Record<OrderStatus, StatusConfig> = {
  waiting_deposit: { label: 'รอชำระมัดจำ', tone: 'text-[#9A6812]', progress: 12, actionLabel: 'ชำระมัดจำ' },
  waiting_assignment: { label: 'รอจัดหาคนรับงาน', tone: 'text-[#3566B8]', progress: 24, actionLabel: 'ดูรายละเอียด' },
  waiting_to_start: { label: 'รอเริ่มงาน', tone: 'text-[#3566B8]', progress: 34, actionLabel: 'ดูรายละเอียด' },
  in_progress: { label: 'กำลังดำเนินการ', tone: 'text-[#675DDC]', progress: 52, actionLabel: 'ดูรายละเอียด' },
  waiting_selection: { label: 'รอคัดเลือกภาพ', tone: 'text-[#A34F22]', progress: 68, actionLabel: 'เลือกผลงาน' },
  waiting_final_payment: { label: 'รอชำระส่วนที่เหลือ', tone: 'text-[#9A6812]', progress: 82, actionLabel: 'ชำระยอดคงเหลือ' },
  delivered: { label: 'ส่งมอบงานแล้ว', tone: 'text-[#267A48]', progress: 94, actionLabel: 'ตรวจรับงาน' },
  completed: { label: 'เสร็จสมบูรณ์', tone: 'text-[#267A48]', progress: 100, actionLabel: 'ดูรายละเอียด' },
  cancelled: { label: 'ยกเลิกออเดอร์', tone: 'text-[#B93B3B]', progress: 0, actionLabel: 'ดูรายละเอียด' }
}

const filterGroups: FilterGroup[] = [
  { value: 'all', label: 'ทั้งหมด', statuses: [] },
  { value: 'active', label: 'กำลังดำเนินการ', statuses: activeStatuses },
  { value: 'action', label: 'รอคุณดำเนินการ', statuses: actionStatuses },
  { value: 'done', label: 'ส่งมอบ/เสร็จสิ้น', statuses: doneStatuses },
  { value: 'cancelled', label: 'ยกเลิก', statuses: ['cancelled'] }
]

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

const fetchOrders = async (page = 1) => {
  loading.value = true
  error.value = ''
  try {
    const res = await orderService.getMyOrders(page, limit)
    orders.value = res.data || []
    currentPage.value = res.page || 1
    totalPages.value = res.totalPages || 1
    totalRecords.value = res.total || 0
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'ไม่สามารถดึงข้อมูลรายการออเดอร์ได้')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!token.value) {
    router.push('/login')
    return
  }
  fetchOrders()
})

const handlePageChange = (page: number) => {
  fetchOrders(page)
}

watch(selectedGroup, () => {
  searchQuery.value = ''
})

const getStatusMeta = (status: OrderStatus) => statusMeta[status] || statusMeta.waiting_deposit

const getProgressFillClass = (status: OrderStatus) => {
  if (actionStatuses.includes(status)) return 'bg-[#9A6812]'
  if (status === 'in_progress') return 'bg-[#756CE8]'
  if (status === 'waiting_assignment' || status === 'waiting_to_start') return 'bg-[#3566B8]'
  if (doneStatuses.includes(status)) return 'bg-[#267A48]'
  if (status === 'cancelled') return 'bg-[#B93B3B]'
  return 'bg-[#666666]'
}

const getActionCtaClass = (status: OrderStatus) => {
  if (['waiting_deposit', 'waiting_final_payment', 'waiting_selection', 'delivered'].includes(status)) {
    return 'border-transparent bg-[#171717] text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] group-hover:bg-black group-hover:shadow-md'
  }
  return 'border-black/10 bg-white/60 text-[#171717] group-hover:border-black/20 group-hover:bg-white'
}

const getGroupCount = (group: FilterGroup) => {
  if (group.value === 'all') return orders.value.length
  return orders.value.filter(order => group.statuses.includes(order.orderStatus)).length
}

const filteredOrders = computed(() => {
  const group = filterGroups.find(item => item.value === selectedGroup.value) || filterGroups[0]
  const query = searchQuery.value.trim().toLowerCase()

  return orders.value.filter((order) => {
    const inGroup = group.value === 'all' || group.statuses.includes(order.orderStatus)
    if (!inGroup) return false
    if (!query) return true

    const statusLabel = getStatusMeta(order.orderStatus).label
    return [
      String(order.orderId),
      `coos-${Math.abs(order.orderId)}`,
      order.workTypeName,
      order.packageName,
      statusLabel
    ].some(value => value.toLowerCase().includes(query))
  })
})

const summaryCards = computed(() => [
  { label: 'งานทั้งหมด', value: orders.value.length },
  { label: 'กำลังดำเนินการ', value: orders.value.filter(order => activeStatuses.includes(order.orderStatus)).length },
  { label: 'รอคุณดำเนินการ', value: orders.value.filter(order => actionStatuses.includes(order.orderStatus)).length },
  { label: 'ส่งมอบ/เสร็จสิ้น', value: orders.value.filter(order => doneStatuses.includes(order.orderStatus)).length },
  { label: 'ยกเลิก', value: orders.value.filter(order => order.orderStatus === 'cancelled').length }
])

const hasClientFilter = computed(() => selectedGroup.value !== 'all' || searchQuery.value.trim().length > 0)

const formatPrice = (n: number) =>
  Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const clearFilters = () => {
  selectedGroup.value = 'all'
  searchQuery.value = ''
}
</script>

<template>
  <div class="mx-auto w-full max-w-[1280px] py-6 sm:py-8 lg:py-10">
    <!-- Subtle Grid background -->
    <div class="dashboard-grid pointer-events-none fixed inset-0 z-0" />

    <div class="relative z-10">
      <!-- Header -->
      <div class="mb-6 rounded-[24px] border border-black/5 bg-white/40 p-6 backdrop-blur-xl sm:p-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-[#929292]">
              MY ORDERS
            </p>
            <h1 class="text-3xl font-semibold leading-tight text-[#171717]">
              งานของฉัน
            </h1>
            <p class="mt-2 text-[15px] font-medium text-[#666666]">
              ติดตามสถานะคำสั่งงาน ชำระเงิน เลือกผลงาน และเปิดรายละเอียดงานทั้งหมดของคุณ
            </p>
          </div>
          <NuxtLink
            to="/customer/orders/create"
            class="inline-flex h-11 items-center justify-center rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            สั่งงานใหม่
          </NuxtLink>
        </div>
      </div>

      <!-- Filter + Search Toolbar -->
      <div class="mb-6 flex flex-col gap-4 rounded-[20px] border border-black/5 bg-white/60 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-xl xl:flex-row xl:items-center xl:justify-between">
        <div class="flex max-w-full min-w-0 gap-2 overflow-x-auto pb-1 xl:overflow-visible xl:pb-0 hide-scrollbar">
          <button
            v-for="group in filterGroups"
            :key="group.value"
            class="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition"
            :class="selectedGroup === group.value
              ? 'bg-[#171717] text-white shadow-md'
              : 'border border-black/[0.04] bg-white/80 text-[#666666] hover:border-black/10 hover:bg-white hover:text-[#171717]'"
            @click="selectedGroup = group.value"
          >
            <span>{{ group.label }}</span>
            <span
              class="rounded-full px-2 py-0.5 text-[11px] font-bold"
              :class="selectedGroup === group.value ? 'bg-white/20 text-white' : 'bg-[#F3F3F1] text-[#929292]'"
            >
              {{ getGroupCount(group) }}
            </span>
          </button>
        </div>
        <div class="flex w-full max-w-full min-w-0 items-center gap-2 rounded-xl border border-black/5 bg-white/80 px-4 py-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)] transition-colors focus-within:border-black/10 focus-within:bg-white xl:w-[320px] xl:shrink-0">
          <svg class="h-4 w-4 shrink-0 text-[#929292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35m1.35-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            class="w-full bg-transparent text-[13px] font-medium text-[#171717] outline-none placeholder:text-[#929292]"
            placeholder="ค้นหาเลขงาน ประเภทงาน แพ็กเกจ"
          >
        </div>
      </div>

      <div class="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
        <!-- Main Order List -->
        <main class="min-w-0 self-start rounded-[24px] border border-black/5 bg-white/40 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-xl sm:p-8">
          <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-[20px] font-semibold leading-tight text-[#171717]">
                รายการงาน
              </h2>
              <p class="mt-1 text-[13px] font-medium text-[#666666]">
                แสดง {{ filteredOrders.length }} รายการจากข้อมูลคำสั่งงานที่โหลดอยู่
              </p>
            </div>
            <button
              v-if="hasClientFilter"
              class="self-start rounded-xl border border-black/10 bg-white/60 px-3.5 py-2 text-xs font-semibold text-[#171717] transition hover:border-black/20 hover:bg-white sm:self-auto"
              @click="clearFilters"
            >
              ล้างตัวกรอง
            </button>
          </div>

          <div v-if="loading" class="space-y-4">
            <div v-for="idx in 5" :key="idx" class="h-24 animate-pulse rounded-[16px] border border-black/[0.04] bg-white/50" />
          </div>

          <div v-else-if="error" class="rounded-[16px] border border-black/[0.04] bg-[#FDEEEE]/80 p-6 text-center backdrop-blur-sm">
            <p class="text-sm font-semibold text-[#B93B3B]">
              เกิดข้อผิดพลาด
            </p>
            <p class="mt-1 text-[13px] font-medium text-[#B93B3B]">
              {{ error }}
            </p>
            <button class="mt-4 h-11 rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white transition hover:bg-black" @click="() => fetchOrders(currentPage)">
              โหลดอีกครั้ง
            </button>
          </div>

          <div v-else-if="filteredOrders.length === 0" class="rounded-[16px] border border-dashed border-black/10 bg-[#f8f8f8]/50 p-10 text-center">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#171717] shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)]">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            </div>
            <h3 class="text-[15px] font-semibold text-[#171717]">
              ไม่มีงานในรายการนี้
            </h3>
            <p class="mx-auto mt-1.5 max-w-md text-[13px] font-medium leading-relaxed text-[#666666]">
              ลองล้างตัวกรองหรือเริ่มสร้างคำสั่งงานใหม่ แล้วงานของคุณจะแสดงที่นี่
            </p>
            <div class="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
              <button v-if="hasClientFilter" class="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white/60 px-[18px] text-sm font-semibold text-[#171717] transition hover:border-black/20 hover:bg-white" @click="clearFilters">
                ล้างตัวกรอง
              </button>
              <NuxtLink to="/customer/orders/create" class="inline-flex h-11 items-center justify-center rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-md transition hover:bg-black">
                สั่งงานแรกของคุณ
              </NuxtLink>
            </div>
          </div>

          <div v-else class="space-y-4">
            <NuxtLink
              v-for="order in filteredOrders"
              :key="order.orderId"
              :to="`/customer/orders/${order.orderId}`"
              class="group grid min-w-0 gap-4 rounded-[16px] border border-black/5 bg-white/80 p-4 transition duration-200 hover:-translate-y-px hover:border-black/10 hover:bg-white hover:shadow-md sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center"
            >
              <!-- Thumbnail icon -->
              <div class="relative hidden sm:flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-[14px] bg-[#f8f8f8] text-[#171717] shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)]">
                <svg class="h-6 w-6 text-[#171717]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.5-4.5a2 2 0 012.8 0L16 16m-2-2l1.5-1.5a2 2 0 012.8 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              <div class="min-w-0">
                <div class="mb-1 flex flex-wrap items-baseline gap-2.5">
                  <h3 class="truncate text-[15px] font-bold text-[#171717] group-hover:text-black">
                    #COOS-{{ Math.abs(order.orderId) }}
                  </h3>
                  <span class="text-[11px] font-bold uppercase tracking-wider" :class="getStatusMeta(order.orderStatus).tone">
                    {{ getStatusMeta(order.orderStatus).label }}
                  </span>
                </div>
                <p class="text-[13px] font-medium text-[#666666]">
                  {{ order.workTypeName }} · {{ order.packageName }} · ส่งงาน {{ formatDate(order.orderRequiredDate) }}
                </p>
                <div class="mt-2.5 flex items-center gap-3">
                  <div class="h-1 flex-1 overflow-hidden rounded-full bg-black/5">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="getProgressFillClass(order.orderStatus)"
                      :style="{ width: `${getStatusMeta(order.orderStatus).progress}%` }"
                    />
                  </div>
                  <span class="min-w-[40px] text-right text-[11px] font-bold text-[#929292]">
                    {{ getStatusMeta(order.orderStatus).progress }}%
                  </span>
                </div>
              </div>

              <div class="flex min-w-0 items-center justify-between gap-4 sm:min-w-[120px] sm:flex-col sm:items-end sm:gap-2">
                <div class="text-left sm:text-right">
                  <p class="text-[15px] font-semibold text-[#171717]">
                    ฿{{ formatPrice(order.orderTotalPrice) }}
                  </p>
                  <p class="text-[11px] font-medium text-[#929292]">
                    ราคาสุทธิ
                  </p>
                </div>
                <span class="inline-flex h-9 items-center justify-center rounded-lg border px-3.5 text-[12px] font-semibold transition" :class="getActionCtaClass(order.orderStatus)">
                  {{ getStatusMeta(order.orderStatus).actionLabel }}
                </span>
              </div>
            </NuxtLink>
          </div>

          <Pagination
            v-if="!loading && !error && filteredOrders.length > 0 && !hasClientFilter"
            :current-page="currentPage"
            :total-pages="totalPages"
            :total="totalRecords"
            :limit="limit"
            @page-change="handlePageChange"
          />
        </main>

        <!-- Right Summary Sidebar -->
        <aside class="min-w-0 space-y-6">
          <section class="rounded-[24px] border border-black/5 bg-white/40 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-xl sm:p-8">
            <div class="mb-5">
              <h2 class="text-[20px] font-semibold leading-tight text-[#171717]">
                สรุปงานของฉัน
              </h2>
              <p class="mt-1 text-[13px] font-medium text-[#666666]">
                ตัวเลขจากรายการคำสั่งงานจริง
              </p>
            </div>
            <div class="space-y-3">
              <div
                v-for="item in summaryCards"
                :key="item.label"
                class="flex items-center justify-between rounded-[16px] border border-black/5 bg-white/80 px-4 py-3.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
              >
                <span class="text-[13px] font-medium text-[#666666]">{{ item.label }}</span>
                <span class="text-[17px] font-bold text-[#171717]">{{ item.value }}</span>
              </div>
            </div>
          </section>

          <section class="rounded-[24px] border border-black/5 bg-white/40 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-xl sm:p-8">
            <p class="text-[20px] font-semibold leading-tight text-[#171717]">
              พร้อมสร้างงานใหม่?
            </p>
            <p class="mt-2 text-[13px] font-medium leading-relaxed text-[#666666]">
              เลือกบริการและส่งรายละเอียดงานใหม่ได้จากแบบฟอร์มเดิมของระบบ
            </p>
            <NuxtLink
              to="/customer/orders/create"
              class="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[#171717] px-[18px] text-[14px] font-semibold text-white shadow-md transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              สั่งงานใหม่
            </NuxtLink>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  background-size: 48px 48px;
  background-image: linear-gradient(to right, rgba(20, 20, 20, 0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(20, 20, 20, 0.05) 1px, transparent 1px);
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
