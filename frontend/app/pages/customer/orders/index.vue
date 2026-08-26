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
  waiting_deposit: {
    label: 'รอชำระมัดจำ',
    tone: 'bg-[#FFF7E6] text-[#9A6812] border-[#FFF7E6]',
    progress: 12,
    actionLabel: 'ชำระมัดจำ'
  },
  waiting_assignment: {
    label: 'รอจัดหาคนรับงาน',
    tone: 'bg-[#EDF3FF] text-[#3566B8] border-[#EDF3FF]',
    progress: 24,
    actionLabel: 'ดูรายละเอียด'
  },
  waiting_to_start: {
    label: 'รอเริ่มงาน',
    tone: 'bg-[#EDF3FF] text-[#3566B8] border-[#EDF3FF]',
    progress: 34,
    actionLabel: 'ดูรายละเอียด'
  },
  in_progress: {
    label: 'กำลังดำเนินการ',
    tone: 'bg-[#F0EEFF] text-[#675DDC] border-[#F0EEFF]',
    progress: 52,
    actionLabel: 'ดูรายละเอียด'
  },
  waiting_selection: {
    label: 'รอคัดเลือกภาพ',
    tone: 'bg-[#FFF1E9] text-[#A34F22] border-[#FFF1E9]',
    progress: 68,
    actionLabel: 'เลือกผลงาน'
  },
  waiting_final_payment: {
    label: 'รอชำระส่วนที่เหลือ',
    tone: 'bg-[#FFF7E6] text-[#9A6812] border-[#FFF7E6]',
    progress: 82,
    actionLabel: 'ชำระยอดคงเหลือ'
  },
  delivered: {
    label: 'ส่งมอบงานแล้ว',
    tone: 'bg-[#EDF8F1] text-[#267A48] border-[#EDF8F1]',
    progress: 94,
    actionLabel: 'ตรวจรับงาน'
  },
  completed: {
    label: 'เสร็จสมบูรณ์',
    tone: 'bg-[#EDF8F1] text-[#267A48] border-[#EDF8F1]',
    progress: 100,
    actionLabel: 'ดูรายละเอียด'
  },
  cancelled: {
    label: 'ยกเลิกออเดอร์',
    tone: 'bg-[#FDEEEE] text-[#B93B3B] border-[#FDEEEE]',
    progress: 0,
    actionLabel: 'ดูรายละเอียด'
  }
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
  return 'bg-[#666666]'
}

const getActionCtaClass = (status: OrderStatus) => {
  if (['waiting_deposit', 'waiting_final_payment'].includes(status)) {
    return 'border-[#FFF7E6] bg-[#FFF7E6] text-[#9A6812] group-hover:border-[#9A6812]/20 group-hover:bg-[#FFF7E6]'
  }
  if (status === 'waiting_selection') {
    return 'border-[#FFF1E9] bg-[#FFF1E9] text-[#A34F22] group-hover:border-[#A34F22]/20 group-hover:bg-[#FFF1E9]'
  }
  if (status === 'delivered') {
    return 'border-[#EDF8F1] bg-[#EDF8F1] text-[#267A48] group-hover:border-[#267A48]/20 group-hover:bg-[#EDF8F1]'
  }
  return 'border-black/[0.08] bg-white text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.03)] group-hover:bg-[#171717] group-hover:text-white'
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
    <section class="relative overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] sm:p-8">
      <div class="pointer-events-none absolute -right-20 -top-24 h-64 w-80 rounded-full bg-[#EDF3FF]/70 blur-[56px]" />
      <div class="pointer-events-none absolute right-28 top-8 hidden h-44 w-44 rounded-full bg-[#F0EEFF]/70 blur-[54px] lg:block" />

      <div class="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="mb-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[#666666]">
            MY ORDERS
          </p>
          <h1 class="text-[26px] font-semibold leading-[1.3] text-[#171717] sm:text-[30px]">
            งานของฉัน
          </h1>
          <p class="mt-2 max-w-2xl text-sm font-normal leading-[1.6] text-[#666666]">
            ติดตามสถานะคำสั่งงาน ชำระเงิน เลือกผลงาน และเปิดรายละเอียดงานทั้งหมดของคุณ
          </p>
        </div>
        <NuxtLink
          to="/customer/orders/create"
          class="inline-flex h-11 items-center justify-center rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-[#292929] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25"
        >
          สั่งงานใหม่
        </NuxtLink>
      </div>
    </section>

    <section class="mt-6 w-full max-w-full rounded-[20px] border border-black/[0.06] bg-white p-4 shadow-[0_4px_14px_rgba(0,0,0,0.04)] sm:p-5">
      <div class="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div class="flex max-w-full min-w-0 gap-2 overflow-x-auto pb-1 xl:overflow-visible xl:pb-0">
          <button
            v-for="group in filterGroups"
            :key="group.value"
            class="inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-black transition"
            :class="selectedGroup === group.value
              ? 'border-[#171717] bg-[#171717] text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)]'
              : 'border-black/[0.06] bg-white text-[#666666] hover:bg-[#F3F3F1] hover:text-[#171717]'"
            @click="selectedGroup = group.value"
          >
            <span>{{ group.label }}</span>
            <span
              class="rounded-full px-2 py-0.5 text-[10px]"
              :class="selectedGroup === group.value ? 'bg-white/18 text-white' : 'bg-neutral-100 text-neutral-500'"
            >
              {{ getGroupCount(group) }}
            </span>
          </button>
        </div>

        <div class="flex w-full max-w-full min-w-0 items-center gap-2 rounded-xl border border-black/[0.06] bg-[#F3F3F1] px-3 py-2 xl:w-[340px] xl:shrink-0">
          <svg
            class="h-4 w-4 shrink-0 text-[#929292]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-4.35-4.35m1.35-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            class="w-full bg-transparent text-sm font-semibold text-neutral-900 outline-none placeholder:text-[#929292]"
            placeholder="ค้นหาเลขงาน ประเภทงาน แพ็กเกจ"
          >
        </div>
      </div>
    </section>

    <div class="mt-6 grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
      <main class="min-w-0 self-start rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
        <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
              รายการงาน
            </h2>
            <p class="text-[13px] font-normal leading-[1.5] text-[#666666]">
              แสดง {{ filteredOrders.length }} รายการจากข้อมูลคำสั่งงานที่โหลดอยู่
            </p>
          </div>
          <button
            v-if="hasClientFilter"
            class="self-start rounded-xl border border-black/[0.08] bg-white px-3.5 py-2 text-xs font-semibold text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:bg-[#F3F3F1] sm:self-auto"
            @click="clearFilters"
          >
            ล้างตัวกรอง
          </button>
        </div>

        <div
          v-if="loading"
          class="space-y-3"
        >
          <div
            v-for="idx in 5"
            :key="idx"
            class="h-[88px] animate-pulse rounded-[16px] bg-[#F3F3F1]"
          />
        </div>

        <div
          v-else-if="error"
          class="rounded-[20px] border border-black/[0.06] bg-[#FDEEEE] p-6 text-center"
        >
          <p class="text-base font-semibold text-[#B93B3B]">
            เกิดข้อผิดพลาด
          </p>
          <p class="mt-1 text-sm font-normal text-[#B93B3B]">
            {{ error }}
          </p>
          <button
            class="mt-5 h-11 rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white"
            @click="() => fetchOrders(currentPage)"
          >
            โหลดอีกครั้ง
          </button>
        </div>

        <div
          v-else-if="filteredOrders.length === 0"
          class="rounded-[20px] border border-dashed border-black/[0.10] bg-[#F3F3F1] p-10 text-center"
        >
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[#171717]">
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2"
              />
            </svg>
          </div>
          <h3 class="text-base font-semibold text-[#171717]">
            ไม่มีงานในรายการนี้
          </h3>
          <p class="mx-auto mt-2 max-w-md text-sm font-normal leading-[1.6] text-[#666666]">
            ลองล้างตัวกรองหรือเริ่มสร้างคำสั่งงานใหม่ แล้วงานของคุณจะแสดงที่นี่
          </p>
          <div class="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              v-if="hasClientFilter"
              class="inline-flex h-11 items-center rounded-xl border border-black/[0.08] bg-white px-[18px] text-sm font-semibold text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              @click="clearFilters"
            >
              ล้างตัวกรอง
            </button>
            <NuxtLink
              to="/customer/orders/create"
              class="inline-flex h-11 items-center rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)]"
            >
              สั่งงานแรกของคุณ
            </NuxtLink>
          </div>
        </div>

        <div
          v-else
          class="space-y-3.5"
        >
          <NuxtLink
            v-for="order in filteredOrders"
            :key="order.orderId"
            :to="`/customer/orders/${order.orderId}`"
            class="group grid min-w-0 gap-3 rounded-[16px] border border-black/[0.06] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition duration-200 hover:-translate-y-px hover:border-black/[0.10] hover:shadow-[0_4px_14px_rgba(0,0,0,0.04)] sm:grid-cols-[70px_minmax(0,1fr)_auto] sm:items-center"
          >
            <div class="relative flex h-[70px] w-[70px] flex-col items-center justify-center overflow-hidden rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] text-center">
              <span class="mb-1 flex h-6 w-6 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[#666666]">
                <svg
                  class="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.5-4.5a2 2 0 012.8 0L16 16m-2-2l1.5-1.5a2 2 0 012.8 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <span class="max-w-[58px] truncate text-[9px] font-semibold leading-tight text-[#666666]">
                {{ order.workTypeName }}
              </span>
              <span class="mt-0.5 text-[9px] font-medium leading-none text-[#929292]">
                #{{ Math.abs(order.orderId) }}
              </span>
            </div>

            <div class="min-w-0">
              <div class="mb-1 flex flex-wrap items-center gap-2">
                <h3 class="truncate text-base font-semibold leading-[1.45] text-[#171717]">
                  #COOS-{{ Math.abs(order.orderId) }} · {{ order.workTypeName }}
                </h3>
                <span
                  class="rounded-full border px-2.5 py-[5px] text-xs font-medium"
                  :class="getStatusMeta(order.orderStatus).tone"
                >
                  {{ getStatusMeta(order.orderStatus).label }}
                </span>
              </div>
              <p class="text-xs font-normal leading-[1.5] text-[#666666]">
                {{ order.packageName }} · สร้าง {{ formatDate(order.orderCreatedAt) }} · ส่งงาน {{ formatDate(order.orderRequiredDate) }}
              </p>
              <div class="mt-3 flex items-center gap-3">
                <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-[#EEEEEC]">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getProgressFillClass(order.orderStatus)"
                    :style="{ width: `${getStatusMeta(order.orderStatus).progress}%` }"
                  />
                </div>
                <span class="min-w-10 text-right text-xs font-medium text-[#666666]">
                  {{ getStatusMeta(order.orderStatus).progress }}%
                </span>
              </div>
            </div>

            <div class="flex min-w-0 items-center justify-between gap-3 sm:min-w-[118px] sm:flex-col sm:items-end">
              <div class="text-left sm:text-right">
                <p class="text-sm font-semibold text-[#171717] sm:text-[15px]">
                  ฿{{ formatPrice(order.orderTotalPrice) }}
                </p>
                <p class="text-[11px] font-normal text-[#929292]">
                  ราคาสุทธิ
                </p>
              </div>
              <span
                class="rounded-xl border px-3.5 py-2 text-xs font-semibold transition"
                :class="getActionCtaClass(order.orderStatus)"
              >
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

      <aside class="min-w-0 space-y-6">
        <section class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
          <div class="mb-4">
            <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
              สรุปงานของฉัน
            </h2>
            <p class="text-xs font-normal text-[#666666]">
              ตัวเลขจากรายการคำสั่งงานจริง
            </p>
          </div>

          <div class="space-y-2.5">
            <div
              v-for="item in summaryCards"
              :key="item.label"
              class="flex items-center justify-between rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] px-4 py-3"
            >
              <span class="text-sm font-semibold text-[#666666]">{{ item.label }}</span>
              <span class="text-xl font-semibold text-[#171717]">{{ item.value }}</span>
            </div>
          </div>
        </section>

        <section class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
          <p class="text-xl font-semibold leading-[1.4] text-[#171717]">
            พร้อมสร้างงานใหม่?
          </p>
          <p class="mt-1 text-xs font-normal leading-[1.5] text-[#666666]">
            เลือกบริการและส่งรายละเอียดงานใหม่ได้จากแบบฟอร์มเดิมของระบบ
          </p>
          <NuxtLink
            to="/customer/orders/create"
            class="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] hover:bg-[#292929] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25"
          >
            สั่งงานใหม่
          </NuxtLink>
        </section>
      </aside>
    </div>
  </div>
</template>
