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
    <!-- Top Canvas: Shared Backdrop for Navbar, Hero & Feature Strip -->
    <div class="relative overflow-hidden -mt-[72px] sm:-mt-[84px] pb-10">
      <!-- Shared Background Image Layer -->
      <div class="absolute inset-0 z-0">
        <img
          src="~/assets/images/public/coos-home-hero.png"
          alt="COOS Studio creative editorial portrait backdrop"
          class="h-full w-full object-cover object-[80%_center] md:object-right pointer-events-none"
          style="-webkit-mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 8%, rgba(0,0,0,1) 26%, rgba(0,0,0,1) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 82%, rgba(0,0,0,0.85) 88%, rgba(0,0,0,0) 100%); mask-image: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 8%, rgba(0,0,0,1) 26%, rgba(0,0,0,1) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 82%, rgba(0,0,0,0.85) 88%, rgba(0,0,0,0) 100%); -webkit-mask-composite: source-in; mask-composite: intersect;"
        >
        <!-- Soft light-gradient overlay for readability on left side -->
        <div class="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/10 md:from-white/90 md:via-white/40 md:to-transparent" />
        <!-- Ambient Glow Overlay -->
        <div class="absolute left-[-10%] top-[-10%] h-[36rem] w-[36rem] rounded-full bg-[#EDF3FF]/25 blur-[72px] mix-blend-multiply pointer-events-none" />
      </div>

      <!-- Hero Section Content -->
      <section class="relative z-10 min-h-[500px] sm:min-h-[580px] lg:min-h-[640px] flex items-center pt-[116px] sm:pt-[136px] md:pt-[156px] pb-6">
        <div class="coos-shell w-full">
          <div class="max-w-xl text-left">
            <p class="coos-kicker mb-4 md:mb-5">
              COOS STUDIO
            </p>
            <h1 class="text-4xl font-black leading-[1.15] tracking-tight text-[#171717] sm:text-5xl md:text-6xl">
              เปลี่ยนไอเดียของคุณ<br class="hidden sm:block">
              ให้กลายเป็นภาพที่ใช่
            </h1>
            <p class="mt-6 max-w-lg text-sm md:text-base leading-relaxed text-[#666666] font-medium">
              สั่งงานง่าย ได้ภาพคุณภาพสูง ตรงตามความต้องการ ด้วยทีมงานมืออาชีพ
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
        </div>
      </section>

      <!-- Feature / Trust Strip (Floating Glass Card over backdrop) -->
      <section class="pt-8 pb-10 relative z-10 px-4 sm:px-5 lg:px-8">
        <div class="mx-auto w-full max-w-[1280px]">
          <div class="coos-panel coos-trust-strip grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8 bg-white/78 backdrop-blur-[18px] border border-white/60 shadow-[0_16px_48px_rgba(0,0,0,0.06)] rounded-[24px]">
            <!-- Item 1: High Quality -->
            <div class="flex items-center gap-4 text-left">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.03)] text-[#171717]">
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-extrabold text-[#171717]">
                  คุณภาพสูง
                </h3>
                <p class="mt-1 text-xs text-[#666666]">
                  เก็บทุกรายละเอียด
                </p>
              </div>
            </div>
            <!-- Item 2: Easy Order -->
            <div class="flex items-center gap-4 text-left">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.03)] text-[#171717]">
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M18 10a2 2 0 11-4 0 2 2 0 014 0zM7 8a2 2 0 11-4 0 2 2 0 014 0zM9 18a2 2 0 11-4 0 2 2 0 014 0zM19 16a2 2 0 11-4 0 2 2 0 014 0zM6 9l8 5M16 11l-7 4"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-extrabold text-[#171717]">
                  สั่งงานง่าย
                </h3>
                <p class="mt-1 text-xs text-[#666666]">
                  ไม่ซับซ้อน
                </p>
              </div>
            </div>
            <!-- Item 3: Trackable -->
            <div class="flex items-center gap-4 text-left">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.03)] text-[#171717]">
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-extrabold text-[#171717]">
                  ติดตามงานได้
                </h3>
                <p class="mt-1 text-xs text-[#666666]">
                  อัปเดตทุกขั้นตอน
                </p>
              </div>
            </div>
            <!-- Item 4: Secure -->
            <div class="flex items-center gap-4 text-left">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_14px_rgba(0,0,0,0.03)] text-[#171717]">
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-extrabold text-[#171717]">
                  ปลอดภัย
                </h3>
                <p class="mt-1 text-xs text-[#666666]">
                  ข้อมูลของคุณปลอดภัย
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Latest Works Section -->
    <section class="py-10 px-4 sm:px-5 lg:px-8">
      <div class="mx-auto w-full max-w-[1280px]">
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
      class="py-10 px-4 sm:px-5 lg:px-8"
    >
      <div class="mx-auto w-full max-w-[1280px]">
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
      class="py-10 px-4 sm:px-5 lg:px-8"
    >
      <div class="mx-auto w-full max-w-[1280px]">
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

    <section class="py-10 px-4 sm:px-5 lg:px-8">
      <div class="mx-auto w-full max-w-[1280px]">
        <div class="coos-panel coos-cta-panel grid items-center gap-6 overflow-hidden p-7 md:grid-cols-[1fr_auto] md:p-10">
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
<style scoped>
/* Continuous Ambient Background (near-white base with localized glows) */
.coos-page {
  background-color: #FAFAF8 !important;
  background-image:
    radial-gradient(at 90% 10%, rgba(237, 243, 255, 0.4) 0px, transparent 50%),
    radial-gradient(at 10% 30%, rgba(240, 238, 255, 0.25) 0px, transparent 40%) !important;
  position: relative;
}

/* Glass System Master Surface Language */
:deep(.coos-panel),
:deep(.coos-card) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Specific Glass Hierarchy */

/* 1. Feature Strip (floating glass card) */
.coos-trust-strip {
  background-color: rgba(255, 255, 255, 0.72) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.04) !important;
  border-radius: 24px !important;
}

/* 2. Gallery / Works Cards (light glass frame) */
:deep(.coos-card.group) {
  background-color: rgba(255, 255, 255, 0.58) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.03) !important;
  padding: 12px !important;
  border-radius: 24px !important;
}
:deep(.coos-card.group:hover) {
  transform: translateY(-4px) !important;
  background-color: rgba(255, 255, 255, 0.75) !important;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.07) !important;
  border-color: rgba(255, 255, 255, 0.8) !important;
}

/* Card Tags & Buttons styling overrides for cohesive glass look */
:deep(.coos-card.group .border-black\/5.bg-neutral-50) {
  background-color: rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(2px) !important;
  -webkit-backdrop-filter: blur(2px) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}
:deep(.coos-card.group .border-black\/5.bg-neutral-50:hover) {
  background-color: rgba(255, 255, 255, 0.5) !important;
}
:deep(.coos-card.group button.border-black\/10) {
  background-color: rgba(255, 255, 255, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
}
:deep(.coos-card.group button.border-black\/10:hover) {
  background-color: rgba(255, 255, 255, 0.6) !important;
}

/* 3. Workflow Panel */
#how-it-works .coos-panel {
  background-color: rgba(255, 255, 255, 0.68) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.04) !important;
  border-radius: 24px !important;
}

/* 4. Package Cards (slightly stronger glass panel for price/info readability) */
#packages :deep(.coos-card) {
  background-color: rgba(255, 255, 255, 0.72) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.04) !important;
  border-radius: 24px !important;
}
#packages :deep(.coos-card:hover) {
  transform: translateY(-4px) !important;
  background-color: rgba(255, 255, 255, 0.85) !important;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.85) !important;
}

/* 5. CTA bottom panel */
.coos-cta-panel {
  background-color: rgba(255, 255, 255, 0.72) !important;
  backdrop-filter: blur(18px) !important;
  -webkit-backdrop-filter: blur(18px) !important;
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  box-shadow: 0 20px 52px rgba(0, 0, 0, 0.05) !important;
  border-radius: 24px !important;
}

/* Glass Sub-Elements styling */
:deep(.coos-panel .mb-5.rounded-full) {
  background-color: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02) !important;
}
</style>
