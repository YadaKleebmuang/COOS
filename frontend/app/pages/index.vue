<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApi } from '~/composables/useApi'
import type { Package } from '~/types/order.types'

import imgColorfield from '~/assets/images/public/home/coos-abstract-colorfield.png'
import imgEditorial from '~/assets/images/public/home/coos-fashion-editorial.png'
import imgCenterpiece from '~/assets/images/public/home/coos-hero-centerpiece.png'
import imgTexture from '~/assets/images/public/home/coos-graphic-texture-panel.png'
import imgPortrait from '~/assets/images/public/home/coos-floating-portrait.png'
import imgLandscape from '~/assets/images/public/home/coos-cinematic-landscape.png'
import imgLuminousPortrait from '~/assets/images/public/home/coos-editorial-luminous-portrait.png'
import imgLuxuryProduct from '~/assets/images/public/home/coos-luxury-product-stilllife.png'
import imgCinematicDreamscape from '~/assets/images/public/home/coos-cinematic-dreamscape.png'
import imgSculpturalAbstract from '~/assets/images/public/home/coos-sculptural-light-abstract.png'
import imgCommercial from '~/assets/images/public/home/coos-commercial-product.png'

import imgLuminousPortraitDetail1 from '~/assets/images/public/home/coos-editorial-luminous-portrait_details_1.jpeg'
import imgLuminousPortraitDetail2 from '~/assets/images/public/home/coos-editorial-luminous-portrait_details_2.jpeg'
import imgLuminousPortraitDetail3 from '~/assets/images/public/home/coos-editorial-luminous-portrait_details_3.jpeg'

import imgEditorialDetail1 from '~/assets/images/public/home/coos-fashion-editorial_details_1.jpeg'
import imgEditorialDetail2 from '~/assets/images/public/home/coos-fashion-editorial_details_2.jpeg'
import imgEditorialDetail3 from '~/assets/images/public/home/coos-fashion-editorial_details_3.jpeg'

import imgPortraitDetail1 from '~/assets/images/public/home/coos-floating-portrait_details_1.jpeg'
import imgPortraitDetail2 from '~/assets/images/public/home/coos-floating-portrait_details_2.jpeg'
import imgPortraitDetail3 from '~/assets/images/public/home/coos-floating-portrait_details_3.jpeg'

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

const selectedExplorerIndex = ref(0)

const curatedExplorerSets = [
  {
    main: imgLuminousPortrait,
    details: [imgLuminousPortraitDetail1, imgLuminousPortraitDetail2, imgLuminousPortraitDetail3],
    label: 'พอร์ตเทรตแสงละมุน'
  },
  {
    main: imgEditorial,
    details: [imgEditorialDetail1, imgEditorialDetail2, imgEditorialDetail3],
    label: 'แฟชั่นเอดิทอเรียล'
  },
  {
    main: imgPortrait,
    details: [imgPortraitDetail1, imgPortraitDetail2, imgPortraitDetail3],
    label: 'พอร์ตเทรตอาร์ต'
  }
]

const currentExplorerSet = computed(() => {
  return curatedExplorerSets[selectedExplorerIndex.value % curatedExplorerSets.length]
})



const openDetails = (img: GalleryImage) => {
  selectedImage.value = img
  isDetailsModalOpen.value = true
}

const formatResolution = (res?: string) => {
  if (!res) return '-'
  if (res === '4K') return '4K Ultra HD'
  if (res === 'FullHD') return 'Full HD (1080p)'
  return res
}

// Extract distinct work types from loaded gallery images for horizontal strip
const availableWorkTypes = computed(() => {
  const names = featuredImages.value
    .map(i => i.workTypeName?.trim())
    .filter((name): name is string => Boolean(name))
  return Array.from(new Set(names))
})

// Duplicate the items enough times to guarantee a seamless full-width marquee
const repeatedWorkTypes = computed(() => {
  const base = availableWorkTypes.value
  if (base.length === 0) return []
  return Array(12).fill(base).flat()
})

// Visual presentation states for Process Window (User interactive only, visual aid)
const activeProcessStep = ref(0)
const processSteps = [
  {
    id: '01',
    title: 'เลือกสไตล์งาน',
    desc: 'สำรวจแนวภาพที่ชอบจากแกลเลอรี หรือระบุโทนสีที่ต้องการ',
    stageTitle: 'คัดสรรสไตล์และแนวทางภาพ',
    stageDesc: 'เลือกบรรยากาศ โทนสี แสง และมุมกล้องที่สะท้อนเอกลักษณ์ของคุณ',
    img: imgColorfield
  },
  {
    id: '02',
    title: 'เลือกแพ็กเกจ',
    desc: 'กำหนดจำนวนภาพ ความละเอียด และระยะเวลาส่งมอบ',
    stageTitle: 'กำหนดขนาดและขอบเขตงาน',
    stageDesc: 'เลือกแพ็กเกจที่ลงตัวกับงบประมาณและกำหนดการใช้งานจริง',
    img: imgCommercial
  },
  {
    id: '03',
    title: 'ส่งบรีฟและภาพอ้างอิง',
    desc: 'อัปโหลดภาพต้นฉบับและรายละเอียดเพื่อให้ทีมงานเริ่มงาน',
    stageTitle: 'ส่งข้อมูลและภาพอ้างอิง',
    stageDesc: 'แนบรายละเอียดและแนวทางที่ต้องการ เพื่อให้ทีมงานเริ่มดำเนินการ',
    img: imgTexture
  },
  {
    id: '04',
    title: 'ตรวจรับและดาวน์โหลด',
    desc: 'พรีวิวผลงาน คัดเลือกภาพที่ถูกใจ และรับไฟล์ความละเอียดสูง',
    stageTitle: 'ตรวจรับและรับไฟล์งานสมบูรณ์',
    stageDesc: 'พรีวิวผลงาน คัดเลือกภาพที่ถูกใจ พร้อมดาวน์โหลดไฟล์ความละเอียดสูงสุด',
    img: imgCenterpiece
  }
]

let observer: IntersectionObserver | null = null

const setupScrollObserver = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          observer?.unobserve(entry.target)
        }
      })
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    }
  )

  const elements = document.querySelectorAll('.reveal-init')
  elements.forEach(el => observer?.observe(el))
}

const loadData = async () => {
  try {
    const [imgData, pkgData] = await Promise.all([
      apiFetch<GalleryImage[]>('/gallery-images').catch(() => []),
      apiFetch<Package[]>('/packages').catch(() => [])
    ])

    // เลือกรูปผลงาน 3 รูปแรก
    featuredImages.value = imgData.slice(0, 3)
    // แพ็กเกจแสดงเฉพาะที่เปิดใช้งาน
    packages.value = pkgData.filter(p => p.packageIsActive === 1)
  } catch (error) {
    console.error('Failed to load landing data', error)
  } finally {
    loading.value = false
    // Re-trigger observer for newly rendered dynamic items
    setTimeout(() => {
      setupScrollObserver()
    }, 100)
  }
}

// ========================================================
// HERO MOTION LOGIC
// ========================================================
const heroCardsBase = [
  { id: 'c1', title: 'EDITORIAL', num: '#01', img: imgLuminousPortrait, type: 'local', colors: ['bg-neutral-300', 'bg-neutral-300', 'bg-neutral-300'] },
  { id: 'c2', title: 'COMMERCIAL', num: '#02', img: imgLuxuryProduct, type: 'local', colors: ['bg-neutral-300', 'bg-neutral-300', 'bg-neutral-300'] },
  { id: 'c3', title: 'WORKSPACE', num: 'STUDIO SELECTION', img: imgCenterpiece, type: 'local', colors: ['bg-red-400/80', 'bg-amber-400/80', 'bg-green-400/80'] },
  { id: 'c4', title: 'CINEMATIC', num: '#03', img: imgCinematicDreamscape, type: 'local', colors: ['bg-neutral-300', 'bg-neutral-300', 'bg-neutral-300'] },
  { id: 'c5', title: 'ABSTRACT', num: '#04', img: imgSculpturalAbstract, type: 'local', colors: ['bg-neutral-300', 'bg-neutral-300', 'bg-neutral-300'] }
]
// Duplicate to ensure loop fills screen safely
const heroCards = [...heroCardsBase, ...heroCardsBase.map(c => ({ ...c, id: c.id + '-dup' }))]

const trackOffset = ref(0)
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartOffset = ref(0)
const isHovered = ref(false)
const prefersReducedMotion = ref(false)
let animationFrameId: number | null = null
let pauseTimeout: ReturnType<typeof setTimeout> | null = null

const startHeroAnimation = () => {
  if (prefersReducedMotion.value) {
    // If reduced motion, just set static arrangement so cards aren't stacked at 0
    trackOffset.value = -380 * 2 // Shift slightly to center
    return
  }
  let lastTime = performance.now()
  const loop = (time: number) => {
    const dt = time - lastTime
    lastTime = time
    // Avoid crazy jumps if tab was inactive
    if (dt < 100 && !isDragging.value && !isHovered.value) {
      trackOffset.value -= 0.03 * dt
    }
    animationFrameId = requestAnimationFrame(loop)
  }
  animationFrameId = requestAnimationFrame(loop)
}

const onHeroPointerDown = (e: PointerEvent) => {
  if (prefersReducedMotion.value) return
  isDragging.value = true
  dragStartX.value = e.clientX
  dragStartOffset.value = trackOffset.value

  if (pauseTimeout) {
    clearTimeout(pauseTimeout)
    pauseTimeout = null
  }
  if (typeof document !== 'undefined') {
    document.body.style.cursor = 'grabbing'
  }
}

const onHeroPointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return
  const dx = e.clientX - dragStartX.value
  trackOffset.value = dragStartOffset.value + dx
}

const onHeroPointerUp = () => {
  if (!isDragging.value) return
  isDragging.value = false
  if (typeof document !== 'undefined') {
    document.body.style.cursor = ''
  }
  pauseTimeout = setTimeout(() => {
    // short delay before resuming auto-drift is natural
  }, 1000)
}

const getHeroCardStyle = (index: number, total: number) => {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024
  const spacing = width < 640 ? 280 : width < 1024 ? 340 : 420
  const totalWidth = total * spacing

  let pos = (index * spacing + trackOffset.value) % totalWidth

  if (pos > totalWidth / 2) pos -= totalWidth
  if (pos < -totalWidth / 2) pos += totalWidth

  const dist = Math.abs(pos)
  const maxDist = spacing * 2.5

  const scale = prefersReducedMotion.value
    ? 1
    : Math.max(0.72, 1 - (dist / maxDist) * 0.28)

  const zIndex = Math.round(scale * 100)

  return {
    transform: `translateX(${pos}px) scale(${scale})`,
    zIndex,
    transition: isDragging.value ? 'none' : 'transform 0.1s ease-out'
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
  startHeroAnimation()
  loadData()
  setupScrollObserver()
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  if (pauseTimeout) {
    clearTimeout(pauseTimeout)
  }
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<template>
  <div class="coos-home-v4 bg-[#F7F7F5] text-[#171717] selection:bg-neutral-200">
    <!-- Progressive Top Blur Layer (Fixed to viewport) -->
    <Teleport to="body">
      <div class="fixed top-0 left-0 right-0 h-[100px] sm:h-[120px] lg:h-[140px] z-[150] pointer-events-none progressive-blur-layer" />
    </Teleport>

    <!-- ========================================================
         SECTION 1: HERO / CREATIVE CANVAS (Active Canvas)
         ======================================================== -->
    <section class="hero-section relative overflow-hidden pt-14 sm:pt-22 lg:pt-26 pb-16 lg:pb-20 border-b border-black/[0.06]">
      <!-- Section-scoped grid background -->
      <div class="hero-grid absolute inset-0 pointer-events-none" />
      <!-- Ambient blooms (hero only) -->
      <div class="hero-bloom-1 absolute pointer-events-none" />
      <div class="hero-bloom-2 absolute pointer-events-none" />

      <div
        class="relative mx-auto w-full max-w-[1480px] min-h-[520px] sm:min-h-[600px] lg:min-h-[700px] flex items-center justify-center overflow-hidden touch-none"
        @pointerdown="onHeroPointerDown"
        @pointermove="onHeroPointerMove"
        @pointerup="onHeroPointerUp"
        @pointerleave="onHeroPointerUp"
        @pointercancel="onHeroPointerUp"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <!-- Center reference point -->
        <div class="relative w-0 h-0 flex items-center justify-center">
          <!-- Dynamic Loop of Cards -->
          <div
            v-for="(card, i) in heroCards"
            :key="card.id"
            class="absolute -translate-x-1/2 -translate-y-1/2 w-[280px] h-[370px] sm:w-[340px] sm:h-[460px] lg:w-[420px] lg:h-[560px] opacity-90 hover:opacity-100 will-change-transform"
            :style="getHeroCardStyle(i, heroCards.length)"
          >
            <div class="bg-white rounded-[24px] sm:rounded-[32px] border border-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.4)_inset] p-2 sm:p-2.5 flex flex-col relative w-full h-full select-none pointer-events-none">
              <!-- Top Tab -->
              <div class="absolute -top-4 sm:-top-5 left-6 sm:left-8 px-3 sm:px-4 py-1 bg-white border border-b-0 border-black/5 rounded-t-xl shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                <span class="text-[9px] font-semibold text-neutral-400 tracking-wider">{{ card.title }}</span>
              </div>

              <!-- Chrome -->
              <div class="flex items-center justify-between px-2 sm:px-3 pb-2 pt-1.5 shrink-0">
                <div class="flex items-center gap-1.5 sm:gap-2">
                  <span
                    v-for="(color, colorIdx) in card.colors"
                    :key="colorIdx"
                    class="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full"
                    :class="color"
                  />
                </div>
                <span class="text-[9px] sm:text-[10px] font-mono text-neutral-400">{{ card.num }}</span>
              </div>

              <!-- Image Area -->
              <div class="flex-1 overflow-hidden bg-neutral-100 rounded-[18px] sm:rounded-[24px]">
                <img
                  :src="card.img"
                  :alt="card.title"
                  class="h-full w-full object-cover"
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Central Overlapping CTA Object (Liquid Glass) -->
      <div class="absolute z-[100] bottom-10 sm:bottom-20 lg:bottom-[130px] left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] max-w-[820px] pointer-events-auto">
        <Transition
          appear
          name="liquid-popup"
        >
          <div
            class="liquid-glass-panel relative flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-8 p-5 sm:p-6 lg:py-7 lg:px-9"
            @pointerdown.stop
          >
            <div class="relative z-10 w-full sm:w-auto text-center sm:text-left">
              <p class="text-[16px] sm:text-[19px] lg:text-[22px] font-semibold text-[#1c1c1e] tracking-tight leading-snug">
                พร้อมเริ่มสร้างภาพในแบบของคุณ?
              </p>
              <p class="mt-1.5 text-[13px] sm:text-[14px] lg:text-[15px] text-neutral-500 font-medium">
                กำหนดรายละเอียดและเริ่มคำสั่งงานกับ COOS
              </p>
            </div>

            <NuxtLink
              to="/customer/orders/create"
              class="liquid-button relative z-10 w-full sm:w-auto inline-flex items-center justify-center rounded-[20px] px-8 h-[48px] sm:h-[54px] lg:h-[56px] text-[14px] sm:text-[16px] font-medium text-[#1c1c1e] shrink-0"
            >
              เริ่มสั่งงาน <span class="liquid-arrow ml-1.5">→</span>
            </NuxtLink>
          </div>
        </Transition>
      </div>
    </section>

    <!-- Brand Tagline Placed AFTER the Visual Canvas -->
    <div class="coos-shell mt-14 sm:mt-20 mb-8 sm:mb-10 lg:mb-12 text-center">
      <h2 class="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-[#171717] max-w-3xl mx-auto leading-tight flex flex-col items-center">
        <span
          class="reveal-init reveal-slide-left inline-block"
          style="--reveal-delay: 0ms"
        >เปลี่ยนไอเดียของคุณ</span>
        <span
          class="text-neutral-400 font-normal reveal-init reveal-slide-right inline-block mt-2 sm:mt-3"
          style="--reveal-delay: 100ms"
        >ให้กลายเป็นภาพที่ใช่</span>
      </h2>
      <p
        class="mt-4 sm:mt-5 text-sm sm:text-base text-neutral-500 max-w-lg mx-auto leading-relaxed reveal-init reveal-slide-up"
        style="--reveal-delay: 200ms"
      >
        สั่งงานง่าย ได้ภาพคุณภาพสูง ตรงตามความต้องการ ด้วยทีมงานมืออาชีพ
      </p>
    </div>

    <!-- ========================================================
         SECTION 2: SERVICE / WORK TYPE STRIP (Quiet horizontal)
         ======================================================== -->
    <section class="py-10 border-b border-black/[0.06] bg-[#FAFAF8] overflow-hidden">
      <div class="marquee-wrapper relative w-full px-4 sm:px-8">
        <div class="work-type-marquee-container flex items-center py-2">
          <!-- First Set -->
          <div class="flex items-center gap-12 sm:gap-16 shrink-0 pr-12 sm:pr-16">
            <template v-if="repeatedWorkTypes.length > 0">
              <template
                v-for="(typeName, idx) in repeatedWorkTypes"
                :key="`a-${idx}`"
              >
                <span class="text-[13px] sm:text-[14px] font-medium text-neutral-600 tracking-wide cursor-default whitespace-nowrap">
                  {{ typeName }}
                </span>
                <span class="text-neutral-300 text-[10px]">✦</span>
              </template>
            </template>
          </div>
          <!-- Second Set (Duplicate for seamless loop) -->
          <div
            class="flex items-center gap-12 sm:gap-16 shrink-0 pr-12 sm:pr-16"
            aria-hidden="true"
          >
            <template v-if="repeatedWorkTypes.length > 0">
              <template
                v-for="(typeName, idx) in repeatedWorkTypes"
                :key="`b-${idx}`"
              >
                <span class="text-[13px] sm:text-[14px] font-medium text-neutral-600 tracking-wide cursor-default whitespace-nowrap">
                  {{ typeName }}
                </span>
                <span class="text-neutral-300 text-[10px]">✦</span>
              </template>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================================
         SECTION 4.5: WORK EXPLORER
         ======================================================== -->
    <section
      v-if="featuredImages.length > 0"
      class="pt-24 pb-24 sm:pb-32 border-b border-black/[0.06] bg-[#FAFAFA]"
    >
      <div class="coos-shell max-w-[1020px] mx-auto flex flex-col items-center">
        <!-- Main Composition Layout (Thumbnails Left + Showcase Right) -->
        <div class="flex flex-col lg:flex-row gap-4 lg:gap-6 items-stretch w-full justify-center reveal-init relative">
          <!-- LEFT: Thumbnail Rail (Static Detail Views) -->
          <div class="flex lg:flex-col gap-3 overflow-x-auto hide-scrollbar w-full lg:w-[104px] shrink-0 lg:justify-center relative z-10 pointer-events-none">
            <div
              v-for="(detailSrc, idx) in currentExplorerSet.details"
              :key="'detail-'+idx"
              class="relative w-[96px] lg:w-full rounded-[16px] p-1.5 shrink-0 bg-white border border-black/[0.05] shadow-[0_4px_16px_rgba(0,0,0,0.03)] opacity-85"
            >
              <!-- Small top tab / label-like cap -->
              <div class="w-full flex justify-center pb-1.5 pt-0.5">
                <div class="w-4 h-0.5 rounded-full bg-neutral-200" />
              </div>

              <!-- Inner image area -->
              <div class="relative w-full aspect-[3/4] rounded-[8px] overflow-hidden bg-neutral-100">
                <transition name="explorer-fade" mode="out-in">
                  <img
                    :key="selectedExplorerIndex"
                    :src="detailSrc"
                    class="w-full h-full object-cover"
                    alt=""
                  >
                </transition>
              </div>
            </div>
          </div>

          <!-- Central Hub & Connectors (Desktop only, requires 3 items) -->
          <div
            v-if="featuredImages.length >= 3"
            class="hidden lg:flex flex-col justify-center items-center w-[24px] shrink-0 z-0 pointer-events-none -mx-2"
          >
            <!-- SVG curved lines linking the 3 thumbnails to the hub -->
            <div class="relative w-[24px] h-[400px]">
              <svg
                width="24"
                height="400"
                viewBox="0 0 24 400"
                fill="none"
                class="absolute inset-0 transition-all duration-500"
              >
                <!-- All 3 paths are subtly visible, connecting all details to the main image -->
                <path
                  d="M0,43 C 12,43 12,200 24,200"
                  stroke="#d4d4d4"
                  stroke-width="1.2"
                  class="opacity-70"
                />
                <path
                  d="M0,200 L 24,200"
                  stroke="#d4d4d4"
                  stroke-width="1.2"
                  class="opacity-70"
                />
                <path
                  d="M0,357 C 12,357 12,200 24,200"
                  stroke="#d4d4d4"
                  stroke-width="1.2"
                  class="opacity-70"
                />
              </svg>
              <!-- Hub Node -->
              <div class="absolute right-0 top-[200px] -translate-y-1/2 translate-x-[2px] w-[4px] h-[12px] rounded-full bg-neutral-300 border border-[#FAFAFA] shadow-sm z-10" />
            </div>
          </div>

          <!-- RIGHT: Main Framed Showcase Object -->
          <div class="flex-1 w-full max-w-[820px] p-1.5 lg:p-2 rounded-[20px] lg:rounded-[24px] border border-black/[0.06] bg-[#FCFCFC] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08),_0_0_0_1px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col isolate z-20 transition-all duration-500 relative after:absolute after:inset-0 after:rounded-[20px] lg:after:rounded-[24px] after:pointer-events-none after:ring-1 after:ring-inset after:ring-white/60">
            <!-- Top: Presentation Area -->
            <div class="relative w-full aspect-[4/3] lg:aspect-[16/10] bg-neutral-100 overflow-hidden isolate rounded-[14px] lg:rounded-[16px]">
              <transition
                name="explorer-fade"
                mode="out-in"
              >
                <div
                  :key="selectedExplorerIndex"
                  class="absolute inset-0 flex"
                >
                  <!-- Center Main Panel -->
                  <div class="w-full h-full overflow-hidden bg-white">
                    <img
                      :src="currentExplorerSet.main"
                      class="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                      alt=""
                    >
                  </div>
                </div>
              </transition>
              <!-- Delicate inset highlight for the visual area -->
              <div class="absolute inset-0 rounded-[14px] lg:rounded-[16px] pointer-events-none z-20 mix-blend-overlay shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] border border-black/[0.03]" />
            </div>
          </div>
        </div>

        <!-- Bottom: Category Pills -->
        <div
          v-if="curatedExplorerSets.length > 0"
          class="mt-6 lg:mt-8 flex flex-wrap items-center justify-center gap-1.5 reveal-init"
        >
          <button
            v-for="(set, idx) in curatedExplorerSets"
            :key="'nav-'+idx"
            class="px-3.5 py-1.5 rounded-full text-[11px] font-medium tracking-wide transition-all border"
            :class="[
              selectedExplorerIndex === idx
                ? 'bg-white border-neutral-200/80 text-neutral-900 shadow-sm'
                : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50'
            ]"
            @click="selectedExplorerIndex = idx"
          >
            {{ set.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- ========================================================
         SECTION 3: QUIET GALLERY INTRO (Scroll reveal)
         ======================================================== -->
    <section class="pt-24 sm:pt-32 pb-10">
      <div class="coos-shell text-center flex flex-col items-center">
        <p
          class="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 mb-3 font-mono reveal-init"
          style="--reveal-delay: 0ms"
        >
          SELECTED WORKS
        </p>
        <h2
          class="text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold tracking-tight text-[#171717] reveal-init"
          style="--reveal-delay: 100ms"
        >
          ทุกไอเดีย เริ่มจากภาพที่คุณชอบ
        </h2>
        <p
          class="mt-4 text-sm sm:text-base text-neutral-500 max-w-md mx-auto leading-relaxed reveal-init"
          style="--reveal-delay: 200ms"
        >
          สำรวจผลงานจากสตูดิโอ เพื่อค้นหาแนวทางสำหรับงานของคุณ
        </p>
        <div
          class="mt-6 reveal-init"
          style="--reveal-delay: 300ms"
        >
          <NuxtLink
            to="/gallery"
            class="inline-flex items-center text-sm font-medium text-[#171717] hover:text-neutral-600 transition-colors group focus-visible:outline-2 focus-visible:outline-neutral-900"
          >
            ดูแกลเลอรีทั้งหมด
            <span class="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ========================================================
         SECTION 4: GALLERY / FULL-BLEED GRID
         ======================================================== -->
    <section class="pb-24 sm:pb-32 border-b border-black/[0.06]">
      <div class="coos-shell max-w-[1180px] mx-auto">
        <!-- Loading State -->
        <div
          v-if="loading"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-7"
        >
          <div
            v-for="n in 3"
            :key="n"
            class="aspect-[4/5] rounded-[20px] bg-neutral-200 animate-pulse"
          />
        </div>

        <!-- Image-first Grid -->
        <div
          v-else-if="featuredImages.length > 0"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-7"
        >
          <div
            v-for="(img, idx) in featuredImages"
            :key="img.imageId"
            class="gallery-card-wrapper group relative isolate aspect-[4/5] cursor-pointer reveal-init"
            :style="{ '--reveal-delay': `${idx * 80}ms` }"
            tabindex="0"
            role="button"
            :aria-label="img.imageTitle || 'ดูรายละเอียดผลงาน'"
            @click="openDetails(img)"
            @keydown.enter="openDetails(img)"
            @keydown.space.prevent="openDetails(img)"
          >
            <!-- Atmospheric Rear Glow -->
            <div class="gallery-card-glow absolute opacity-0 pointer-events-none -z-10" />

            <!-- Main Card Container -->
            <div class="gallery-card-item relative w-full h-full overflow-hidden rounded-[20px] border border-black/[0.06] bg-neutral-100 shadow-[0_4px_16px_rgba(0,0,0,0.03)] z-10">
              <!-- Luminous Edge -->
              <div class="gallery-card-edge absolute inset-0 rounded-[20px] opacity-0 pointer-events-none z-20 transition-opacity duration-500" />

              <!-- Full-bleed Image -->
              <img
                :src="img.imageUrl"
                :alt="img.imageTitle || 'Gallery Work'"
                class="gallery-card-img h-full w-full object-cover"
              >

              <!-- Contrast Gradient Overlay -->
              <div class="gallery-card-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              <!-- Top Left: WorkType Badge -->
              <div
                v-if="img.workTypeName"
                class="absolute top-4 left-4 z-30"
              >
                <span class="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#171717] backdrop-blur-md shadow-sm">
                  {{ img.workTypeName }}
                </span>
              </div>

              <!-- Top Right: Detail Circular Indicator -->
              <div class="detail-indicator absolute top-4 right-4 z-30">
                <span class="flex items-center justify-center h-8 w-8 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-sm">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line
                      x1="7"
                      y1="17"
                      x2="17"
                      y2="7"
                    />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </span>
              </div>

              <!-- Bottom Content Info -->
              <div class="gallery-card-info absolute bottom-0 inset-x-0 p-4 sm:p-5 text-left text-white z-30">
                <h3 class="text-base sm:text-[17px] font-semibold tracking-tight text-white line-clamp-1">
                  {{ img.imageTitle || 'Untitled Work' }}
                </h3>
                <p
                  v-if="img.imageDescription"
                  class="mt-1 text-xs text-white/70 line-clamp-2 leading-relaxed font-light"
                >
                  {{ img.imageDescription }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="rounded-xl border border-black/[0.06] bg-white p-12 text-center"
        >
          <p class="text-sm text-neutral-500">
            สำรวจตัวอย่างผลงานเพื่อใช้เป็นแนวทางก่อนสร้างคำสั่งงาน
          </p>
        </div>
      </div>
    </section>

    <!-- ========================================================
         SECTION 5: QUIET PROCESS INTRO
         ======================================================== -->
    <section
      id="how-it-works"
      class="pt-20 sm:pt-28 pb-10 reveal-init"
    >
      <div class="coos-shell text-center">
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 mb-3 font-mono">
          HOW IT WORKS
        </p>
        <h2 class="text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold tracking-tight text-[#171717]">
          ง่ายตั้งแต่เลือกแนวภาพ จนถึงรับผลงาน
        </h2>
        <p class="mt-4 text-sm sm:text-base text-neutral-500 max-w-lg mx-auto leading-relaxed">
          เริ่มต้นจากไอเดีย ภาพอ้างอิง และรายละเอียดที่คุณต้องการ เพื่อให้ทีมงานเข้าใจทิศทางของงานได้ชัดเจน
        </p>
      </div>
    </section>

    <!-- ========================================================
         SECTION 6: GIANT PROCESS WINDOW (Interactive Presentation States)
         ======================================================== -->
    <section class="pb-24 sm:pb-32 border-b border-black/[0.06]">
      <div class="coos-shell reveal-init">
        <!-- Large Workspace Shell -->
        <div class="process-window mx-auto max-w-6xl">
          <!-- Window Chrome Header -->
          <div class="flex items-center justify-between border-b border-black/[0.06] px-5 sm:px-6 py-3.5 bg-neutral-50/80">
            <div class="flex items-center gap-2.5">
              <span class="h-3 w-3 rounded-full bg-neutral-300" />
              <span class="h-3 w-3 rounded-full bg-neutral-300" />
              <span class="h-3 w-3 rounded-full bg-neutral-300" />
            </div>
            <span class="text-xs font-mono text-neutral-400 uppercase tracking-widest">ขั้นตอนการทำงาน</span>
            <div class="text-[11px] font-mono text-neutral-400">
              STEP {{ processSteps[activeProcessStep]?.id }} / 04
            </div>
          </div>

          <!-- Main Stage Visual (Dominant) -->
          <div class="relative aspect-[16/9] sm:aspect-[21/9] bg-[#FAFAF8] overflow-hidden">
            <transition name="process-fade" mode="out-in">
              <img
                :key="activeProcessStep"
                :src="processSteps[activeProcessStep]?.img"
                alt="COOS Studio Production"
                class="h-full w-full object-cover object-center"
              >
            </transition>
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            <!-- Active Stage Text with Crossfade -->
            <transition
              name="process-fade"
              mode="out-in"
            >
              <div
                :key="activeProcessStep"
                class="absolute bottom-6 left-6 sm:left-8 text-white text-left max-w-md"
              >
                <div class="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider backdrop-blur-md mb-1.5">
                  <span>STEP {{ processSteps[activeProcessStep]?.id }}</span>
                </div>
                <h3 class="text-lg sm:text-xl font-semibold text-white">
                  {{ processSteps[activeProcessStep]?.stageTitle }}
                </h3>
                <p class="text-xs sm:text-sm text-white/80 mt-0.5">
                  {{ processSteps[activeProcessStep]?.stageDesc }}
                </p>
              </div>
            </transition>
          </div>
        </div>

        <!-- Detached Progress Connector -->
        <div class="mx-auto max-w-6xl mt-5 px-1">
          <div class="relative h-0.5 w-full bg-neutral-200/60 rounded-full overflow-hidden">
            <div
              class="process-progress-bar absolute top-0 bottom-0 left-0 bg-[#171717] rounded-full"
              :style="{ width: `${((activeProcessStep + 1) / 4) * 100}%` }"
            />
          </div>
        </div>

        <!-- Detached Process Tabs -->
        <div class="mx-auto max-w-6xl mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-1">
          <button
            v-for="(step, idx) in processSteps"
            :key="step.id"
            type="button"
            class="process-tab-card rounded-xl border p-5 text-left transition-all duration-300 relative focus-visible:outline-2 focus-visible:outline-neutral-900"
            :class="activeProcessStep === idx
              ? 'border-[#171717]/20 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]'
              : 'border-black/[0.06] bg-white/60 hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]'"
            @click="activeProcessStep = idx"
          >
            <!-- Active accent bar -->
            <span
              v-if="activeProcessStep === idx"
              class="absolute left-0 top-3 bottom-3 w-[3px] bg-[#756CE8] rounded-r-full"
            />
            <span
              class="text-xs font-mono transition-colors duration-200"
              :class="activeProcessStep === idx ? 'text-[#756CE8] font-bold' : 'text-neutral-400'"
            >
              {{ step.id }}
            </span>
            <h4
              class="text-sm font-semibold mt-2 transition-colors duration-200"
              :class="activeProcessStep === idx ? 'text-[#171717]' : 'text-neutral-700'"
            >
              {{ step.title }}
            </h4>
            <p class="text-xs text-neutral-500 mt-1 leading-relaxed">
              {{ step.desc }}
            </p>
          </button>
        </div>
      </div>
    </section>

    <!-- ========================================================
         SECTION 7: CINEMATIC ART BREAK (Visual Breath)
         ======================================================== -->
    <!-- <section class="py-10 sm:py-16 border-b border-black/[0.06] bg-[#FAFAF8]">
      <div class="coos-shell reveal-init">
        <div class="mx-auto max-w-6xl overflow-hidden rounded-2xl">
          <div class="relative aspect-[16/9] sm:aspect-[24/9] overflow-hidden bg-neutral-100">
            <img
              src="~/assets/images/public/home/coos-cinematic-landscape.png"
              alt="Cinematic Landscape"
              class="h-full w-full object-cover object-center"
            >
          </div>
        </div>
      </div>
    </section> -->

    <!-- ========================================================
         SECTION 8: QUIET PACKAGE INTRO
         ======================================================== -->
    <section
      id="packages"
      class="pt-20 sm:pt-28 pb-10 reveal-init"
    >
      <div class="coos-shell text-center">
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 mb-3 font-mono">
          PACKAGES
        </p>
        <h2 class="text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold tracking-tight text-[#171717]">
          เลือกแพ็กเกจที่เหมาะกับงานของคุณ
        </h2>
        <p class="mt-4 text-sm sm:text-base text-neutral-500 max-w-lg mx-auto leading-relaxed">
          เลือกแพ็กเกจตามจำนวนภาพ ความละเอียด และระยะเวลาส่งมอบที่เหมาะกับงานของคุณ
        </p>
      </div>
    </section>

    <!-- ========================================================
         SECTION 9: SINGLE PRICING FRAME
         ======================================================== -->
    <section class="pb-24 sm:pb-32 border-b border-black/[0.06]">
      <div class="coos-shell reveal-init">
        <div class="creative-window mx-auto max-w-5xl overflow-hidden bg-white shadow-[0_16px_48px_rgba(0,0,0,0.05)]">
          <!-- Frame Header -->
          <div class="flex items-center justify-between border-b border-black/[0.06] px-5 py-3 bg-neutral-50/80">
            <div class="flex items-center gap-2">
              <span class="h-2.5 w-2.5 rounded-full bg-neutral-300" />
              <span class="h-2.5 w-2.5 rounded-full bg-neutral-300" />
              <span class="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            </div>
            <span class="text-xs font-mono text-neutral-400 uppercase tracking-widest">ตารางแพ็กเกจ</span>
            <div class="text-[11px] font-mono text-neutral-400">
              {{ packages.length }} รายการ
            </div>
          </div>

          <!-- Loading State -->
          <div
            v-if="loading"
            class="p-8 space-y-4"
          >
            <div
              v-for="n in 3"
              :key="n"
              class="h-16 bg-neutral-100 rounded-xl animate-pulse"
            />
          </div>

          <!-- Package Rows -->
          <div
            v-else-if="packages.length > 0"
            class="divide-y divide-black/[0.06]"
          >
            <div
              v-for="pkg in packages"
              :key="pkg.packageId"
              class="pricing-row group/row p-5 sm:p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-left"
            >
              <!-- Col 1: Tier Name & Description -->
              <div class="lg:w-1/3">
                <h3 class="text-xl font-semibold text-[#171717] group-hover/row:text-black transition-colors">
                  {{ pkg.packageName }}
                </h3>
                <p class="text-xs text-neutral-500 mt-1 leading-relaxed line-clamp-2">
                  {{ pkg.packageDescription || 'ไม่มีคำอธิบายเพิ่มเติม' }}
                </p>
              </div>

              <!-- Col 2: Specifications Matrix -->
              <div class="grid grid-cols-3 gap-4 text-left lg:w-1/3 border-y sm:border-y-0 sm:border-x border-black/[0.05] py-3 sm:py-0 sm:px-4">
                <div>
                  <span class="text-[10px] font-mono uppercase text-neutral-400">ภาพส่งมอบ</span>
                  <p class="text-xs sm:text-sm font-semibold text-[#171717] mt-0.5">
                    {{ pkg.packageImageCount }} ภาพ
                  </p>
                </div>
                <div>
                  <span class="text-[10px] font-mono uppercase text-neutral-400">ความละเอียด</span>
                  <p class="text-xs sm:text-sm font-semibold text-[#171717] mt-0.5 truncate">
                    {{ formatResolution(pkg.packageResolution) }}
                  </p>
                </div>
                <div>
                  <span class="text-[10px] font-mono uppercase text-neutral-400">ระยะเวลา</span>
                  <p class="text-xs sm:text-sm font-semibold text-[#171717] mt-0.5">
                    {{ pkg.packageDeliveryDays }} วัน
                  </p>
                </div>
              </div>

              <!-- Col 3: Price & Action CTA -->
              <div class="flex items-center justify-between lg:justify-end gap-6 lg:w-1/3">
                <div class="text-left lg:text-right">
                  <div class="flex items-baseline gap-1">
                    <span class="text-2xl font-semibold text-[#171717]">
                      {{ Math.round(pkg.packagePrice).toLocaleString() }}
                    </span>
                    <span class="text-xs font-semibold text-neutral-500">THB</span>
                  </div>
                </div>

                <NuxtLink
                  :to="`/customer/orders/create?packageId=${pkg.packageId}`"
                  class="pricing-cta-button inline-flex items-center justify-center rounded-xl bg-[#171717] px-5 py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm shrink-0 focus-visible:outline-2 focus-visible:outline-neutral-900"
                >
                  <span>เลือกแพ็กเกจ</span>
                  <span class="pricing-arrow ml-1">→</span>
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="p-12 text-center text-neutral-500 text-sm"
          >
            ไม่มีข้อมูลแพ็กเกจในขณะนี้
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================================
         SECTION 10: BRAND STATEMENT (Quiet, Scroll Reveal)
         ======================================================== -->
    <section class="py-24 sm:py-36 text-center border-b border-black/[0.06] reveal-init">
      <div class="coos-shell max-w-3xl">
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-neutral-400 mb-6 font-mono">
          COOS STUDIO
        </p>
        <blockquote class="text-2xl sm:text-4xl font-semibold tracking-tight text-[#171717] leading-snug sm:leading-tight">
          "ทุกงานเริ่มจากรายละเอียดที่ชัดเจน"
        </blockquote>
        <p class="mt-6 text-sm sm:text-base text-neutral-500 leading-relaxed max-w-lg mx-auto">
          COOS เชื่อมการเลือกแนวภาพ แพ็กเกจ รายละเอียดคำสั่งงาน และขั้นตอนการตรวจรับไว้ในกระบวนการเดียว
        </p>
      </div>
    </section>

    <!-- ========================================================
         SECTION 11: CLOSING CANVAS (Active Canvas)
         ======================================================== -->
    <section class="closing-section relative overflow-hidden py-28 sm:py-36">
      <!-- Section-scoped grid -->
      <div class="closing-grid absolute inset-0 pointer-events-none" />
      <!-- Ambient bloom -->
      <div class="closing-bloom-1 absolute pointer-events-none" />

      <div class="coos-shell relative z-10 max-w-5xl">
        <!-- Floating Scattered Visuals around Canvas Edges -->
        <div class="relative min-h-[360px] sm:min-h-[420px] flex items-center justify-center">
          <!-- Panel 1: Fashion Editorial (Closing Drift 1) -->
          <div class="creative-window closing-drift-1 absolute -left-6 sm:left-2 top-0 z-0 w-[140px] sm:w-[190px] opacity-80 hidden sm:block">
            <div class="aspect-[2/3] overflow-hidden bg-neutral-100 p-1">
              <img
                src="~/assets/images/public/home/coos-fashion-editorial.png"
                alt="Editorial Visual"
                class="h-full w-full object-cover rounded-lg"
              >
            </div>
          </div>

          <!-- Panel 2: Floating Portrait (Closing Drift 2) -->
          <div class="creative-window closing-drift-2 absolute -right-6 sm:right-2 bottom-0 z-0 w-[150px] sm:w-[200px] opacity-80 hidden sm:block">
            <div class="aspect-[4/5] overflow-hidden bg-neutral-100 p-1">
              <img
                src="~/assets/images/public/home/coos-floating-portrait.png"
                alt="Portrait Visual"
                class="h-full w-full object-cover rounded-lg"
              >
            </div>
          </div>

          <!-- Panel 3: Abstract accent (Closing Drift 3) -->
          <div class="creative-window closing-drift-3 absolute left-[12%] -bottom-4 z-0 w-[100px] sm:w-[130px] opacity-60 hidden lg:block">
            <div class="aspect-square overflow-hidden bg-neutral-100 p-1">
              <img
                src="~/assets/images/public/home/coos-abstract-colorfield.png"
                alt=""
                class="h-full w-full object-cover rounded-lg"
              >
            </div>
          </div>

          <!-- Panel 4: Real Gallery Image (Closing Drift 4) -->
          <div
            v-if="featuredImages[2]"
            class="creative-window closing-drift-4 absolute right-[10%] -top-6 z-0 w-[120px] sm:w-[160px] opacity-70 hidden lg:block"
          >
            <div class="aspect-[3/4] overflow-hidden bg-neutral-100 p-1">
              <img
                :src="featuredImages[2].imageUrl"
                :alt="featuredImages[2].imageTitle || 'Gallery Work'"
                class="h-full w-full object-cover rounded-lg"
              >
            </div>
          </div>

          <!-- Central Message & Actions -->
          <div class="relative z-20 text-center max-w-xl mx-auto px-4 reveal-init">
            <h2 class="text-3xl sm:text-5xl font-semibold tracking-tight text-[#171717] leading-tight">
              พร้อมเริ่มสร้างภาพ<br>
              <span class="text-neutral-400 font-normal">ในแบบของคุณ?</span>
            </h2>
            <p class="mt-4 text-sm sm:text-base text-neutral-500 leading-relaxed max-w-md mx-auto">
              เริ่มต้นคำสั่งงาน เลือกแพ็กเกจ และส่งรายละเอียดให้ทีมงาน
            </p>
            <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <NuxtLink
                to="/customer/orders/create"
                class="cta-button-hover inline-flex items-center justify-center rounded-xl bg-[#171717] px-7 py-3.5 text-sm font-medium text-white shadow-sm w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-neutral-900"
              >
                เริ่มสั่งงาน →
              </NuxtLink>
              <NuxtLink
                to="/gallery"
                class="inline-flex items-center justify-center rounded-xl border border-black/10 bg-white px-6 py-3.5 text-sm font-medium text-[#171717] transition-all hover:bg-neutral-50 w-full sm:w-auto focus-visible:outline-2 focus-visible:outline-neutral-900"
              >
                ดูแกลเลอรี
              </NuxtLink>
            </div>
          </div>
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
/* ========================================================
   SECTION-SCOPED GRID & AMBIENT BLOOMS
   (Hero + Closing Canvas only — quiet sections stay clean)
   ======================================================== */
.hero-grid,
.closing-grid {
  background-size: 48px 48px;
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.025) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.025) 1px, transparent 1px);
}

.hero-bloom-1 {
  width: 600px;
  height: 600px;
  top: -100px;
  left: -200px;
  background: radial-gradient(circle, hsla(250, 60%, 92%, 0.35) 0%, transparent 70%);
  border-radius: 50%;
  animation: bloom-drift-1 30s ease-in-out infinite;
}

.hero-bloom-2 {
  width: 500px;
  height: 500px;
  bottom: -100px;
  right: -150px;
  background: radial-gradient(circle, hsla(340, 50%, 93%, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: bloom-drift-2 34s ease-in-out infinite;
}

.closing-bloom-1 {
  width: 500px;
  height: 500px;
  top: calc(50% - 250px);
  left: calc(50% - 250px);
  background: radial-gradient(circle, hsla(250, 60%, 92%, 0.25) 0%, transparent 70%);
  border-radius: 50%;
  animation: bloom-drift-1 32s ease-in-out infinite;
}

@keyframes bloom-drift-1 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -15px); }
}

@keyframes bloom-drift-2 {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-15px, 10px); }
}

/* ========================================================
   CREATIVE WINDOW STRUCTURE
   ======================================================== */
.creative-window {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 20px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (min-width: 1024px) {
  .creative-window:hover {
    transform: translateY(-3px) scale(1.005);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03);
  }
}

/* Centerpiece tab protrusion */
.centerpiece-chrome::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 20px;
  width: 60px;
  height: 8px;
  background: #f5f5f3;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-bottom: none;
  border-radius: 6px 6px 0 0;
}

/* Process window (larger, thicker shell) */
.process-window {
  background: #ffffff;
  border: 2px solid rgba(0, 0, 0, 0.06);
  border-radius: 24px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}

/* ========================================================
   SCROLL REVEAL (One-time IntersectionObserver)
   ======================================================== */
.reveal-init {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, transform;
}

.reveal-init.is-revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Ambient canvas background pulse */
.ambient-pulse {
  animation: ambient-pulse-anim 16s ease-in-out infinite;
}
@keyframes ambient-pulse-anim {
  0%, 100% {
    opacity: 0.18;
  }
  50% {
    opacity: 0.26;
  }
}

/* ========================================================
   CLOSING CANVAS DRIFTS
   ======================================================== */
.closing-drift-1 {
  animation: closing-drift-1-anim 22s ease-in-out infinite;
}
@keyframes closing-drift-1-anim {
  0%, 100% {
    transform: translate(0, 0) rotate(-4deg);
  }
  50% {
    transform: translate(8px, -10px) rotate(-3deg);
  }
}

.closing-drift-2 {
  animation: closing-drift-2-anim 26s ease-in-out infinite;
}
@keyframes closing-drift-2-anim {
  0%, 100% {
    transform: translate(0, 0) rotate(4deg);
  }
  50% {
    transform: translate(-10px, 8px) rotate(5deg);
  }
}

.closing-drift-3 {
  animation: closing-drift-3-anim 19s ease-in-out infinite;
}
@keyframes closing-drift-3-anim {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(6px, -8px);
  }
}

.closing-drift-4 {
  animation: closing-drift-4-anim 24s ease-in-out infinite;
}
@keyframes closing-drift-4-anim {
  0%, 100% {
    transform: translate(0, 0) rotate(-2deg);
  }
  50% {
    transform: translate(-8px, 6px) rotate(-1deg);
  }
}

/* ========================================================
   HOVER & INTERACTION MICRO-ANIMATIONS
   ======================================================== */
/* ========================================================
   LIQUID GLASS CTA STYLES
   ======================================================== */
.liquid-glass-panel {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 28px;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.08),
    0 16px 32px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.4) inset,
    inset 0 2px 4px rgba(255, 255, 255, 0.8),
    inset 0 -2px 6px rgba(0, 0, 0, 0.02);
}
.liquid-glass-panel::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 4px 12px rgba(255, 255, 255, 0.9);
  pointer-events: none;
}
.liquid-glass-panel::after {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 30px;
  background: linear-gradient(135deg, rgba(230, 220, 255, 0.4), rgba(255, 255, 255, 0) 50%, rgba(200, 230, 255, 0.3));
  z-index: -1;
  filter: blur(8px);
  pointer-events: none;
}

/* Liquid Button */
.liquid-button {
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow:
    0 4px 12px rgba(180, 190, 255, 0.25),
    inset 0 2px 4px rgba(255, 255, 255, 1),
    inset 0 -1px 2px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.2s cubic-bezier(0.22, 1, 0.36, 1), background 0.2s ease;
}
.liquid-button::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}
.liquid-arrow {
  display: inline-block;
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.liquid-button:hover {
  transform: translateY(-1px) scale(1.02);
  background: rgba(255, 255, 255, 0.85);
  box-shadow:
    0 8px 20px rgba(180, 190, 255, 0.35),
    inset 0 2px 4px rgba(255, 255, 255, 1),
    inset 0 -1px 2px rgba(0, 0, 0, 0.03);
}
.liquid-button:hover .liquid-arrow {
  transform: translateX(4px);
}
.liquid-button:active {
  transform: translateY(1px) scale(0.99);
  box-shadow:
    0 2px 8px rgba(180, 190, 255, 0.2),
    inset 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* Liquid Popup Entrance */
.liquid-popup-enter-active {
  transition: opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1), transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: 150ms;
}
.liquid-popup-enter-from {
  opacity: 0;
  transform: translateY(14px) scale(0.96);
}
.liquid-popup-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Service chips */
.service-chip {
  transition: opacity 0.18s ease, transform 0.18s ease, color 0.18s ease;
}
.service-chip:hover {
  transform: translateY(-1px);
  color: #171717;
}

/* Gallery Card Hover */
.gallery-card-wrapper {
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.gallery-card-item {
  transition: box-shadow 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}
.gallery-card-img {
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.gallery-card-overlay {
  opacity: 0.7;
  transition: opacity 0.5s ease;
}
.gallery-card-edge {
  border: 1.5px solid transparent;
  background: linear-gradient(
    135deg,
    rgba(196, 181, 253, 0.95),
    rgba(244, 180, 255, 0.85),
    rgba(186, 230, 253, 0.8)
  ) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
.gallery-card-glow {
  inset: -40px -40px -50px -40px;
  border-radius: 40px;
  background:
    radial-gradient(
      ellipse at 50% 45%,
      rgba(232, 190, 255, 0.95) 0%,
      rgba(245, 190, 225, 0.75) 30%,
      rgba(210, 200, 255, 0.6) 52%,
      rgba(235, 215, 255, 0.3) 68%,
      transparent 82%
    ),
    radial-gradient(
      ellipse at 50% 90%,
      rgba(255, 180, 220, 0.8) 0%,
      transparent 65%
    );
  filter: blur(50px);
  transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), filter 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.detail-indicator {
  opacity: 0;
  transform: translateY(4px) scale(0.9);
  transition: opacity 0.35s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.gallery-card-info {
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.gallery-card-wrapper:hover {
  transform: translateY(-6px) scale(1.015);
  z-index: 40;
}
.gallery-card-wrapper:hover .gallery-card-item {
  box-shadow:
    0 18px 45px rgba(185, 160, 255, 0.16),
    0 0 22px rgba(232, 190, 255, 0.20);
}
.gallery-card-wrapper:hover .gallery-card-glow {
  opacity: 1;
}
.gallery-card-wrapper:hover .gallery-card-edge {
  opacity: 1;
}
.gallery-card-wrapper:hover .gallery-card-img {
  transform: scale(1.025);
}
.gallery-card-wrapper:hover .gallery-card-overlay {
  opacity: 0.85;
}
.gallery-card-wrapper:hover .detail-indicator {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.gallery-card-wrapper:hover .gallery-card-info {
  transform: translateY(-2px);
}

/* Explorer Transition */
.explorer-fade-enter-active,
.explorer-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.explorer-fade-enter-from {
  opacity: 0;
  transform: translateY(4px) scale(0.995);
}
.explorer-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.995);
}
@media (prefers-reduced-motion: reduce) {
  .explorer-fade-enter-active,
  .explorer-fade-leave-active {
    transition: opacity 0.4s ease;
  }
  .explorer-fade-enter-from,
  .explorer-fade-leave-to {
    transform: none;
  }
}

/* Process Window State Transition */
.process-fade-enter-active,
.process-fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.process-fade-enter-from {
  opacity: 0;
  transform: translateX(6px) translateY(4px);
}
.process-fade-leave-to {
  opacity: 0;
  transform: translateX(-6px) translateY(-4px);
}

.process-progress-bar {
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Process Tab Card */
.process-tab-card {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Pricing Row Hover */
.pricing-row {
  transition: background-color 0.2s ease;
}
.pricing-row:hover {
  background-color: rgba(245, 245, 243, 0.75);
}
.pricing-cta-button {
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}
.pricing-arrow {
  display: inline-block;
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.pricing-row:hover .pricing-cta-button {
  background-color: #292929;
}
.pricing-row:hover .pricing-arrow {
  transform: translateX(3px);
}

/* Hide scrollbar for category strip */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* ========================================================
   PROGRESSIVE TOP BLUR
   ======================================================== */
.progressive-blur-layer {
  backdrop-filter: blur(22px) saturate(1.08);
  -webkit-backdrop-filter: blur(22px) saturate(1.08);
  background: rgba(250, 249, 247, 0.12);
  mask-image: linear-gradient(
    to bottom,
    #000 0%,
    rgba(0,0,0,0.98) 18%,
    rgba(0,0,0,0.78) 45%,
    rgba(0,0,0,0.38) 72%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0%,
    rgba(0,0,0,0.98) 18%,
    rgba(0,0,0,0.78) 45%,
    rgba(0,0,0,0.38) 72%,
    transparent 100%
  );
}

.progressive-blur-layer::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(250, 249, 247, 0.22), rgba(250, 249, 247, 0.06) 55%, transparent);
  pointer-events: none;
}

/* ========================================================
   TEXT SLIDE REVEALS
   ======================================================== */
.reveal-slide-left {
  transform: translateX(-24px);
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal-slide-right {
  transform: translateX(24px);
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal-slide-up {
  transform: translateY(10px);
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal-slide-left.is-revealed, .reveal-slide-right.is-revealed, .reveal-slide-up.is-revealed {
  transform: translateX(0) translateY(0);
}

/* ========================================================
   WORK TYPE MARQUEE
   ======================================================== */
.marquee-wrapper {
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    rgba(0,0,0,0.15) 5%,
    rgba(0,0,0,0.65) 20%,
    black 35%,
    black 65%,
    rgba(0,0,0,0.65) 80%,
    rgba(0,0,0,0.15) 95%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    rgba(0,0,0,0.15) 5%,
    rgba(0,0,0,0.65) 20%,
    black 35%,
    black 65%,
    rgba(0,0,0,0.65) 80%,
    rgba(0,0,0,0.15) 95%,
    transparent 100%
  );
}

.work-type-marquee-container {
  display: flex;
  width: max-content;
  /* Premium, very slow continuous scroll (approx 18-24 px/sec) */
  animation: marquee-scroll 700s linear infinite;
  /* Soften the overall text contrast slightly to feel more editorial */
  opacity: 0.9;
}

@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@media (max-width: 768px) {
  .work-type-marquee-container {
    /* Reduce speed further on mobile for better readability */
    animation-duration: 75s;
  }
}

/* ========================================================
   PREFERS-REDUCED-MOTION (Accessibility Compliance)
   ======================================================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .reveal-init,
  .reveal-slide-left,
  .reveal-slide-right,
  .reveal-slide-up {
    opacity: 1 !important;
    transform: none !important;
  }

  .ambient-pulse,
  .closing-drift-1,
  .closing-drift-2,
  .closing-drift-3,
  .closing-drift-4,
  .hero-bloom-1,
  .hero-bloom-2,
  .closing-bloom-1,
  .work-type-marquee-container {
    animation: none !important;
    transform: none !important;
  }
}
</style>
