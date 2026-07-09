<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import type { Package } from "~/types/order.types"

definePageMeta({
  layout: "default"
})

const { apiFetch } = useApi()

const featuredImages = ref<any[]>([])
const packages = ref<Package[]>([])
const loading = ref(true)

const loadData = async () => {
  try {
    const [imgData, pkgData] = await Promise.all([
      apiFetch<any[]>("/gallery-images").catch(() => []),
      apiFetch<Package[]>("/packages").catch(() => [])
    ])
    
    // เอาแค่ 3 รูปล่าสุด
    featuredImages.value = imgData.slice(0, 3)
    // แพ็กเกจเอาเฉพาะที่เปิดใช้งาน
    packages.value = pkgData.filter(p => p.packageIsActive === 1)
  } catch (error) {
    console.error("Failed to load landing data", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="bg-white">
    <!-- Hero Section -->
    <section class="relative bg-gray-50 overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-32 flex flex-col items-center text-center">
        <h1 class="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          COOS Studio <br class="hidden md:block"/>
          <span class="text-gray-500">สร้างสรรค์ภาพถ่ายในสไตล์คุณ</span>
        </h1>
        <p class="text-lg md:text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
          บริการสั่งทำภาพจากทีมสตูดิโอออนไลน์ เลือกสไตล์จากแกลเลอรี เลือกแพ็กเกจ อัปโหลดภาพต้นฉบับ แล้วให้ทีมของเรานำเสนอผลงานให้คุณคัดเลือก
        </p>
        <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <NuxtLink 
            to="/customer/orders/create" 
            class="bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center text-lg"
          >
            เริ่มสั่งงาน
          </NuxtLink>
          <NuxtLink 
            to="/gallery" 
            class="bg-white border-2 border-gray-200 hover:border-gray-900 text-gray-900 font-bold py-4 px-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center text-lg"
          >
            ดูแกลเลอรี
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">How It Works</h2>
          <h3 class="text-3xl md:text-4xl font-extrabold text-gray-900">ขั้นตอนการใช้งาน</h3>
          <p class="mt-4 text-lg text-gray-500">4 ขั้นตอนง่ายๆ จากไอเดียถึงผลงาน</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Step 1 -->
          <div class="bg-gray-50 p-8 rounded-3xl text-center group hover:-translate-y-2 transition-transform duration-300">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-gray-900 mx-auto mb-6 shadow-sm">1</div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">เลือกสไตล์</h4>
            <p class="text-gray-500">ดูผลงานในแกลเลอรีและเลือกสไตล์หรือโทนภาพที่คุณชื่นชอบ</p>
          </div>
          <!-- Step 2 -->
          <div class="bg-gray-50 p-8 rounded-3xl text-center group hover:-translate-y-2 transition-transform duration-300">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-gray-900 mx-auto mb-6 shadow-sm">2</div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">เลือกแพ็กเกจ</h4>
            <p class="text-gray-500">ระบุจำนวนภาพและระยะเวลาที่คุณต้องการจากแพ็กเกจของเรา</p>
          </div>
          <!-- Step 3 -->
          <div class="bg-gray-50 p-8 rounded-3xl text-center group hover:-translate-y-2 transition-transform duration-300">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-gray-900 mx-auto mb-6 shadow-sm">3</div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">ส่งภาพต้นฉบับ</h4>
            <p class="text-gray-500">อัปโหลดภาพของคุณเพื่อให้ทีมงานนำไปปรับแต่งตามสไตล์</p>
          </div>
          <!-- Step 4 -->
          <div class="bg-gray-50 p-8 rounded-3xl text-center group hover:-translate-y-2 transition-transform duration-300">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-gray-900 mx-auto mb-6 shadow-sm">4</div>
            <h4 class="text-xl font-bold text-gray-900 mb-3">รับผลงาน</h4>
            <p class="text-gray-500">ตรวจสอบและดาวน์โหลดภาพที่แต่งเสร็จสมบูรณ์</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest Works Section -->
    <section class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-end mb-12">
          <div>
            <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Latest Works</h2>
            <h3 class="text-3xl md:text-4xl font-extrabold text-gray-900">ผลงานล่าสุด</h3>
            <p class="mt-4 text-lg text-gray-500">ตัวอย่างสไตล์ที่ลูกค้าเลือกใช้บริการ</p>
          </div>
          <NuxtLink to="/gallery" class="hidden sm:flex items-center text-gray-900 font-bold hover:text-gray-600 transition-colors">
            ดูทั้งหมด
            <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </NuxtLink>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
        </div>

        <div v-else-if="featuredImages.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="img in featuredImages" :key="img.imageId">
            <GalleryImageCard :img="img" />
          </div>
        </div>
        
        <div v-else class="text-center py-12">
          <p class="text-gray-500">ยังไม่มีผลงานแสดงในขณะนี้</p>
        </div>
        
        <div class="mt-8 text-center sm:hidden">
          <NuxtLink to="/gallery" class="inline-flex items-center text-gray-900 font-bold">
            ดูผลงานทั้งหมด
            <svg class="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Packages Section -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Pricing</h2>
          <h3 class="text-3xl md:text-4xl font-extrabold text-gray-900">แพ็กเกจของเรา</h3>
          <p class="mt-4 text-lg text-gray-500">เลือกแพ็กเกจที่เหมาะกับความต้องการของคุณ</p>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
        </div>

        <div v-else-if="packages.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="pkg in packages" 
            :key="pkg.packageId"
            class="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col hover:border-gray-900 hover:shadow-xl transition-all duration-300"
          >
            <h4 class="text-2xl font-bold text-gray-900 mb-2">{{ pkg.packageName }}</h4>
            <p class="text-gray-500 mb-6 flex-grow">{{ pkg.packageDescription || 'ไม่มีคำอธิบาย' }}</p>
            
            <div class="mb-6 border-t border-gray-100 pt-6">
              <div class="flex items-baseline gap-1">
                <span class="text-4xl font-extrabold text-gray-900">฿{{ pkg.packagePrice.toLocaleString() }}</span>
              </div>
            </div>
            
            <ul class="space-y-4 mb-8">
              <li class="flex items-center text-gray-700">
                <svg class="w-5 h-5 text-green-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                ภาพส่งมอบสูงสุด {{ pkg.packageImageCount }} ภาพ
              </li>
              <li class="flex items-center text-gray-700">
                <svg class="w-5 h-5 text-green-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                ระยะเวลา {{ pkg.packageDurationDays }} วัน
              </li>
            </ul>
            
            <NuxtLink 
              to="/customer/orders/create" 
              class="w-full mt-auto bg-gray-50 hover:bg-gray-900 text-gray-900 hover:text-white font-bold py-3 px-6 rounded-xl text-center transition-colors"
            >
              เลือกแพ็กเกจนี้
            </NuxtLink>
          </div>
        </div>
        
        <div v-else class="text-center py-12">
          <p class="text-gray-500">ไม่มีข้อมูลแพ็กเกจในขณะนี้</p>
        </div>
        
        <div class="mt-12 text-center">
          <NuxtLink to="/packages" class="text-gray-500 hover:text-gray-900 font-semibold underline decoration-2 underline-offset-4">
            ดูรายละเอียดแพ็กเกจทั้งหมด
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
