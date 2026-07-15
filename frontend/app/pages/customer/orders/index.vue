<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { orderService } from "~/services/order.service"
import type { OrderSummary, OrderStatus } from "~/types/order.types"

// ── Auth & Cookies ──
const token = useCookie<string | null>("token")
const router = useRouter()

definePageMeta({
  layout: "customer",
  middleware: ["auth", "customer"],
})

// ── State ──
const orders = ref<OrderSummary[]>([])
const loading = ref(true)
const error = ref("")
const selectedStatusFilter = ref<string>("all")

// ── Fetch orders ──
const fetchOrders = async () => {
  loading.value = true
  error.value = ""
  try {
    const res = await orderService.getMyOrders()
    orders.value = res
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถดึงข้อมูลรายการออเดอร์ได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!token.value) {
    router.push("/login")
    return
  }
  fetchOrders()
})

// ── Filtered Orders ──
const filteredOrders = computed(() => {
  if (selectedStatusFilter.value === "all") {
    return orders.value
  }
  return orders.value.filter((o) => o.orderStatus === selectedStatusFilter.value)
})

// ── Status Config (Labels & Color Badges) ──
interface StatusConfig {
  label: string
  bg: string
  text: string
  border: string
}

const statusMap: Record<OrderStatus, StatusConfig> = {
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

const getStatusConfig = (status: OrderStatus): StatusConfig => {
  return statusMap[status] || {
    label: status,
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200"
  }
}

// ── Format helpers ──
const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

// ── Tab Filters List ──
const filterTabs = [
  { value: "all", label: "ทั้งหมด" },
  { value: "waiting_deposit", label: "รอชำระมัดจำ" },
  { value: "in_progress", label: "กำลังดำเนินงาน" },
  { value: "waiting_selection", label: "รอเลือกรูปภาพ" },
  { value: "waiting_final_payment", label: "รอชำระงวดสุดท้าย" },
  { value: "completed", label: "เสร็จสมบูรณ์" }
]
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <NuxtLink to="/" class="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition mb-3">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            กลับหน้าหลัก
          </NuxtLink>
          <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">📁 ประวัติออเดอร์ของฉัน</h1>
          <p class="text-gray-500 mt-1 text-sm">ติดตามสถานะ สลิปโอนเงิน และดาวน์โหลดไฟล์ผลงานทั้งหมดของคุณ</p>
        </div>
        <div>
          <NuxtLink to="/customer/orders/create" class="inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition text-sm">
            ➕ สั่งงานภาพใหม่
          </NuxtLink>
        </div>
      </div>

      <!-- Filters Tab -->
      <div class="bg-white rounded-xl shadow-sm p-1.5 mb-6 flex flex-wrap gap-1 border border-gray-100 overflow-x-auto">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          @click="selectedStatusFilter = tab.value"
          class="px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 whitespace-nowrap"
          :class="
            selectedStatusFilter === tab.value
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          "
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100">
        <div class="animate-spin w-10 h-10 border-4 border-slate-200 border-t-gray-900 rounded-full mx-auto mb-4"></div>
        <p class="text-gray-500 font-bold">กำลังดึงข้อมูลออเดอร์ของคุณ...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-3xl shadow-sm p-8 text-center border border-red-100">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-red-600 mb-1">เกิดข้อผิดพลาด</h3>
        <p class="text-gray-500 text-sm mb-4">{{ error }}</p>
        <button @click="fetchOrders" class="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-xl transition text-sm">
          โหลดอีกครั้ง
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredOrders.length === 0" class="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100">
        <div class="text-5xl mb-4">🎨</div>
        <h3 class="text-lg font-bold text-gray-700 mb-1">ไม่พบคำสั่งงาน</h3>
        <p class="text-gray-500 text-sm mb-6">คุณยังไม่มีการสั่งงานในหมวดหมู่นี้</p>
        <NuxtLink to="/customer/orders/create" class="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm shadow-sm hover:shadow-md">
          สั่งงานแรกของคุณเลย
        </NuxtLink>
      </div>

      <!-- Orders List Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NuxtLink
          v-for="order in filteredOrders"
          :key="order.orderId"
          :to="`/customer/orders/${order.orderId}`"
          class="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
        >
          <!-- Order Card Top Header -->
          <div class="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <span class="font-extrabold text-gray-700">ออเดอร์ #{{ order.orderId }}</span>
            <span
              class="px-3 py-1 rounded-full text-xs font-bold border"
              :class="[
                getStatusConfig(order.orderStatus).bg,
                getStatusConfig(order.orderStatus).text,
                getStatusConfig(order.orderStatus).border
              ]"
            >
              {{ getStatusConfig(order.orderStatus).label }}
            </span>
          </div>

          <!-- Order Card Details -->
          <div class="p-6 flex-1 flex flex-col justify-between">
            <div class="space-y-3">
              <div>
                <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider block">ประเภทภาพ</span>
                <span class="text-gray-800 font-bold text-base">🎨 {{ order.workTypeName }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <div>
                  <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider block">แพ็กเกจ</span>
                  <span class="text-gray-700 font-bold text-sm">📦 {{ order.packageName }}</span>
                </div>
                <div>
                  <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider block">วันที่ต้องการงาน</span>
                  <span class="text-gray-700 font-semibold text-sm">📅 {{ formatDate(order.orderRequiredDate) }}</span>
                </div>
              </div>
            </div>

            <!-- Price & Button Footer -->
            <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span class="text-xs text-gray-400 block">ราคาสุทธิ</span>
                <span class="text-xl font-black text-gray-900">฿{{ formatPrice(order.orderTotalPrice) }}</span>
              </div>
              <span class="text-sm font-bold text-gray-900 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                ดูรายละเอียด
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
</template>
