<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { orderService } from "~/services/order.service"
import type { OrderSummary } from "~/types/order.types"

definePageMeta({
  layout: "customer",
  middleware: ["auth", "customer"]
})

const token = useCookie<string | null>("token")
const orders = ref<OrderSummary[]>([])
const loading = ref(true)
const error = ref("")

const fetchDashboardData = async () => {
  loading.value = true
  error.value = ""
  try {
    const res = await orderService.getMyOrders()
    orders.value = res
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถดึงข้อมูลแดชบอร์ดได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})

// Statistics
const stats = computed(() => {
  const total = orders.value.length
  const inProgress = orders.value.filter(o => 
    o.orderStatus !== "completed" && 
    o.orderStatus !== "cancelled" && 
    o.orderStatus !== "delivered"
  ).length
  const completed = orders.value.filter(o => o.orderStatus === "completed" || o.orderStatus === "delivered").length
  
  return { total, inProgress, completed }
})

// Recent 3 orders
const recentOrders = computed(() => {
  return [...orders.value]
    .sort((a, b) => b.orderId - a.orderId)
    .slice(0, 3)
})

const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto">
    <!-- Welcome Header Card -->
    <div class="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
      <!-- Background Abstract Shape -->
      <div class="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-20 -translate-y-20">
        <svg class="w-96 h-96" fill="currentColor" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" />
        </svg>
      </div>

      <div class="relative z-10 space-y-3">
        <span class="bg-indigo-500/30 text-indigo-100 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">พื้นที่บริการลูกค้า</span>
        <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight">ยินดีต้อนรับสู่ COOS Studio</h1>
        <p class="text-indigo-100 text-sm sm:text-base max-w-xl">
          จัดการใบสั่งงานแต่งภาพ ตรวจสอบสถานะการตกแต่งภาพด้วยเทคโนโลยี AI และดาวน์โหลดผลงานสุดท้ายของคุณได้ที่นี่
        </p>
        <div class="pt-2 flex flex-wrap gap-3">
          <NuxtLink to="/customer/orders/create" class="bg-white hover:bg-slate-50 text-indigo-700 text-sm font-bold px-5 py-2.5 rounded-xl shadow transition duration-200">
            🎨 สั่งแต่งภาพใหม่
          </NuxtLink>
          <NuxtLink to="/customer/orders" class="bg-indigo-500/40 hover:bg-indigo-500/60 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition duration-200 border border-indigo-400/30">
            📁 ดูออเดอร์ทั้งหมด
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Statistics Overview Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <!-- Stat 1 -->
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">
          📁
        </div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">ออเดอร์ทั้งหมด</p>
          <p class="text-2xl font-black text-slate-800 mt-1">{{ stats.total }} รายการ</p>
        </div>
      </div>
      <!-- Stat 2 -->
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl">
          ⚙️
        </div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">กำลังรอดำเนินการ</p>
          <p class="text-2xl font-black text-slate-800 mt-1">{{ stats.inProgress }} รายการ</p>
        </div>
      </div>
      <!-- Stat 3 -->
      <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-2xl">
          ✅
        </div>
        <div>
          <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">เสร็จสมบูรณ์แล้ว</p>
          <p class="text-2xl font-black text-slate-800 mt-1">{{ stats.completed }} รายการ</p>
        </div>
      </div>
    </div>

    <!-- Recent Orders & Guide -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Recent Orders List (Col Span 2) -->
      <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-50 pb-4">
          <div>
            <h3 class="text-lg font-bold text-slate-800">📋 รายการออเดอร์ล่าสุด</h3>
            <p class="text-xs text-slate-400">สรุปคำสั่งซื้อ 3 รายการล่าสุดของคุณ</p>
          </div>
          <NuxtLink to="/customer/orders" class="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition">
            ดูทั้งหมด →
          </NuxtLink>
        </div>

        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full mx-auto mb-3"></div>
          <p class="text-xs text-slate-400 font-medium">กำลังโหลดข้อมูลรายการออเดอร์...</p>
        </div>

        <div v-else-if="error" class="bg-red-50 text-red-600 text-xs p-4 rounded-xl text-center">
          ⚠️ {{ error }}
        </div>

        <div v-else-if="recentOrders.length === 0" class="text-center py-12 text-slate-400 space-y-3">
          <div class="text-4xl">🎨</div>
          <p class="text-sm">คุณยังไม่มีใบสั่งงานใดๆ ในขณะนี้</p>
          <NuxtLink to="/customer/orders/create" class="inline-block bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl">
            เริ่มต้นสั่งแต่งภาพใหม่
          </NuxtLink>
        </div>

        <div v-else class="divide-y divide-slate-100">
          <NuxtLink
            v-for="order in recentOrders"
            :key="order.orderId"
            :to="`/customer/orders/${order.orderId}`"
            class="flex items-center justify-between py-4 first:pt-0 last:pb-0 group"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 transition">
                #{{ order.orderId }}
              </div>
              <div>
                <p class="text-sm font-bold text-slate-800">🎨 {{ order.workTypeName }}</p>
                <p class="text-xs text-slate-400">แพ็กเกจ: {{ order.packageName }} • {{ formatDate(order.orderRequiredDate) }}</p>
              </div>
            </div>
            
            <div class="text-right flex items-center gap-3">
              <div>
                <p class="text-sm font-bold text-indigo-600">฿{{ formatPrice(order.orderTotalPrice) }}</p>
                <span class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">{{ order.orderStatus }}</span>
              </div>
              <span class="text-slate-400 group-hover:translate-x-1 transition-transform">
                ➔
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Quick Tips Guide (Col Span 1) -->
      <div class="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-100 space-y-6">
        <h3 class="text-lg font-bold text-slate-800">💡 ขั้นตอนการรับบริการ</h3>
        
        <div class="space-y-4">
          <div class="flex gap-3">
            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center flex-shrink-0">1</span>
            <div class="text-xs">
              <p class="font-bold text-slate-800">เลือกบริการและสั่งงาน</p>
              <p class="text-slate-500 mt-0.5">เลือกประเภทงานและแพ็กเกจ อัปโหลดไฟล์รูปภาพต้นฉบับ</p>
            </div>
          </div>
          <div class="flex gap-3">
            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center flex-shrink-0">2</span>
            <div class="text-xs">
              <p class="font-bold text-slate-800">ชำระเงินมัดจำ 30%</p>
              <p class="text-slate-500 mt-0.5">แนบหลักฐานสลิปมัดจำเข้าระบบเพื่อให้ศิลปินเริ่มดำเนินงาน</p>
            </div>
          </div>
          <div class="flex gap-3">
            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center flex-shrink-0">3</span>
            <div class="text-xs">
              <p class="font-bold text-slate-800">เลือกรูปถ่ายที่ถูกใจ</p>
              <p class="text-slate-500 mt-0.5">พิจารณาเลือกรูปภาพที่แต่งสำเร็จเพื่อดำเนินงานขั้นตอนสุดท้าย</p>
            </div>
          </div>
          <div class="flex gap-3">
            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black flex items-center justify-center flex-shrink-0">4</span>
            <div class="text-xs">
              <p class="font-bold text-slate-800">ชำระงวดสุดท้าย & ดาวน์โหลด</p>
              <p class="text-slate-500 mt-0.5">ชำระ 70% ที่เหลือเพื่อรับลิขสิทธิ์และรูปความละเอียดสูง</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
