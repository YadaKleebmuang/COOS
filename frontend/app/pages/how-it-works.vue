<script setup lang="ts">
definePageMeta({
  layout: "default"
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen py-24">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">ขั้นตอนการใช้งาน</h1>
        <p class="text-lg text-gray-500">4 ขั้นตอนง่ายๆ จากไอเดียถึงผลงานคุณภาพที่เราพร้อมเสิร์ฟให้คุณ</p>
      </div>

      <div class="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
        
        <!-- Step 1 -->
        <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-900 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold z-10">
            1
          </div>
          <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <h3 class="text-xl font-bold text-gray-900 mb-2">เลือกสไตล์ที่คุณชอบ</h3>
            <p class="text-gray-500 leading-relaxed">
              เข้าไปที่ <NuxtLink to="/gallery" class="text-gray-900 font-semibold underline decoration-2 underline-offset-2">หน้าแกลเลอรี</NuxtLink> ของเราเพื่อดูตัวอย่างผลงานที่ผ่านมา คุณสามารถค้นหาและเลือกสไตล์ โทนสี หรือแนวการจัดองค์ประกอบภาพที่คุณต้องการ
            </p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-900 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold z-10">
            2
          </div>
          <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <h3 class="text-xl font-bold text-gray-900 mb-2">เลือกแพ็กเกจ</h3>
            <p class="text-gray-500 leading-relaxed">
              เรามี <NuxtLink to="/packages" class="text-gray-900 font-semibold underline decoration-2 underline-offset-2">แพ็กเกจหลากหลาย</NuxtLink> ให้เลือกใช้งาน ไม่ว่าจะเป็นงานถ่ายส่วนตัว งานรับปริญญา หรือโปรเจกต์ขนาดใหญ่ เลือกจำนวนภาพและระยะเวลาที่ตอบโจทย์คุณ
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-900 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold z-10">
            3
          </div>
          <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <h3 class="text-xl font-bold text-gray-900 mb-2">ส่งภาพต้นฉบับและรายละเอียด</h3>
            <p class="text-gray-500 leading-relaxed">
              ทำการสร้างออเดอร์ในระบบ อัปโหลดไฟล์ภาพต้นฉบับของคุณ (หรือระบุความต้องการหากเป็นการสั่งถ่ายใหม่) พร้อมทั้งสามารถระบุเพิ่มเติมได้ว่าต้องการเน้นส่วนไหนเป็นพิเศษ
            </p>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
          <div class="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-900 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 font-bold z-10">
            4
          </div>
          <div class="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <h3 class="text-xl font-bold text-gray-900 mb-2">รับผลงานสมบูรณ์แบบ</h3>
            <p class="text-gray-500 leading-relaxed">
              ทีมงานมืออาชีพของเราจะดำเนินการและส่งมอบภาพที่ปรับแต่งเสร็จสมบูรณ์ผ่านระบบ คุณสามารถตรวจสอบผลงานและดาวน์โหลดรูปภาพความละเอียดสูงไปใช้งานได้ทันที
            </p>
          </div>
        </div>

      </div>
      
      <div class="mt-20 text-center">
        <NuxtLink 
          to="/customer/orders/create" 
          class="inline-block bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
        >
          เริ่มสั่งทำภาพเลย
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
