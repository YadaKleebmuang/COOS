<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import { orderService } from "~/services/order.service"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()

const orders = ref<any[]>([])
const editors = ref<any[]>([])
const loading = ref(true)
const error = ref("")
const selectedFilter = ref<string>("all")
const searchOrderId = ref("")

const fetchAdminData = async () => {
  loading.value = true
  error.value = ""
  try {
    const [allUsers, allOrders] = await Promise.all([
      apiFetch("/users"),
      orderService.getMyOrders() // Admin fetches all
    ])
    
    // Sort all orders by newest
    orders.value = [...allOrders].sort((a, b) => b.orderId - a.orderId)
    editors.value = allUsers.filter((u: any) => u.userRole === "editor")
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถโหลดข้อมูลจัดการคำสั่งงานได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAdminData()
})

const filteredOrders = computed(() => {
  let result = orders.value
  
  if (selectedFilter.value === "waiting_deposit") {
    result = result.filter(o => o.orderStatus === "waiting_deposit")
  } else if (selectedFilter.value === "waiting_assignment") {
    result = result.filter(o => o.orderStatus === "waiting_assignment")
  } else if (selectedFilter.value === "in_progress") {
    result = result.filter(o => o.orderStatus === "in_progress")
  } else if (selectedFilter.value === "waiting_final_payment") {
    result = result.filter(o => o.orderStatus === "waiting_final_payment")
  } else if (selectedFilter.value === "completed") {
    result = result.filter(o => o.orderStatus === "completed" || o.orderStatus === "delivered")
  }
  
  if (searchOrderId.value.trim()) {
    const query = searchOrderId.value.trim()
    result = result.filter(o => String(o.orderId) === query)
  }
  
  return result
})

// Action: Assign Editor
const handleAssignEditor = async (orderId: number, event: Event) => {
  const target = event.target as HTMLSelectElement
  const editorId = target.value ? Number(target.value) : null
  
  try {
    const res = await apiFetch(`/orders/${orderId}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editorId })
    })
    alert(res.message || "มอบหมายงานสำเร็จ")
    fetchAdminData()
  } catch (err: any) {
    alert(err?.message || "มอบหมายงานไม่สำเร็จ")
  }
}

// Action: Verify Payment Slip
const verifyPayment = async (orderId: number, paymentId: number, status: "approved" | "rejected") => {
  const note = status === "approved" 
    ? "ผู้ดูแลระบบตรวจสอบหลักฐานการโอนและอนุมัติความถูกต้องแล้ว" 
    : prompt("กรุณาระบุเหตุผลการปฏิเสธสลิป:")
    
  if (status === "rejected" && note === null) return // Canceled prompt
  
  try {
    const res = await apiFetch(`/orders/${orderId}/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus: status, logNote: note })
    })
    alert(res.message || "ประมวลผลสลิปเงินโอนสำเร็จ")
    fetchAdminData()
  } catch (err: any) {
    alert(err?.message || "ไม่สามารถประมวลผลรายการสลิปได้")
  }
}

const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 })

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return d.toLocaleDateString("th-TH")
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">📁 ตรวจสอบและจัดการคำสั่งงาน</h1>
        <p class="text-slate-500 text-sm mt-1">มอบหมายงานให้ช่างแต่งภาพ (Editors) และอนุมัติสลิปโอนเงินลูกค้า</p>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="bg-white border rounded-xl p-1 flex flex-wrap gap-1 shadow-sm overflow-x-auto">
        <button @click="selectedFilter = 'all'" class="px-4 py-2 text-xs font-bold rounded-lg transition" :class="selectedFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'">ทั้งหมด ({{ orders.length }})</button>
        <button @click="selectedFilter = 'waiting_deposit'" class="px-4 py-2 text-xs font-bold rounded-lg transition" :class="selectedFilter === 'waiting_deposit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'">รอชำระมัดจำ</button>
        <button @click="selectedFilter = 'waiting_assignment'" class="px-4 py-2 text-xs font-bold rounded-lg transition" :class="selectedFilter === 'waiting_assignment' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'">รอมอบหมายช่าง</button>
        <button @click="selectedFilter = 'in_progress'" class="px-4 py-2 text-xs font-bold rounded-lg transition" :class="selectedFilter === 'in_progress' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'">กำลังดำเนินการ</button>
        <button @click="selectedFilter = 'waiting_final_payment'" class="px-4 py-2 text-xs font-bold rounded-lg transition" :class="selectedFilter === 'waiting_final_payment' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'">รอชำระงวดสุดท้าย</button>
        <button @click="selectedFilter = 'completed'" class="px-4 py-2 text-xs font-bold rounded-lg transition" :class="selectedFilter === 'completed' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'">ส่งงานแล้ว</button>
      </div>

      <div class="flex gap-2">
        <input v-model="searchOrderId" type="text" placeholder="🔍 ค้นด้วย ID ออเดอร์..." class="px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs w-44" />
        <button @click="fetchAdminData" class="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white border px-3 py-2 rounded-xl transition">🔄 โหลดใหม่</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-3xl p-16 text-center border shadow-sm">
      <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
      <p class="text-slate-400 font-medium">กำลังโหลดข้อมูลการดำเนินงาน...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-2xl border text-center font-bold text-sm">
      ⚠️ {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredOrders.length === 0" class="bg-white rounded-3xl p-16 text-center border shadow-sm space-y-4">
      <div class="text-5xl">📁</div>
      <h3 class="text-lg font-bold text-slate-700">ไม่พบข้อมูลใบสั่งงาน</h3>
      <p class="text-slate-400 text-sm">ไม่มีคำสั่งซื้อที่ตรงกับสถานะดังกล่าวในขณะนี้</p>
    </div>

    <!-- Orders Cards List -->
    <div v-else class="space-y-6">
      <div v-for="order in filteredOrders" :key="order.orderId" class="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-3">
          <div>
            <h3 class="font-extrabold text-slate-800 text-lg">ออเดอร์ #{{ order.orderId }}</h3>
            <p class="text-xs text-slate-400">สั่งซื้อโดยลูกค้า ID: {{ order.customerId }} • วันที่รับงาน: {{ formatDate(order.orderRequiredDate) }}</p>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400 uppercase tracking-widest font-semibold">สถานะ:</span>
            <span class="px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
              {{ order.orderStatus.replace('_', ' ') }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <span class="text-xs text-slate-400 font-bold block mb-1">🎨 ประเภทงาน / แพ็กเกจ</span>
            <p class="font-bold text-slate-800">ประเภท: {{ order.workTypeName }}</p>
            <p class="text-slate-500 font-medium">แพ็กเกจ: {{ order.packageName }} • ยอดเงิน: <strong class="text-indigo-600">฿{{ formatPrice(order.orderTotalPrice) }}</strong></p>
          </div>

          <!-- Mapped Editor Selector -->
          <div>
            <span class="text-xs text-slate-400 font-bold block mb-1.5">💻 มอบหมายช่างแต่งภาพ (Editor)</span>
            <select
              :value="order.editorId || ''"
              @change="handleAssignEditor(order.orderId, $event)"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs text-slate-700 transition"
            >
              <option value="">-- ยังไม่มอบหมายช่าง --</option>
              <option v-for="ed in editors" :key="ed.userId" :value="ed.userId">
                {{ ed.userFirstName }} {{ ed.userLastName }}
              </option>
            </select>
          </div>

          <!-- Submitted payments approval section -->
          <div>
            <span class="text-xs text-slate-400 font-bold block mb-1.5">🧾 ตรวจสอบยอดเงิน / สลิปโอนเงิน</span>
            
            <div v-if="order.payments && order.payments.some((p: any) => p.paymentStatus === 'pending')" class="space-y-3 bg-amber-50/50 border border-amber-200 rounded-2xl p-4">
              <div v-for="pay in order.payments.filter((p: any) => p.paymentStatus === 'pending')" :key="pay.paymentId" class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="font-bold text-slate-800">{{ pay.paymentType === 'deposit' ? 'มัดจำ 30%' : 'ส่วนที่เหลือ 70%' }}</span>
                  <span class="font-extrabold text-amber-600">฿{{ formatPrice(pay.paymentAmount) }}</span>
                </div>
                
                <a :href="pay.paymentSlipUrl" target="_blank" class="block font-bold text-indigo-600 hover:underline">
                  📎 เปิดดูรูปสลิปการโอน
                </a>
                
                <div class="flex gap-2 justify-end">
                  <button @click="verifyPayment(order.orderId, pay.paymentId, 'approved')" class="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded-lg">อนุมัติ</button>
                  <button @click="verifyPayment(order.orderId, pay.paymentId, 'rejected')" class="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-lg">ปฏิเสธ</button>
                </div>
              </div>
            </div>
            
            <p v-else class="text-slate-400 text-xs italic">ไม่มีประวัติยอดค้างตรวจสอบสลิป</p>
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
