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

const selectedImage = ref<any>(null)
const isDetailsModalOpen = ref(false)

const openDetails = (img: any) => {
  selectedImage.value = img
  isDetailsModalOpen.value = true
}

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
    <section class="relative bg-gray-50/50 overflow-hidden py-24 md:py-32">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <!-- Text column -->
          <div class="text-left space-y-6">
            <span
              class="inline-block bg-gray-100 text-gray-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-gray-200">
              COOS — Creative Order & Online Studio
            </span>
            <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              สั่งทำภาพสไตล์ที่คุณต้องการ<br class="hidden sm:block" />
              ง่าย รวดเร็ว โปร่งใส
            </h1>
            <p class="text-base md:text-lg text-gray-500 leading-relaxed max-w-xl">
              เลือกสไตล์จากแกลเลอรี เลือกแพ็กเกจ อัปโหลดภาพต้นฉบับ แล้วให้ทีมของเรานำเสนอผลงานให้คุณคัดเลือก
            </p>
            <div class="flex flex-col sm:flex-row gap-4 pt-4">
              <NuxtLink to="/customer/orders/create"
                class="bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-8 rounded-xl shadow hover:shadow-lg transition-all text-center text-sm">
                เริ่มสั่งงาน
              </NuxtLink>
              <NuxtLink to="/gallery"
                class="bg-white border border-gray-200 hover:border-gray-900 text-gray-900 font-bold py-4 px-8 rounded-xl shadow-sm hover:shadow transition-all text-center text-sm">
                ดูแกลเลอรี
              </NuxtLink>
            </div>
          </div>
          <!-- Grid of Images column -->
          <div class="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop&q=80"
              alt="COOS B&W 1"
              class="rounded-3xl w-full h-48 object-cover shadow-sm grayscale hover:grayscale-0 transition-all duration-500" />
            <img src="https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500&auto=format&fit=crop&q=80"
              alt="COOS B&W 2"
              class="rounded-3xl w-full h-48 object-cover shadow-sm grayscale hover:grayscale-0 transition-all duration-500" />
            <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&auto=format&fit=crop&q=80"
              alt="COOS B&W 3"
              class="rounded-3xl w-full h-48 object-cover shadow-sm grayscale hover:grayscale-0 transition-all duration-500" />
            <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&auto=format&fit=crop&q=80"
              alt="COOS B&W 4"
              class="rounded-3xl w-full h-48 object-cover shadow-sm grayscale hover:grayscale-0 transition-all duration-500" />
          </div>
        </div>
      </div>
    </section>

    <!-- Latest Works Section -->
    <section class="py-24 bg-gray-50/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-end mb-12">
          <div class="text-left">
            <h3 class="text-2xl font-bold text-gray-900 mb-1">ผลงานล่าสุด</h3>
            <p class="text-sm text-gray-500">ตัวอย่างสไตล์ที่ลูกค้าเลือกใช้บริการ</p>
          </div>
          <NuxtLink to="/gallery"
            class="flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
            ดูทั้งหมด
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
        </div>

        <div v-else-if="featuredImages.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="img in featuredImages" :key="img.imageId">
            <GalleryImageCard :img="img" @view-details="openDetails" />
          </div>
        </div>

        <div v-else class="text-center py-12">
          <p class="text-gray-500 text-sm">ยังไม่มีผลงานแสดงในขณะนี้</p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-left mb-16 border-b border-gray-100 pb-6">
          <h3 class="text-xl font-bold text-gray-900 mb-1">ขั้นตอนการใช้งาน</h3>
          <p class="text-sm text-gray-500">4 ขั้นตอนง่ายๆ จากไอเดียถึงผลงาน</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Step 1 -->
          <div
            class="bg-white border border-gray-100 p-8 rounded-3xl text-left hover:border-gray-900 transition-all duration-300 relative shadow-sm">
            <div
              class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-xs font-bold text-gray-800 mb-6 border border-gray-100">
              1</div>
            <h4 class="text-base font-bold text-gray-900 mb-2">เลือกสไตล์</h4>
            <p class="text-xs text-gray-500 leading-relaxed">ดูตัวอย่างในแกลเลอรีและเลือกแนวที่คุณชอบ</p>
          </div>
          <!-- Step 2 -->
          <div
            class="bg-white border border-gray-100 p-8 rounded-3xl text-left hover:border-gray-900 transition-all duration-300 relative shadow-sm">
            <div
              class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-xs font-bold text-gray-800 mb-6 border border-gray-100">
              2</div>
            <h4 class="text-base font-bold text-gray-900 mb-2">เลือกแพ็กเกจ</h4>
            <p class="text-xs text-gray-500 leading-relaxed">Basic, Standard หรือ Pro ตามความต้องการ</p>
          </div>
          <!-- Step 3 -->
          <div
            class="bg-white border border-gray-100 p-8 rounded-3xl text-left hover:border-gray-900 transition-all duration-300 relative shadow-sm">
            <div
              class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-xs font-bold text-gray-800 mb-6 border border-gray-100">
              3</div>
            <h4 class="text-base font-bold text-gray-900 mb-2">อัปโหลดภาพต้นฉบับ</h4>
            <p class="text-xs text-gray-500 leading-relaxed">ส่งภาพอ้างอิงและรายละเอียดให้กับทีมงาน</p>
          </div>
          <!-- Step 4 -->
          <div
            class="bg-white border border-gray-100 p-8 rounded-3xl text-left hover:border-gray-900 transition-all duration-300 relative shadow-sm">
            <div
              class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-xs font-bold text-gray-800 mb-6 border border-gray-100">
              4</div>
            <h4 class="text-base font-bold text-gray-900 mb-2">รับผลงาน</h4>
            <p class="text-xs text-gray-500 leading-relaxed">คัดเลือกภาพและดาวน์โหลดเมื่อพร้อม</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Packages Section -->
    <section id="packages" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-left mb-16 border-b border-gray-100 pb-6">
          <h3 class="text-xl font-bold text-gray-900 mb-1">แพ็กเกจบริการ</h3>
          <p class="text-sm text-gray-500">เลือกแพ็กเกจที่เหมาะสมกับงานของคุณ</p>
        </div>

        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
        </div>

        <div v-else-if="packages.length > 0" class="space-y-12">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="pkg in packages" :key="pkg.packageId"
              class="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col hover:border-gray-900 hover:shadow-xl transition-all duration-300 relative">
              <!-- Badge container to keep heights identical -->
              <div class="h-8 mb-2 flex items-center">
                <span v-if="pkg.packageName === 'Standard'"
                  class="bg-gray-50 text-gray-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-gray-200">
                  ยอดนิยม
                </span>
              </div>

              <!-- Header Row -->
              <div class="flex justify-between items-baseline mb-2">
                <h4 class="text-2xl font-bold text-gray-900">{{ pkg.packageName }}</h4>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-extrabold text-gray-900">{{ Math.round(pkg.packagePrice).toLocaleString()
                    }}</span>
                  <span class="text-xs text-gray-500 font-semibold uppercase">THB</span>
                </div>
              </div>

              <p class="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">{{ pkg.packageDescription ||
                'ไม่มีคำอธิบาย' }}</p>

              <!-- Specs List -->
              <div class="border-t border-gray-100 my-6 pt-6">
                <div class="space-y-4">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-400">ภาพส่งมอบ</span>
                    <span class="font-medium text-gray-900">{{ pkg.packageImageCount }} ภาพ</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-400">ความละเอียด</span>
                    <span class="font-medium text-gray-900">
                      {{ pkg.packageName === 'Standard' ? 'Full HD หรือ 4K' : pkg.packageResolution === 'FullHD' ? 'Full HD' : '4K' }}
                    </span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-400">ระยะเวลา</span>
                    <span class="font-medium text-gray-900">
                      {{ pkg.packageName === 'Basic' ? '3-5' : pkg.packageName === 'Standard' ? '5-7' : '7-10' }} วัน
                    </span>
                  </div>
                </div>
              </div>

              <NuxtLink :to="`/customer/orders/create?packageId=${pkg.packageId}`"
                class="w-full mt-auto border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-900 text-gray-900 font-semibold py-3.5 px-6 rounded-2xl text-center transition-all text-sm shadow-sm hover:shadow">
                เลือกแพ็กเกจนี้
              </NuxtLink>
            </div>
          </div>

          <!-- Table Compare Section -->
          <div class="pt-12">
            <h4 class="text-lg font-bold text-gray-900 mb-6 text-left">เปรียบเทียบแพ็กเกจ</h4>
            <div class="overflow-x-auto border border-gray-200 rounded-3xl bg-white shadow-sm">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-gray-200 bg-gray-50/50">
                    <th class="py-5 px-8 text-sm font-semibold text-gray-500">คุณสมบัติ</th>
                    <th class="py-5 px-8 text-sm font-semibold text-gray-900 w-1/4">Basic</th>
                    <th class="py-5 px-8 text-sm font-semibold text-gray-900 w-1/4">Standard</th>
                    <th class="py-5 px-8 text-sm font-semibold text-gray-900 w-1/4">Pro</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr>
                    <td class="py-5 px-8 text-sm text-gray-500">ราคา</td>
                    <td class="py-5 px-8 text-sm font-semibold text-gray-900">199 THB</td>
                    <td class="py-5 px-8 text-sm font-semibold text-gray-900">399 THB</td>
                    <td class="py-5 px-8 text-sm font-semibold text-gray-900">599 THB</td>
                  </tr>
                  <tr>
                    <td class="py-5 px-8 text-sm text-gray-500">จำนวนภาพ</td>
                    <td class="py-5 px-8 text-sm text-gray-900">10 ภาพ</td>
                    <td class="py-5 px-8 text-sm text-gray-900">20 ภาพ</td>
                    <td class="py-5 px-8 text-sm text-gray-900">30 ภาพ</td>
                  </tr>
                  <tr>
                    <td class="py-5 px-8 text-sm text-gray-500">ความละเอียด</td>
                    <td class="py-5 px-8 text-sm text-gray-900">Full HD</td>
                    <td class="py-5 px-8 text-sm text-gray-900">Full HD หรือ 4K</td>
                    <td class="py-5 px-8 text-sm text-gray-900">4K</td>
                  </tr>
                  <tr>
                    <td class="py-5 px-8 text-sm text-gray-500">ระยะเวลาส่งมอบ</td>
                    <td class="py-5 px-8 text-sm text-gray-900">3-5 วัน</td>
                    <td class="py-5 px-8 text-sm text-gray-900">5-7 วัน</td>
                    <td class="py-5 px-8 text-sm text-gray-900">7-10 วัน</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <p class="text-gray-500 text-sm">ไม่มีข้อมูลแพ็กเกจในขณะนี้</p>
        </div>
      </div>
    </section>

    <!-- Details Modal -->
    <GalleryDetailsModal :img="selectedImage" :is-open="isDetailsModalOpen" @close="isDetailsModalOpen = false" />
  </div>
</template>
