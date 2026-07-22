<script setup lang="ts">
import { ref, computed } from "vue"
import { orderService } from "~/services/order.service"
import type { OrderDetail, OrderStatus } from "~/types/order.types"

const props = defineProps<{
  order: OrderDetail
}>()

const emit = defineEmits(["refresh"])
const updating = ref(false)

const canStart = computed(() => props.order.orderStatus === "waiting_to_start")
const canSubmit = computed(() => props.order.orderStatus === "in_progress")

const updateStatus = async (nextStatus: OrderStatus, note: string) => {
  updating.value = true
  try {
    await orderService.updateOrderStatus(props.order.orderId, nextStatus, note)
    emit("refresh")
  } catch (err: any) {
    alert(err?.message || "เปลี่ยนสถานะไม่สำเร็จ")
  } finally {
    updating.value = false
  }
}

const handleStartJob = () => {
  updateStatus("in_progress", "ช่างแต่งภาพกดรับงานและเริ่มดำเนินการ")
}

const handleSubmitJob = () => {
  if (confirm("ต้องการส่งมอบภาพเพื่อให้ลูกค้าเลือกรูปภาพสุดท้ายหรือไม่? (ภาพ AI Generated ทั้งหมดจะปรากฏในหน้าของลูกค้า)")) {
    updateStatus("waiting_selection", "ช่างแต่งภาพจัดส่งผลงาน AI Generated เพื่อให้ลูกค้าเลือกภาพไฟนอล")
  }
}

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    waiting_deposit: "รอชำระมัดจำ",
    waiting_assignment: "รอจัดหาคนรับงาน",
    waiting_to_start: "รอช่างแต่งภาพกดเริ่มงาน",
    in_progress: "กำลังแต่งภาพ/ดำเนินการ",
    waiting_selection: "รอคัดเลือกภาพจากลูกค้า",
    waiting_final_payment: "รอชำระเงินงวดสุดท้าย",
    delivered: "จัดส่งผลงานขนาดจริงแล้ว",
    completed: "เสร็จสมบูรณ์",
    cancelled: "ยกเลิกออเดอร์"
  }
  return map[status] || status
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <NuxtLink to="/editor/dashboard" class="inline-flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl shadow-sm transition text-sm">
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
          </svg>
          ย้อนกลับไปแดชบอร์ด
        </NuxtLink>
        <span class="text-xs text-gray-400 font-bold uppercase tracking-wider">ห้องทำงานช่างแต่งภาพ (Workspace)</span>
      </div>
      <h1 class="text-2xl font-black text-gray-800">งานหมายเลขออเดอร์ #{{ order.orderId }}</h1>
      <div class="flex flex-wrap gap-2 text-xs">
        <span class="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-lg border border-gray-200">
          ประเภท: {{ order.workTypeName }}
        </span>
        <span class="bg-gray-100 text-gray-600 font-bold px-3 py-1 rounded-lg">
          แพ็กเกจ: {{ order.packageName }}
        </span>
        <span class="bg-amber-50 text-amber-700 font-bold px-3 py-1 rounded-lg border border-amber-100">
          สถานะ: {{ getStatusLabel(order.orderStatus) }}
        </span>
      </div>
    </div>

    <!-- Quick Action Buttons -->
    <div class="flex items-center gap-3 flex-shrink-0">
      <button
        v-if="canStart"
        @click="handleStartJob"
        :disabled="updating"
        class="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold text-sm px-6 py-3 rounded-xl shadow transition flex items-center gap-2"
      >
        <span v-if="updating" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
        กดเริ่มทำงาน (Start Job)
      </button>

      <button
        v-if="canSubmit"
        @click="handleSubmitJob"
        :disabled="updating"
        class="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold text-sm px-6 py-3 rounded-xl shadow transition flex items-center gap-2"
      >
        <span v-if="updating" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
        ส่งผลงานให้ลูกค้าตรวจ (Submit Generated)
      </button>
      
      <div v-if="!canStart && !canSubmit" class="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl">
        ไม่มีขั้นตอนรอดำเนินการในส่วนนี้
      </div>
    </div>
  </div>
</template>


