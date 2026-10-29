<script setup lang="ts">
import type { OrderCreateResponse } from '~/types/order.types'

defineProps<{
  createdOrder: OrderCreateResponse
}>()

const formatPrice = (n: number) =>
  Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="animate-fade-in overflow-hidden rounded-[14px] border border-[#172c3b]/10 bg-[#fcf9f3] p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] sm:p-12">
    <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#172c3b] text-white shadow-md">
      <svg
        class="h-8 w-8"
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
    <h2 class="mb-2 text-[26px] font-semibold leading-tight text-[#172c3b]">
      สร้างคำสั่งงานสำเร็จ
    </h2>
    <p class="mb-8 text-[14px] font-medium text-[#52616a]">
      หมายเลขออเดอร์: <span class="font-bold text-[#172c3b]">#COOS-{{ Math.abs(createdOrder.orderId) }}</span>
    </p>

    <div class="mx-auto mb-8 max-w-[340px] space-y-2.5 rounded-[12px] border border-[#172c3b]/10 bg-[#fcf9f3] p-6 text-left shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
      <div class="flex justify-between text-[13px] font-medium text-[#52616a]">
        <span>ราคาแพ็กเกจ</span>
        <span class="font-bold text-[#172c3b]">{{ formatPrice(createdOrder.orderBasePrice) }}</span>
      </div>
      <div
        v-if="createdOrder.orderUrgentPrice > 0"
        class="flex justify-between text-[13px] font-medium text-[#172c3b]"
      >
        <span>ค่าเร่งด่วน</span>
        <span class="font-bold">+{{ formatPrice(createdOrder.orderUrgentPrice) }}</span>
      </div>
      <div
        v-if="createdOrder.orderDiscount > 0"
        class="flex justify-between text-[13px] font-medium text-[#267A48]"
      >
        <span>ส่วนลด Gallery</span>
        <span class="font-bold">-{{ formatPrice(createdOrder.orderDiscount) }}</span>
      </div>
      <hr class="my-3 border-[#172c3b]/10">
      <div class="flex justify-between text-[16px] font-bold text-[#172c3b]">
        <span>รวมทั้งหมด</span>
        <span>{{ formatPrice(createdOrder.orderTotalPrice) }}</span>
      </div>
    </div>

    <p class="mx-auto mb-8 max-w-[340px] rounded-xl border border-[#172c3b]/10 bg-[#eee7db] p-4 text-[13px] font-medium leading-relaxed text-[#172c3b] shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
      สถานะปัจจุบัน: <strong class="text-[#9A6812]">รอชำระมัดจำ</strong><br>กรุณาชำระมัดจำ 30% เพื่อเริ่มดำเนินการ
    </p>

    <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
      <NuxtLink
        to="/customer/orders"
        class="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#172c3b]/15 bg-[#eee7db] px-[18px] text-[14px] font-semibold text-[#172c3b] transition hover:border-black/20 hover:bg-[#fcf9f3] focus:outline-none focus:ring-2 focus:ring-[#172c3b]/20 sm:w-auto"
      >
        ดูรายการสั่งงาน
      </NuxtLink>
      <NuxtLink
        :to="`/customer/orders/${createdOrder.orderId}`"
        class="customer-primary inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#172c3b] px-[18px] text-[14px] font-semibold text-white shadow-md transition hover:bg-[#294655] focus:outline-none focus:ring-2 focus:ring-[#172c3b]/20 sm:w-auto"
      >
        ดูรายละเอียดออเดอร์
      </NuxtLink>
    </div>
  </div>
</template>
