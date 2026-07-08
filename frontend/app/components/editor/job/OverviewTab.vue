<script setup lang="ts">
import type { OrderDetail } from "~/types/order.types"

defineProps<{
  order: OrderDetail
}>()

const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2 })

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h3 class="text-base font-bold text-gray-800 border-b border-gray-50 pb-2.5 mb-4">📋 ข้อมูลการสั่งงานของลูกค้า</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
        <div>
          <span class="text-gray-400 font-bold block mb-1">สไตล์ภาพ</span>
          <span class="text-gray-700 font-bold text-base bg-gray-50 px-3 py-2 rounded-xl block border border-gray-100">{{ order.orderStyle || "ไม่ได้ระบุสไตล์เฉพาะเจาะจง" }}</span>
        </div>
        <div>
          <span class="text-gray-400 font-bold block mb-1">โทนสี</span>
          <span class="text-gray-700 font-bold text-base bg-gray-50 px-3 py-2 rounded-xl block border border-gray-100">{{ order.orderColorTone || "ไม่ได้ระบุโทนสีเฉพาะเจาะจง" }}</span>
        </div>
        <div class="sm:col-span-2">
          <span class="text-gray-400 font-bold block mb-1">องค์ประกอบของภาพ / รายละเอียดฉาก</span>
          <p class="text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 leading-relaxed font-semibold">{{ order.orderComposition || "ไม่ได้ระบุองค์ประกอบเพิ่มเติม" }}</p>
        </div>
        <div class="sm:col-span-2">
          <span class="text-gray-400 font-bold block mb-1">หมายเหตุ / ข้อมูลเพิ่มเติม</span>
          <p class="text-gray-700 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 leading-relaxed font-semibold">{{ order.orderNote || "ไม่ได้ระบุหมายเหตุเพิ่มเติม" }}</p>
        </div>
      </div>
    </div>

    <div>
      <h3 class="text-base font-bold text-gray-800 border-b border-gray-50 pb-2.5 mb-4">💰 รายละเอียดด้านราคา</h3>
      <div class="bg-gray-100/30 rounded-xl p-5 border border-gray-200/50 max-w-md space-y-2.5 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500 font-semibold">ราคาตามแพ็กเกจ</span>
          <span class="font-bold text-gray-800">฿{{ formatPrice(order.orderBasePrice) }}</span>
        </div>
        <div v-if="order.orderUrgentPrice > 0" class="flex justify-between text-orange-600 font-semibold">
          <span>ค่าเร่งด่วน</span>
          <span>+฿{{ formatPrice(order.orderUrgentPrice) }}</span>
        </div>
        <div v-if="order.orderDiscount > 0" class="flex justify-between text-green-600 font-semibold">
          <span>ส่วนลด (โชว์ Gallery)</span>
          <span>-฿{{ formatPrice(order.orderDiscount) }}</span>
        </div>
        <hr class="border-gray-200 my-1" />
        <div class="flex justify-between font-black text-gray-700 text-base">
          <span>ราคารวมทั้งหมด</span>
          <span>฿{{ formatPrice(order.orderTotalPrice) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>


