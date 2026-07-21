<script setup lang="ts">
import type { OrderCreateResponse } from "~/types/order.types"

defineProps<{
  createdOrder: OrderCreateResponse
}>()

const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center animate-fade-in">
    <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
      <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
    </div>
    <h2 class="text-2xl font-bold text-gray-900 mb-2">สร้างคำสั่งงานสำเร็จ!</h2>
    <p class="text-gray-500 mb-6 text-sm">หมายเลขออเดอร์: <span class="font-bold text-gray-900">#{{ createdOrder.orderId }}</span></p>

    <div class="bg-slate-50 border border-slate-100 rounded-xl p-5 max-w-sm mx-auto mb-6 text-left space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-gray-500">ราคาแพ็กเกจ</span>
        <span class="font-medium text-gray-900">฿{{ formatPrice(createdOrder.orderBasePrice) }}</span>
      </div>
      <div v-if="createdOrder.orderUrgentPrice > 0" class="flex justify-between text-sm">
        <span class="text-gray-500">ค่าเร่งด่วน</span>
        <span class="font-medium text-orange-600">+฿{{ formatPrice(createdOrder.orderUrgentPrice) }}</span>
      </div>
      <div v-if="createdOrder.orderDiscount > 0" class="flex justify-between text-sm">
        <span class="text-gray-500">ส่วนลด Gallery</span>
        <span class="font-medium text-green-600">-฿{{ formatPrice(createdOrder.orderDiscount) }}</span>
      </div>
      <hr class="border-gray-200 my-2"/>
      <div class="flex justify-between text-base font-bold">
        <span class="text-gray-900">รวมทั้งหมด</span>
        <span class="text-gray-900">฿{{ formatPrice(createdOrder.orderTotalPrice) }}</span>
      </div>
    </div>

    <p class="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3 mb-6 max-w-sm mx-auto font-medium">
      สถานะ: <strong>รอชำระมัดจำ</strong> — กรุณาชำระมัดจำ 30% เพื่อเริ่มดำเนินการ
    </p>

    <div class="flex flex-col sm:flex-row gap-3 justify-center items-center">
      <NuxtLink to="/customer/orders"
        class="inline-block w-full sm:w-auto bg-white border border-gray-300 hover:bg-slate-50 text-gray-900 font-medium px-6 py-2.5 rounded-lg transition"
      >
        ดูรายการสั่งงาน
      </NuxtLink>
      <NuxtLink to="/"
        class="inline-block w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-2.5 rounded-lg transition"
      >
        กลับหน้าหลัก
      </NuxtLink>
    </div>
  </div>
</template>
