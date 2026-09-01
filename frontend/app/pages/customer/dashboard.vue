<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { orderService } from '~/services/order.service'
import type { OrderSummary, OrderStatus } from '~/types/order.types'

definePageMeta({
  layout: 'customer',
  middleware: ['auth', 'customer']
})

type CustomerProfile = {
  userFirstName?: string
  userLastName?: string
  userEmail?: string
}

type StatusMeta = {
  label: string
  tone: string
  progress: number
  actionLabel: string
}

const { apiFetch } = useApi()
const orders = ref<OrderSummary[]>([])
const totalRecords = ref(0)
const profile = ref<CustomerProfile | null>(null)
const loading = ref(true)
const error = ref('')

const actionStatuses: OrderStatus[] = ['waiting_deposit', 'waiting_selection', 'waiting_final_payment']
const activeStatuses: OrderStatus[] = ['waiting_assignment', 'waiting_to_start', 'in_progress']

const statusMeta: Record<OrderStatus, StatusMeta> = {
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
    actionLabel: 'รอทีมงาน'
  },
  waiting_to_start: {
    label: 'รอเริ่มงาน',
    tone: 'bg-[#EDF3FF] text-[#3566B8] border-[#EDF3FF]',
    progress: 34,
    actionLabel: 'รอเริ่มงาน'
  },
  in_progress: {
    label: 'กำลังดำเนินการ',
    tone: 'bg-[#F0EEFF] text-[#675DDC] border-[#F0EEFF]',
    progress: 52,
    actionLabel: 'กำลังทำงาน'
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

const workflowSteps: { status: OrderStatus, label: string }[] = [
  { status: 'waiting_deposit', label: 'รับออเดอร์' },
  { status: 'waiting_assignment', label: 'จัดทีมงาน' },
  { status: 'in_progress', label: 'ดำเนินการ' },
  { status: 'waiting_selection', label: 'เลือกผลงาน' },
  { status: 'waiting_final_payment', label: 'ชำระยอดคงเหลือ' },
  { status: 'delivered', label: 'ส่งมอบงาน' }
]

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

const fetchDashboardData = async () => {
  loading.value = true
  error.value = ''
  try {
    const [orderResult, userResult] = await Promise.all([
      orderService.getMyOrders(1, 20),
      apiFetch<CustomerProfile>('/users/me')
    ])
    orders.value = orderResult.data || []
    totalRecords.value = orderResult.total || orders.value.length
    profile.value = userResult
  } catch (err: unknown) {
    error.value = getErrorMessage(err, 'ไม่สามารถดึงข้อมูลแดชบอร์ดได้')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})

const displayName = computed(() => {
  const first = profile.value?.userFirstName || ''
  const last = profile.value?.userLastName || ''
  return `${first} ${last}`.trim() || profile.value?.userEmail || 'Customer'
})

const stats = computed(() => {
  const total = totalRecords.value
  const active = orders.value.filter(order => activeStatuses.includes(order.orderStatus)).length
  const awaitingCustomer = orders.value.filter(order => actionStatuses.includes(order.orderStatus)).length
  const completed = orders.value.filter(order => order.orderStatus === 'completed').length

  return [
    {
      label: 'งานทั้งหมด',
      value: total,
      unit: 'รายการ',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    {
      label: 'กำลังดำเนินการ',
      value: active,
      unit: 'รายการ',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      label: 'รอดำเนินการจากคุณ',
      value: awaitingCustomer,
      unit: 'รายการ',
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
    },
    {
      label: 'เสร็จสิ้น',
      value: completed,
      unit: 'รายการ',
      icon: 'M5 13l4 4L19 7'
    }
  ]
})

const activeOrders = computed(() => {
  return orders.value
    .filter(order => [...activeStatuses, ...actionStatuses].includes(order.orderStatus))
    .sort((a, b) => b.orderId - a.orderId)
    .slice(0, 5)
})

const latestOrder = computed(() => activeOrders.value[0] || orders.value[0] || null)

const actionableOrder = computed(() => {
  return orders.value
    .filter(order => actionStatuses.includes(order.orderStatus))
    .sort((a, b) => b.orderId - a.orderId)[0] || null
})

const getStatusMeta = (status: OrderStatus) => statusMeta[status] || statusMeta.waiting_deposit

const getProgressFillClass = (status: OrderStatus) => {
  if (actionStatuses.includes(status)) return 'bg-[#9A6812]'
  if (status === 'in_progress') return 'bg-[#756CE8]'
  if (status === 'waiting_assignment' || status === 'waiting_to_start') return 'bg-[#3566B8]'
  return 'bg-[#666666]'
}

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

const getWorkflowState = (stepStatus: OrderStatus) => {
  const order = latestOrder.value
  if (!order || order.orderStatus === 'cancelled') return 'pending'

  const current = getStatusMeta(order.orderStatus).progress
  const step = getStatusMeta(stepStatus).progress
  if (current > step) return 'done'
  if (order.orderStatus === stepStatus || (order.orderStatus === 'waiting_to_start' && stepStatus === 'waiting_assignment')) return 'current'
  return 'pending'
}
</script>

<template>
  <div class="mx-auto w-full max-w-[1280px] py-6 sm:py-8 lg:py-10">
    <!-- Subtle Grid background -->
    <div class="dashboard-grid pointer-events-none fixed inset-0 z-0" />

    <div class="relative z-10">
      <!-- Header & Summary Section -->
      <div class="mb-8 rounded-[24px] border border-black/5 bg-white/40 p-6 backdrop-blur-xl sm:p-8">
      <div class="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="mb-1 text-xs font-semibold uppercase tracking-widest text-[#929292]">
            COOS STUDIO
          </p>
          <h1 class="text-3xl font-semibold leading-tight text-[#171717]">
            สวัสดีค่ะ, {{ displayName }}
          </h1>
          <p class="mt-2 text-[15px] font-medium text-[#666666]">
            ยินดีต้อนรับเข้าสู่ COOS STUDIO จัดการงานแต่งภาพและติดตามสถานะได้จากที่เดียว
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink
            to="/customer/orders/create"
            class="inline-flex h-11 items-center justify-center rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/20"
          >
            สั่งงานใหม่
          </NuxtLink>
          <NuxtLink
            to="/customer/orders"
            class="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white/60 px-[18px] text-sm font-semibold text-[#171717] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            ดูงานทั้งหมด
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div
          v-for="idx in 4"
          :key="idx"
          class="h-28 animate-pulse rounded-2xl border border-black/[0.04] bg-white/50"
        />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="rounded-2xl border border-black/[0.04] bg-[#FDEEEE]/80 p-6 text-center backdrop-blur-sm"
      >
        <p class="text-sm font-medium text-[#B93B3B]">
          {{ error }}
        </p>
        <button
          class="mt-4 h-11 rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white transition hover:bg-black"
          @click="fetchDashboardData"
        >
          โหลดอีกครั้ง
        </button>
      </div>

      <!-- Stats Grid -->
      <div
        v-else
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div
          v-for="item in stats"
          :key="item.label"
          class="rounded-2xl border border-black/[0.04] bg-white/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-md"
        >
          <div class="mb-3 flex items-center gap-2.5">
            <span class="flex h-8 w-8 items-center justify-center rounded-full bg-[#f8f8f8] text-[#171717] shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)]">
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="item.icon"
                />
              </svg>
            </span>
            <p class="text-xs font-medium text-[#666666]">
              {{ item.label }}
            </p>
          </div>
          <div class="flex items-baseline gap-1.5">
            <p class="text-2xl font-bold tracking-tight text-[#171717]">
              {{ item.value }}
            </p>
            <p class="text-xs font-medium text-[#929292]">
              {{ item.unit }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-6 grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.9fr)]">
      <section class="min-w-0 self-start rounded-[24px] border border-black/5 bg-white/40 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-xl sm:p-8">
        <div class="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 class="text-[20px] font-semibold leading-tight text-[#171717]">
              งานกำลังดำเนินการ
            </h2>
            <p class="mt-1 text-[13px] font-medium text-[#666666]">
              รายการล่าสุดจากข้อมูลคำสั่งงานจริงของคุณ
            </p>
          </div>
          <NuxtLink
            to="/customer/orders"
            class="text-[13px] font-semibold text-[#171717] transition hover:text-black"
          >
            ดูทั้งหมด →
          </NuxtLink>
        </div>

        <div
          v-if="loading"
          class="space-y-3"
        >
          <div
            v-for="idx in 4"
            :key="idx"
            class="h-[88px] animate-pulse rounded-[16px] bg-white/50"
          />
        </div>

        <div
          v-else-if="activeOrders.length === 0"
          class="rounded-[16px] border border-dashed border-black/10 bg-[#f8f8f8]/50 p-10 text-center"
        >
          <p class="text-base font-semibold text-[#171717]">
            ยังไม่มีงานที่กำลังดำเนินการ
          </p>
          <p class="mt-2 text-sm leading-[1.6] text-[#666666]">
            เริ่มสร้างคำสั่งงานแรกของคุณ แล้วสถานะจะมาแสดงที่นี่
          </p>
          <NuxtLink
            to="/customer/orders/create"
            class="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-md transition hover:bg-black"
          >
            สั่งงานแรกของคุณ
          </NuxtLink>
        </div>

        <div
          v-else
          class="space-y-3"
        >
          <NuxtLink
            v-for="order in activeOrders"
            :key="order.orderId"
            :to="`/customer/orders/${order.orderId}`"
            class="group grid min-w-0 gap-4 rounded-[16px] border border-black/[0.04] bg-white/80 p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] backdrop-blur-sm transition duration-200 hover:-translate-y-px hover:border-black/[0.08] hover:shadow-[0_4px_14px_rgba(0,0,0,0.04)] sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center"
          >
            <div class="flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#f8f8f8] text-[#171717] shadow-[inset_0_1px_3px_rgba(0,0,0,0.03)]">
              <svg
                class="h-6 w-6 text-[#171717]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.8"
                  d="M4 16l4.5-4.5a2 2 0 012.8 0L16 16m-2-2l1.5-1.5a2 2 0 012.8 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div class="min-w-0">
              <div class="mb-1 flex flex-wrap items-center gap-2">
                <h3 class="truncate text-[15px] font-bold text-[#171717]">
                  {{ order.workTypeName }}
                </h3>
                <span
                  class="rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide"
                  :class="getStatusMeta(order.orderStatus).tone"
                >
                  {{ getStatusMeta(order.orderStatus).label }}
                </span>
              </div>
              <p class="mb-2 truncate text-[13px] font-medium text-[#666666]">
                #COOS-{{ Math.abs(order.orderId) }} • {{ order.packageName }} • ส่งงาน {{ formatDate(order.orderRequiredDate) }}
              </p>
              <div class="flex items-center gap-3">
                <div class="h-1 w-32 overflow-hidden rounded-full bg-[#EEEEEC]">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getProgressFillClass(order.orderStatus)"
                    :style="{ width: `${getStatusMeta(order.orderStatus).progress}%` }"
                  />
                </div>
                <span class="text-[11px] font-bold text-[#929292]">
                  {{ getStatusMeta(order.orderStatus).progress }}%
                </span>
              </div>
            </div>

            <div class="flex min-w-0 items-center justify-between gap-3 sm:min-w-[120px] sm:flex-col sm:items-end">
              <p class="text-[15px] font-bold text-[#171717]">
                ฿{{ formatPrice(order.orderTotalPrice) }}
              </p>
              <span class="inline-flex items-center justify-center rounded-xl bg-[#F3F3F1] px-4 py-2 text-[12px] font-semibold text-[#171717] transition group-hover:bg-[#171717] group-hover:text-white">
                ดูรายละเอียด
              </span>
            </div>
          </NuxtLink>
        </div>
      </section>

      <aside class="min-w-0 space-y-6">
        <section class="rounded-[24px] border border-black/5 bg-white/40 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-xl sm:p-8">
          <div class="mb-5 flex items-center justify-between">
            <div>
              <h2 class="text-[18px] font-semibold leading-tight text-[#171717]">
                ขั้นตอนการทำงาน
              </h2>
              <p class="mt-1 text-[13px] font-medium text-[#666666]">
                {{ latestOrder ? `อ้างอิงงาน #COOS-${Math.abs(latestOrder.orderId)}` : 'รอคำสั่งงานแรกของคุณ' }}
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div
              v-for="(step, idx) in workflowSteps"
              :key="step.status"
              class="flex gap-4"
            >
              <div class="flex flex-col items-center">
                <span
                  class="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-4 ring-white/60"
                  :class="{
                    'bg-[#171717] text-white': getWorkflowState(step.status) === 'done' || getWorkflowState(step.status) === 'current',
                    'bg-[#E5E5E5] text-[#929292]': getWorkflowState(step.status) === 'pending'
                  }"
                >
                  <svg
                    v-if="getWorkflowState(step.status) === 'done'"
                    class="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span v-else-if="getWorkflowState(step.status) === 'current'" class="h-2 w-2 rounded-full bg-white" />
                </span>
                <span
                  v-if="idx < workflowSteps.length - 1"
                  class="mt-1 min-h-[20px] w-[2px] flex-1 rounded-full bg-black/5"
                />
              </div>
              <div class="pb-2 pt-[2px]">
                <p
                  class="text-[14px] font-bold leading-none"
                  :class="getWorkflowState(step.status) === 'pending' ? 'text-[#929292]' : 'text-[#171717]'"
                >
                  {{ step.label }}
                </p>
                <p class="mt-1.5 text-[12px] font-medium text-[#929292]">
                  {{ getStatusMeta(step.status).label }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-[24px] border border-black/5 bg-white/40 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] backdrop-blur-xl sm:p-8">
          <div class="mb-4">
            <h2 class="text-[18px] font-semibold leading-tight text-[#171717]">
              การดำเนินการของคุณ
            </h2>
          </div>

          <div
            v-if="actionableOrder"
            class="rounded-[16px] border border-black/[0.04] bg-white/80 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] backdrop-blur-sm"
          >
            <p class="text-[11px] font-bold uppercase tracking-wider text-[#B93B3B]">
              ต้องดำเนินการต่อ
            </p>
            <p class="mt-1 text-[17px] font-bold text-[#171717]">
              {{ getStatusMeta(actionableOrder.orderStatus).actionLabel }}
            </p>
            <p class="mt-1 text-[13px] font-medium text-[#666666]">
              #COOS-{{ Math.abs(actionableOrder.orderId) }} • {{ actionableOrder.workTypeName }}
            </p>
            <NuxtLink
              :to="`/customer/orders/${actionableOrder.orderId}`"
              class="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[#171717] px-[18px] text-[14px] font-semibold text-white shadow-md transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-black/20"
            >
              เปิดออเดอร์นี้
            </NuxtLink>
          </div>

          <div
            v-else
            class="rounded-[16px] border border-dashed border-black/10 bg-[#f8f8f8]/50 p-6 text-center"
          >
            <p class="text-[14px] font-semibold text-[#171717]">
              ไม่มีงานที่ต้องดำเนินการตอนนี้
            </p>
            <p class="mt-1.5 text-[13px] font-medium leading-relaxed text-[#666666]">
              เมื่อมีงานรอชำระเงินหรือรอเลือกภาพ ระบบจะแสดงที่นี่
            </p>
          </div>
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
</style>
