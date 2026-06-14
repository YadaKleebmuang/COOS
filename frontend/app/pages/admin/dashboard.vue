<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import { orderService } from "~/services/order.service"
import type { OrderSummary } from "~/types/order.types"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()

const users = ref<any[]>([])
const orders = ref<OrderSummary[]>([])
const loading = ref(true)
const error = ref("")

const fetchData = async () => {
  loading.value = true
  error.value = ""
  try {
    const [allUsers, allOrders] = await Promise.all([
      apiFetch("/users"),
      orderService.getMyOrders() // Backend GET /orders returns all orders for Admin role!
    ])
    users.value = allUsers
    orders.value = allOrders
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถโหลดข้อมูลสถิติผู้ดูแลระบบได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})

const stats = computed(() => {
  const totalUsers = users.value.length
  const totalCustomers = users.value.filter(u => u.userRole === "customer").length
  const totalEditors = users.value.filter(u => u.userRole === "editor").length
  
  const totalOrders = orders.value.length
  const totalRevenue = orders.value
    .filter(o => o.orderStatus !== "cancelled")
    .reduce((sum, o) => sum + Number(o.orderTotalPrice), 0)
    
  const pendingDeposit = orders.value.filter(o => o.orderStatus === "waiting_deposit").length
  const inProgress = orders.value.filter(o => o.orderStatus === "in_progress").length
  const completed = orders.value.filter(o => o.orderStatus === "completed" || o.orderStatus === "delivered").length

  return {
    totalUsers,
    totalCustomers,
    totalEditors,
    totalOrders,
    totalRevenue,
    pendingDeposit,
    inProgress,
    completed
  }
})

const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 })
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="border-b border-slate-100 pb-4">
      <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">👑 แผงควบคุมผู้ดูแลระบบ (Admin)</h1>
      <p class="text-slate-500 text-sm mt-1">ดูภาพรวมเชิงสถิติ ยอดขาย สมาชิก และเข้าถึงเมนูตั้งค่าระบบทั้งหมด</p>
    </div>

    <div v-if="loading" class="bg-white rounded-3xl p-16 text-center border shadow-sm">
      <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
      <p class="text-slate-400 font-medium">กำลังรวบรวมข้อมูลสถิติทั้งระบบ...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-2xl border text-center font-bold text-sm">
      ⚠️ {{ error }}
    </div>

    <div v-else class="space-y-8 animate-fade-in">
      <!-- Top Row Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Revenue Card -->
        <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-sm flex flex-col justify-between h-32">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-100">ยอดขายรวมสุทธิ</span>
          <p class="text-2xl font-black">฿{{ formatPrice(stats.totalRevenue) }}</p>
        </div>

        <!-- Orders Count -->
        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 h-32">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">📁</div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">ออเดอร์ทั้งหมด</p>
            <p class="text-2xl font-black text-slate-800 mt-1">{{ stats.totalOrders }} รายการ</p>
          </div>
        </div>

        <!-- Editors Count -->
        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 h-32">
          <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">ช่าง</div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">ช่างแต่งภาพ (Editors)</p>
            <p class="text-2xl font-black text-slate-800 mt-1">{{ stats.totalEditors }} คน</p>
          </div>
        </div>

        <!-- Total Users -->
        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4 h-32">
          <div class="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl">👥</div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">สมาชิกในระบบทั้งหมด</p>
            <p class="text-2xl font-black text-slate-800 mt-1">{{ stats.totalUsers }} คน</p>
          </div>
        </div>
      </div>

      <!-- Detailed Breakdown Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- User Roles Card -->
        <div class="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 class="font-bold text-slate-800 text-base border-b pb-3">👥 การกระจายบทบาทผู้ใช้</h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-semibold">ลูกค้า (Customers)</span>
              <span class="font-bold text-slate-800">{{ stats.totalCustomers }} คน</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-semibold">ช่างแต่งภาพ (Editors)</span>
              <span class="font-bold text-purple-600">{{ stats.totalEditors }} คน</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-semibold">ผู้ดูแลระบบ (Admins)</span>
              <span class="font-bold text-indigo-600">{{ users.filter(u => u.userRole === 'admin').length }} คน</span>
            </div>
          </div>
        </div>

        <!-- Orders Stats Card -->
        <div class="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 class="font-bold text-slate-800 text-base border-b pb-3">📦 สถานะออเดอร์ภาพรวม</h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-semibold">รอชำระมัดจำ</span>
              <span class="font-bold text-amber-600">{{ stats.pendingDeposit }} รายการ</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-semibold">กำลังดำเนินการแต่งภาพ</span>
              <span class="font-bold text-purple-600">{{ stats.inProgress }} รายการ</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-semibold">ส่งมอบ/เสร็จสมบูรณ์แล้ว</span>
              <span class="font-bold text-green-600">{{ stats.completed }} รายการ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
