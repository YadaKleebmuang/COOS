<script setup lang="ts">
import type { OrderDetail } from "~/types/order.types"

defineProps<{
  order: OrderDetail
}>()

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    waiting_deposit: "รอชำระมัดจำ",
    waiting_assignment: "รอจัดหาคนรับงาน",
    waiting_to_start: "รอช่างแต่งภาพเริ่มงาน",
    in_progress: "กำลังดำเนินการ",
    waiting_selection: "รอคัดเลือกภาพ",
    waiting_final_payment: "รอชำระงวดสุดท้าย",
    delivered: "ส่งมอบงานแล้ว",
    completed: "เสร็จสมบูรณ์",
    cancelled: "ยกเลิกออเดอร์"
  }
  return map[status] || status
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="border-b border-gray-50 pb-2.5">
      <h3 class="text-base font-bold text-gray-800">ประวัติประมวลผลงานและบันทึกการทำรายการ (Workflow Logs)</h3>
      <p class="text-xs text-gray-400 mt-0.5">กิจกรรมและลำดับประวัติสถานะของออเดอร์นี้ทั้งหมด</p>
    </div>

    <div v-if="!order.workflowLogs || order.workflowLogs.length === 0" class="text-center py-12 text-gray-400 text-xs">
      ไม่มีข้อมูลบันทึกประวัติการเปลี่ยนสถานะ
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="log in order.workflowLogs"
        :key="log.logId"
        class="flex items-start gap-4 text-xs bg-gray-50 rounded-xl p-4 border border-gray-100"
      >
        <div class="space-y-1.5 flex-grow">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span class="font-bold text-gray-700">อัปเดตสถานะงาน</span>
            <span class="text-gray-400">จาก</span>
            <span class="font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100">{{ getStatusLabel(log.fromStatus).split(" (")[0] }}</span>
            <span class="text-gray-400">➔</span>
            <span class="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">{{ getStatusLabel(log.toStatus).split(" (")[0] }}</span>
          </div>
          
          <p v-if="log.logNote" class="text-gray-600 font-medium bg-white p-2.5 rounded-xl border border-gray-100 leading-relaxed mt-1">
            {{ log.logNote }}
          </p>
          
          <p class="text-[10px] text-gray-400 font-medium">
            ผู้ดำเนินการ: {{ log.userFirstName ? `${log.userFirstName} ${log.userLastName}` : 'ระบบอัตโนมัติ' }} 
            ({{ log.userRole === 'admin' ? 'ผู้ดูแลระบบ' : log.userRole === 'editor' ? 'ช่างแต่งภาพ' : 'ลูกค้า' }}) 
            • เมื่อวันที่ {{ formatDate(log.changedAt) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>


