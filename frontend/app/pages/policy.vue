<script setup lang="ts">
definePageMeta({
  layout: "default"
})
</script>

<template>
  <div class="bg-white min-h-screen py-16 md:py-24">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Title Section -->
      <div class="text-left mb-8">
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight mb-2">นโยบายการใช้งาน</h1>
        <p class="text-sm text-gray-500">เงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัว</p>
      </div>

      <!-- Divider -->
      <hr class="border-gray-150 mb-10" />

      <!-- Policy Cards List -->
      <div class="space-y-6">
        <!-- Card 1: Privacy Policy -->
        <div class="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow transition-shadow duration-300">
          <h3 class="text-base font-bold text-gray-900 mb-2">นโยบายความเป็นส่วนตัว</h3>
          <p class="text-sm text-gray-500 leading-relaxed font-normal">
            ข้อมูลและรูปต้นฉบับที่คุณอัปโหลดจะถูกใช้เพื่อการผลิตผลงานตามคำสั่งงานเท่านั้น และจะเก็บไว้ตามระยะเวลาที่กฎหมายกำหนด
          </p>
        </div>

        <!-- Card 2: AI Limitation -->
        <div class="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow transition-shadow duration-300">
          <h3 class="text-base font-bold text-gray-900 mb-2">ข้อจำกัดของ AI</h3>
          <p class="text-sm text-gray-500 leading-relaxed font-normal">
            ภาพที่ผลิตด้วยเครื่องมือ AI ภายนอกอาจมีความคลาดเคลื่อนจากใบหน้าจริง และไม่สามารถรับประกันความเหมือนจริงได้ 100%
          </p>
        </div>

        <!-- Card 3: Payments & Cancellation -->
        <div class="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow transition-shadow duration-300">
          <h3 class="text-base font-bold text-gray-900 mb-2">การชำระเงินและการยกเลิก</h3>
          <p class="text-sm text-gray-500 leading-relaxed font-normal">
            ลูกค้าต้องชำระค่ามัดจำ 30% ก่อนเริ่มงาน และชำระส่วนที่เหลือ 70% เมื่อคัดเลือกผลงานแล้ว การยกเลิกก่อนเริ่มดำเนินการสามารถขอคืนเงินได้บางส่วน
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
