<script setup lang="ts">
import type { OrderStatus } from "~/types/order.types"

const props = defineProps<{
  status: OrderStatus | string
}>()

interface StatusConfig {
  label: string
  classes: string
}

const statusMap: Record<string, StatusConfig> = {
  waiting_deposit: {
    label: "รอชำระมัดจำ",
    classes: "bg-gray-100 text-gray-500 border-gray-200"
  },
  waiting_assignment: {
    label: "รอมอบหมายงาน",
    classes: "bg-gray-100 text-gray-600 border-gray-200"
  },
  waiting_to_start: {
    label: "รอเริ่มดำเนินการ",
    classes: "bg-gray-100 text-gray-600 border-gray-200"
  },
  in_progress: {
    label: "กำลังดำเนินการ",
    classes: "bg-gray-800 text-white border-gray-800"
  },
  waiting_selection: {
    label: "รอตรวจสอบผลงาน",
    classes: "bg-gray-200 text-gray-700 border-gray-300"
  },
  waiting_final_payment: {
    label: "รอชำระส่วนที่เหลือ",
    classes: "bg-gray-100 text-gray-600 border-gray-200"
  },
  delivered: {
    label: "ส่งมอบผลงานแล้ว",
    classes: "bg-black text-white border-black"
  },
  completed: {
    label: "เสร็จสมบูรณ์",
    classes: "bg-black text-white border-black"
  },
  cancelled: {
    label: "ยกเลิกออเดอร์",
    classes: "bg-white text-red-600 border-red-200"
  }
}

const config = computed(() => statusMap[props.status] ?? {
  label: props.status,
  classes: "bg-gray-100 text-gray-500 border-gray-200"
})
</script>

<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap"
    :class="config.classes"
  >
    {{ config.label }}
  </span>
</template>
