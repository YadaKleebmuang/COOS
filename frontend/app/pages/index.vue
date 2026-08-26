<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import type { Package } from '~/types/order.types'

definePageMeta({
  layout: 'default'
})

const { apiFetch } = useApi()

type GalleryImage = {
  imageId?: number | string
  imageUrl?: string
  imageTitle?: string
  imageDescription?: string
  imageTags?: string
  workTypeId?: number
  workTypeName?: string
}

const featuredImages = ref<GalleryImage[]>([])
const packages = ref<Package[]>([])
const loading = ref(true)

const selectedImage = ref<GalleryImage | null>(null)
const isDetailsModalOpen = ref(false)

const openDetails = (img: GalleryImage) => {
  selectedImage.value = img
  isDetailsModalOpen.value = true
}

const loadData = async () => {
  try {
    const [imgData, pkgData] = await Promise.all([
      apiFetch<GalleryImage[]>('/gallery-images').catch(() => []),
      apiFetch<Package[]>('/packages').catch(() => [])
    ])

    // เอาแค่ 3 รูปล่าสุด
    featuredImages.value = imgData.slice(0, 3)
    // แพ็กเกจเอาเฉพาะที่เปิดใช้งาน
    packages.value = pkgData.filter(p => p.packageIsActive === 1)
  } catch (error) {
    console.error('Failed to load landing data', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="coos-page">
    <!-- Hero Section -->
    <section class="relative overflow-hidden pb-12 pt-10 md:pb-16 md:pt-14">
      <div class="coos-shell">
        <div class="coos-panel relative overflow-hidden px-6 py-10 md:px-12 md:py-14 lg:min-h-[560px]">
          <div class="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div class="relative z-10 max-w-xl text-left">
              <p class="coos-kicker mb-5">
                COOS STUDIO
              </p>
              <h1 class="text-4xl font-black leading-[1.18] tracking-tight text-black md:text-6xl">
                เปลี่ยนไอเดียของคุณ<br class="hidden sm:block">
                ให้กลายเป็นภาพที่ใช่
              </h1>
              <p class="mt-5 max-w-lg text-base leading-8 text-neutral-600">
                เลือกสไตล์จากแกลเลอรี เลือกแพ็กเกจ อัปโหลดภาพต้นฉบับ แล้วให้ทีมของเรานำเสนอผลงานให้คุณคัดเลือก
              </p>
              <div class="mt-8 flex flex-col gap-4 sm:flex-row">
                <NuxtLink
                  to="/customer/orders/create"
                  class="coos-button-dark"
                >
                  เริ่มสั่งงาน
                </NuxtLink>
                <NuxtLink
                  to="/gallery"
                  class="coos-button-light"
                >
                  ดูผลงาน
                </NuxtLink>
              </div>
            </div>
            <div class="relative min-h-[360px] lg:min-h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1496440737103-cd596325d314?w=900&auto=format&fit=crop&q=85"
                alt="COOS Studio portrait preview"
                class="absolute inset-0 h-full w-full rounded-[1.4rem] object-cover object-center shadow-[0_24px_80px_rgba(15,15,15,0.18)]"
              >
              <div class="absolute inset-0 rounded-[1.4rem] bg-gradient-to-r from-white/45 via-transparent to-white/10" />
            </div>
          </div>

          <div class="coos-panel relative z-10 mt-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-lg">
                ✦
              </div>
              <div>
                <h3 class="text-sm font-bold text-black">
                  คุณภาพสูง
                </h3>
                <p class="text-xs text-neutral-500">
                  เก็บทุกรายละเอียด
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-lg">
                ⌁
              </div>
              <div>
                <h3 class="text-sm font-bold text-black">
                  สั่งงานง่าย
                </h3>
                <p class="text-xs text-neutral-500">
                  ไม่ซับซ้อน
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-lg">
                □
              </div>
              <div>
                <h3 class="text-sm font-bold text-black">
                  ติดตามงานได้
                </h3>
                <p class="text-xs text-neutral-500">
                  อัปเดตทุกขั้นตอน
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-lg">
                ◇
              </div>
              <div>
                <h3 class="text-sm font-bold text-black">
                  ปลอดภัย
                </h3>
                <p class="text-xs text-neutral-500">
                  ข้อมูลของคุณปลอดภัย
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest Works Section -->
    <section class="py-10">
      <div class="coos-shell">
        <div class="mb-6 flex items-end justify-between gap-4">
          <div class="text-left">
            <h3 class="coos-section-title">
              ผลงานล่าสุด
            </h3>
            <p class="mt-2 text-sm text-neutral-500">
              ตัวอย่างสไตล์ที่ลูกค้าเลือกใช้บริการ
            </p>
          </div>
          <NuxtLink
            to="/gallery"
            class="flex shrink-0 items-center text-sm font-bold text-neutral-700 hover:text-black transition-colors"
          >
            ดูทั้งหมด
            <svg
              class="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </NuxtLink>
        </div>

        <div
          v-if="loading"
          class="flex justify-center py-12"
        >
          <div class="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full" />
        </div>

        <div
          v-else-if="featuredImages.length > 0"
          class="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <div
            v-for="img in featuredImages"
            :key="img.imageId"
          >
            <GalleryImageCard
              :img="img"
              @view-details="openDetails"
            />
          </div>
        </div>

        <div
          v-else
          class="text-center py-12"
        >
          <p class="text-gray-500 text-sm">
            ยังไม่มีผลงานแสดงในขณะนี้
          </p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section
      id="how-it-works"
      class="py-10"
    >
      <div class="coos-shell">
        <div class="mb-10 text-left">
          <h3 class="coos-section-title">
            ขั้นตอนการสั่งงาน
          </h3>
          <p class="mt-2 text-sm text-neutral-500">
            4 ขั้นตอนง่ายๆ จากไอเดียถึงผลงาน
          </p>
        </div>

        <div class="coos-panel grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
          <!-- Step 1 -->
          <div
            class="text-left"
          >
            <div
              class="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-black text-black shadow-sm"
            >
              1
            </div>
            <h4 class="mb-2 text-base font-bold text-black">
              เลือกสไตล์
            </h4>
            <p class="text-sm leading-7 text-neutral-500">
              ดูตัวอย่างในแกลเลอรีและเลือกแนวที่คุณชอบ
            </p>
          </div>
          <!-- Step 2 -->
          <div
            class="text-left"
          >
            <div
              class="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-black text-black shadow-sm"
            >
              2
            </div>
            <h4 class="mb-2 text-base font-bold text-black">
              เลือกแพ็กเกจ
            </h4>
            <p class="text-sm leading-7 text-neutral-500">
              Basic, Standard หรือ Pro ตามความต้องการ
            </p>
          </div>
          <!-- Step 3 -->
          <div
            class="text-left"
          >
            <div
              class="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-black text-black shadow-sm"
            >
              3
            </div>
            <h4 class="mb-2 text-base font-bold text-black">
              อัปโหลดภาพต้นฉบับ
            </h4>
            <p class="text-sm leading-7 text-neutral-500">
              ส่งภาพอ้างอิงและรายละเอียดให้กับทีมงาน
            </p>
          </div>
          <!-- Step 4 -->
          <div
            class="text-left"
          >
            <div
              class="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-black text-black shadow-sm"
            >
              4
            </div>
            <h4 class="mb-2 text-base font-bold text-black">
              รับผลงาน
            </h4>
            <p class="text-sm leading-7 text-neutral-500">
              คัดเลือกภาพและดาวน์โหลดเมื่อพร้อม
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Packages Section -->
    <section
      id="packages"
      class="py-10"
    >
      <div class="coos-shell">
        <div class="mb-8 text-left">
          <h3 class="coos-section-title">
            แพ็กเกจบริการ
          </h3>
          <p class="mt-2 text-sm text-neutral-500">
            เลือกแพ็กเกจที่เหมาะสมกับงานของคุณ
          </p>
        </div>

        <div
          v-if="loading"
          class="flex justify-center py-12"
        >
          <div class="animate-spin w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full" />
        </div>

        <div
          v-else-if="packages.length > 0"
          class="space-y-12"
        >
          <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div
              v-for="pkg in packages"
              :key="pkg.packageId"
              class="coos-card coos-card-hover relative flex flex-col p-7"
            >
              <!-- Badge container to keep heights identical -->
              <div class="h-8 mb-2 flex items-center">
                <span
                  v-if="pkg.packageName === 'Standard'"
                  class="bg-gray-50 text-gray-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-gray-200"
                >
                  ยอดนิยม
                </span>
              </div>

              <!-- Header Row -->
              <div class="flex justify-between items-baseline mb-2">
                <h4 class="text-2xl font-black text-black">
                  {{ pkg.packageName }}
                </h4>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl font-black text-black">{{ Math.round(pkg.packagePrice).toLocaleString()
                  }}</span>
                  <span class="text-xs text-gray-500 font-semibold uppercase">THB</span>
                </div>
              </div>

              <p class="text-neutral-500 text-sm mb-6 flex-grow leading-7">
                {{ pkg.packageDescription
                  || 'ไม่มีคำอธิบาย' }}
              </p>

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

              <NuxtLink
                :to="`/customer/orders/create?packageId=${pkg.packageId}`"
                class="coos-button-light mt-auto w-full"
              >
                เลือกแพ็กเกจนี้
              </NuxtLink>
            </div>
          </div>
        </div>

        <div
          v-else
          class="text-center py-12"
        >
          <p class="text-gray-500 text-sm">
            ไม่มีข้อมูลแพ็กเกจในขณะนี้
          </p>
        </div>
      </div>
    </section>

    <section class="py-10">
      <div class="coos-shell">
        <div class="coos-panel grid items-center gap-6 overflow-hidden p-7 md:grid-cols-[1fr_auto] md:p-10">
          <div>
            <h3 class="text-2xl font-black tracking-tight text-black">
              พร้อมเริ่มงานกับเราแล้วหรือยัง?
            </h3>
            <p class="mt-2 text-sm leading-7 text-neutral-500">
              ให้เราช่วยสร้างสรรค์ผลงานที่ใช่สำหรับคุณ
            </p>
          </div>
          <NuxtLink
            to="/customer/orders/create"
            class="coos-button-dark"
          >
            เริ่มสั่งงานเลย
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Details Modal -->
    <GalleryDetailsModal
      :img="selectedImage"
      :is-open="isDetailsModalOpen"
      @close="isDetailsModalOpen = false"
    />
  </div>
</template>
