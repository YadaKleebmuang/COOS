<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import type { Package } from "~/types/order.types"

definePageMeta({
  layout: "default"
})

const { apiFetch } = useApi()
const packages = ref<Package[]>([])
const loading = ref(true)

const loadData = async () => {
  try {
    const pkgData = await apiFetch<Package[]>("/packages")
    packages.value = pkgData.filter(p => p.packageIsActive === 1)
  } catch (error) {
    console.error("Failed to load packages", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadData())
</script>

<template>
  <div class="bg-gray-50 min-h-screen py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">แพ็กเกจของเรา</h1>
        <p class="text-lg text-gray-500 max-w-2xl mx-auto">เลือกแพ็กเกจที่เหมาะสมกับความต้องการของคุณ ระบบการสั่งทำภาพที่ยืดหยุ่นและตอบโจทย์</p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
      </div>

      <div v-else-if="packages.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div 
          v-for="pkg in packages" 
          :key="pkg.packageId"
          class="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col hover:border-gray-900 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        >
          <!-- Featured Badge (Optional) -->
          <div v-if="pkg.packageName.toLowerCase().includes('standard') || pkg.packageName.toLowerCase().includes('popular')" class="absolute top-0 right-0 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-bl-xl">
            Popular
          </div>

          <h4 class="text-2xl font-bold text-gray-900 mb-2">{{ pkg.packageName }}</h4>
          <p class="text-gray-500 mb-6 flex-grow">{{ pkg.packageDescription || 'แพ็กเกจมาตรฐานสำหรับการตกแต่งภาพในสไตล์ที่คุณต้องการ' }}</p>
          
          <div class="mb-6 border-t border-gray-100 pt-6">
            <div class="flex items-baseline gap-1">
              <span class="text-5xl font-extrabold text-gray-900">฿{{ pkg.packagePrice.toLocaleString() }}</span>
            </div>
          </div>
          
          <ul class="space-y-4 mb-8">
            <li class="flex items-center text-gray-700">
              <svg class="w-5 h-5 text-green-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              ส่งมอบงานสูงสุด <strong class="ml-1">{{ pkg.packageImageCount }} ภาพ</strong>
            </li>
            <li class="flex items-center text-gray-700">
              <svg class="w-5 h-5 text-green-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              ระยะเวลาดำเนินงาน <strong class="ml-1">{{ pkg.packageDeliveryDays }} วัน</strong>
            </li>
            <li class="flex items-center text-gray-700">
              <svg class="w-5 h-5 text-green-500 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              คุณภาพไฟล์สูง (High-Resolution)
            </li>
          </ul>
          
          <NuxtLink 
            to="/customer/orders/create" 
            class="w-full mt-auto bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl text-center shadow-md hover:shadow-lg transition-all"
          >
            เลือกแพ็กเกจนี้
          </NuxtLink>
        </div>
      </div>
      
      <div v-else class="text-center py-12">
        <p class="text-gray-500">ไม่มีข้อมูลแพ็กเกจในขณะนี้</p>
      </div>
    </div>
  </div>
</template>
