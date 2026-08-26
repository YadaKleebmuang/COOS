<script setup lang="ts">
import type { OrderCreateResponse } from '~/types/order.types'

defineProps<{
  createdOrder: OrderCreateResponse
}>()

const formatPrice = (n: number) =>
  Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="animate-fade-in rounded-[24px] border border-black/[0.06] bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.05)]">
    <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-[#EDF8F1] bg-[#EDF8F1]">
      <svg
        class="h-8 w-8 text-[#267A48]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2.5"
        d="M5 13l4 4L19 7"
      /></svg>
    </div>
    <h2 class="mb-2 text-[30px] font-semibold leading-[1.3] text-[#171717]">
      สร้างคำสั่งงานสำเร็จ!
    </h2>
    <p class="mb-6 text-sm leading-[1.6] text-[#666666]">
      หมายเลขออเดอร์: <span class="font-semibold text-[#171717]">#COOS-{{ Math.abs(createdOrder.orderId) }}</span>
    </p>

    <div class="mx-auto mb-6 max-w-sm space-y-2 rounded-[20px] border border-black/[0.06] bg-[#F3F3F1] p-5 text-left">
      <div class="flex justify-between text-sm">
        <span class="text-[#666666]">ราคาแพ็กเกจ</span>
        <span class="font-medium text-[#171717]">฿{{ formatPrice(createdOrder.orderBasePrice) }}</span>
      </div>
      <div
        v-if="createdOrder.orderUrgentPrice > 0"
        class="flex justify-between text-sm"
      >
        <span class="text-[#666666]">ค่าเร่งด่วน</span>
        <span class="font-medium text-[#9A6812]">+฿{{ formatPrice(createdOrder.orderUrgentPrice) }}</span>
      </div>
      <div
        v-if="createdOrder.orderDiscount > 0"
        class="flex justify-between text-sm"
      >
        <span class="text-[#666666]">ส่วนลด Gallery</span>
        <span class="font-medium text-[#267A48]">-฿{{ formatPrice(createdOrder.orderDiscount) }}</span>
      </div>
      <hr class="my-2 border-black/[0.06]">
      <div class="flex justify-between text-base font-bold">
        <span class="text-[#171717]">รวมทั้งหมด</span>
        <span class="text-[#171717]">฿{{ formatPrice(createdOrder.orderTotalPrice) }}</span>
      </div>
    </div>

    <p class="mx-auto mb-6 max-w-sm rounded-xl border border-[#FFF7E6] bg-[#FFF7E6] p-3 text-sm font-medium text-[#9A6812]">
      สถานะ: <strong>รอชำระมัดจำ</strong> — กรุณาชำระมัดจำ 30% เพื่อเริ่มดำเนินการ
    </p>

    <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
      <NuxtLink
        to="/customer/orders"
        class="inline-flex h-11 w-full items-center justify-center rounded-xl border border-black/[0.08] bg-white px-[18px] text-sm font-semibold text-[#171717] transition hover:bg-[#EEEEEC] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25 sm:w-auto"
      >
        ดูรายการสั่งงาน
      </NuxtLink>
      <NuxtLink
        :to="`/customer/orders/${createdOrder.orderId}`"
        class="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-[#292929] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25 sm:w-auto"
      >
        ดูรายละเอียดออเดอร์
      </NuxtLink>
    </div>
  </div>
</template>
