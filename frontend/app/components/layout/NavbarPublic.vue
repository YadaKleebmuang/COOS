<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '~/composables/useApi'

const token = useCookie<string | null>('token')
const router = useRouter()
const route = useRoute()
const { apiFetch } = useApi()

type PublicUser = {
  userId?: number
  userFirstName?: string
  userLastName?: string
  userEmail?: string
  userProfileImage?: string
  userRole?: string
}

const currentUser = ref<PublicUser | null>(null)
const { protectedAssetUrl, syncProtectedAssets } = useProtectedAsset()
const profileEndpoint = (userId: number) => `/media/users/${userId}/profile`
const userRole = useCookie<string | null>('userRole')
const dropdownOpen = ref(false)
const mobileMenuOpen = ref(false)
const activeSection = ref('home')

let observer: IntersectionObserver | null = null

const checkAuth = async () => {
  if (token.value) {
    try {
      const data = await apiFetch<PublicUser>('/users/me')
      currentUser.value = data
      await syncProtectedAssets(data.userProfileImage && data.userId != null ? [profileEndpoint(data.userId)] : [])
    } catch (err) {
      console.error('Auth check failed in Navbar:', err)
      token.value = null
      currentUser.value = null
    }
  }
}

const isCustomer = computed(() => currentUser.value?.userRole === 'customer' || userRole.value === 'customer')

const displayName = computed(() => {
  const first = currentUser.value?.userFirstName || ''
  const last = currentUser.value?.userLastName || ''
  return `${first} ${last}`.trim() || currentUser.value?.userEmail || 'Customer'
})

const userInitial = computed(() => {
  return currentUser.value?.userFirstName?.[0]?.toUpperCase() || 'C'
})

const toggleDropdown = (e: Event) => {
  e.stopPropagation()
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const logout = async () => {
  await useAuth().logout()
  currentUser.value = null
  dropdownOpen.value = false
  router.push('/')
  // Reload current page if already on root to refresh states
  if (router.currentRoute.value.path === '/') {
    window.location.reload()
  }
}

const handleScroll = () => {
  if (route.path === '/' && window.scrollY < 150) {
    activeSection.value = 'home'
  }
}

onMounted(() => {
  checkAuth()
  window.addEventListener('click', closeDropdown)
  window.addEventListener('scroll', handleScroll)

  // Close mobile menu on window resize if crossing md breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) mobileMenuOpen.value = false
  })

  // Set up intersection observer for scroll spy
  const options = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id
      }
    })
  }, options)

  const observeElements = () => {
    const howItWorksEl = document.getElementById('how-it-works')
    const packagesEl = document.getElementById('packages')
    if (howItWorksEl) observer?.observe(howItWorksEl)
    if (packagesEl) observer?.observe(packagesEl)
  }

  // Delay slightly to ensure DOM elements are loaded
  setTimeout(observeElements, 500)

  // Watch hash/route changes
  watch(
    () => [route.path, route.hash],
    ([path, hash]) => {
      if (path !== '/') {
        activeSection.value = (path as string).replace('/', '')
      } else {
        if (!hash) {
          if (window.scrollY < 300) {
            activeSection.value = 'home'
          }
        } else {
          activeSection.value = (hash as string).replace('#', '')
        }
      }
    },
    { immediate: true }
  )
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeDropdown)
  window.removeEventListener('scroll', handleScroll)
  observer?.disconnect()
})
</script>

<template>
  <header class="fixed inset-x-0 top-4 z-[200] px-4 sm:px-5 lg:px-8 pointer-events-none">
    <div class="liquid-glass-nav pointer-events-auto mx-auto relative flex h-[58px] w-full items-center justify-between gap-4 px-3 sm:px-4 md:w-fit md:max-w-[calc(100vw-3rem)] lg:px-5">
      <!-- Logo -->
      <NuxtLink
        to="/"
        class="flex flex-col leading-none text-black min-w-[90px]"
      >
        <span class="text-xl font-semibold tracking-[0.24em]">COOS</span>
        <span class="mt-1 text-[7px] font-medium tracking-[0.48em]">STUDIO</span>
      </NuxtLink>

      <!-- Navigation Links (Capsule shape matching Liquid Glass style) -->
      <nav class="hidden items-center gap-1 rounded-[22px] bg-[#f8f8f8]/40 p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03),0_1px_0_rgba(255,255,255,0.5)] md:flex">
        <NuxtLink
          to="/"
          class="rounded-[18px] px-4 py-2 text-[13px] font-medium transition-all duration-200 lg:px-5"
          :class="[activeSection === 'home' ? 'bg-white/70 text-[#171717] shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.9)] font-semibold' : 'text-[#666666] hover:bg-white/40 hover:text-[#171717]']"
        >
          หน้าแรก
        </NuxtLink>
        <NuxtLink
          to="/gallery"
          class="rounded-[18px] px-4 py-2 text-[13px] font-medium transition-all duration-200 lg:px-5"
          :class="[activeSection === 'gallery' ? 'bg-white/70 text-[#171717] shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.9)] font-semibold' : 'text-[#666666] hover:bg-white/40 hover:text-[#171717]']"
        >
          ผลงาน
        </NuxtLink>
        <NuxtLink
          to="/#how-it-works"
          class="rounded-[18px] px-4 py-2 text-[13px] font-medium transition-all duration-200 lg:px-5"
          :class="[activeSection === 'how-it-works' ? 'bg-white/70 text-[#171717] shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.9)] font-semibold' : 'text-[#666666] hover:bg-white/40 hover:text-[#171717]']"
        >
          ขั้นตอนการสั่งงาน
        </NuxtLink>
        <NuxtLink
          to="/#packages"
          class="rounded-[18px] px-4 py-2 text-[13px] font-medium transition-all duration-200 lg:px-5"
          :class="[activeSection === 'packages' ? 'bg-white/70 text-[#171717] shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.9)] font-semibold' : 'text-[#666666] hover:bg-white/40 hover:text-[#171717]']"
        >
          บริการ
        </NuxtLink>
        <NuxtLink
          to="/policy"
          class="rounded-[18px] px-4 py-2 text-[13px] font-medium transition-all duration-200 lg:px-5"
          :class="[activeSection === 'policy' ? 'bg-white/70 text-[#171717] shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.9)] font-semibold' : 'text-[#666666] hover:bg-white/40 hover:text-[#171717]']"
        >
          เกี่ยวกับเรา
        </NuxtLink>
      </nav>

      <!-- User / Auth Actions -->
      <div class="flex items-center gap-3">
        <template v-if="currentUser">
          <!-- Logged in Customer -->
          <div
            v-if="isCustomer"
            class="flex items-center gap-2 sm:gap-3"
          >
            <NuxtLink
              to="/customer/orders"
              class="hidden h-11 items-center justify-center rounded-xl bg-[#171717] px-[18px] text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-[#292929] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25 sm:inline-flex"
            >
              งานของฉัน
            </NuxtLink>

            <div class="relative">
              <button
                class="flex h-11 items-center gap-2 rounded-full border border-black/[0.06] bg-white px-1.5 pr-3 text-sm font-semibold text-[#171717] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-all duration-200 hover:bg-[#F3F3F1] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25"
                aria-label="เปิดเมนูบัญชีลูกค้า"
                @click="toggleDropdown"
              >
                <span class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#171717] text-xs font-semibold text-white ring-2 ring-white/80">
                  <img
                    v-if="currentUser.userProfileImage"
                    :src="currentUser.userId != null ? protectedAssetUrl(profileEndpoint(currentUser.userId)) : ''"
                    class="h-full w-full object-cover"
                    alt=""
                  >
                  <span v-else>{{ userInitial }}</span>
                </span>
                <span class="hidden max-w-[118px] truncate sm:inline">{{ currentUser.userFirstName || 'Customer' }}</span>
                <svg
                  class="h-3.5 w-3.5 text-[#666666]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95 translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 translate-y-1"
              >
                <div
                  v-if="dropdownOpen"
                  class="fixed left-1/2 top-20 z-50 w-[calc(100vw-32px)] max-w-[320px] -translate-x-1/2 rounded-[14px] border border-black/[0.06] bg-white py-2 shadow-[0_16px_48px_rgba(0,0,0,0.08)] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-64 sm:max-w-none sm:translate-x-0 sm:origin-top-right"
                  @click.stop
                >
                  <div class="border-b border-black/5 px-4 py-3">
                    <p class="truncate text-sm font-semibold text-[#171717]">
                      {{ displayName }}
                    </p>
                    <p class="truncate text-[11px] text-[#929292]">
                      {{ currentUser.userEmail }}
                    </p>
                  </div>

                  <div class="py-1">
                    <NuxtLink
                      to="/customer/dashboard"
                      class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#666666] transition-colors hover:bg-[#F3F3F1] hover:text-[#171717] focus:bg-[#F3F3F1] focus:text-[#171717] focus:outline-none"
                      @click="closeDropdown"
                    >
                      <svg
                        class="h-4 w-4 text-[#929292]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M3 12l9-9 9 9M5 10v10h14V10"
                        />
                      </svg>
                      แดชบอร์ด
                    </NuxtLink>
                    <NuxtLink
                      to="/customer/profile"
                      class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#666666] transition-colors hover:bg-[#F3F3F1] hover:text-[#171717] focus:bg-[#F3F3F1] focus:text-[#171717] focus:outline-none"
                      @click="closeDropdown"
                    >
                      <svg
                        class="h-4 w-4 text-[#929292]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      โปรไฟล์
                    </NuxtLink>
                  </div>

                  <div class="border-t border-black/[0.06] pt-1">
                    <button
                      class="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#666666] transition-colors hover:bg-[#FDEEEE] hover:text-[#B93B3B] focus:bg-[#FDEEEE] focus:text-[#B93B3B] focus:outline-none"
                      @click="logout"
                    >
                      <svg
                        class="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Logged in Staff (Admin/Editor) -->
          <div
            v-else
            class="flex items-center gap-3"
          >
            <span class="hidden text-sm font-medium text-neutral-500 lg:inline">
              สวัสดี, {{ currentUser.userFirstName }}
            </span>
            <div class="relative">
              <button
                class="flex h-11 items-center gap-2 rounded-full border border-black/[0.06] bg-white px-1.5 pr-3 text-sm font-semibold text-[#171717] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-all duration-200 hover:bg-[#F3F3F1] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25"
                @click="toggleDropdown"
              >
                <span class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#171717] text-xs font-semibold text-white ring-2 ring-white/80">
                  {{ userInitial }}
                </span>
                <span class="hidden max-w-[118px] truncate sm:inline">{{ currentUser.userFirstName }}</span>
                <svg
                  class="h-3.5 w-3.5 text-[#666666]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95 translate-y-1"
                enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 translate-y-1"
              >
                <div
                  v-if="dropdownOpen"
                  class="absolute right-0 z-50 mt-3 w-56 origin-top-right rounded-[14px] border border-black/[0.06] bg-white py-2 shadow-[0_16px_48px_rgba(0,0,0,0.08)]"
                  @click.stop
                >
                  <div class="border-b border-black/5 px-4 py-3">
                    <p class="truncate text-sm font-semibold text-neutral-950">
                      {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
                    </p>
                    <p class="truncate text-[11px] text-neutral-400">
                      {{ currentUser.userEmail }}
                    </p>
                  </div>

                  <div class="py-1">
                    <NuxtLink
                      to="/customer/orders"
                      class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                      @click="closeDropdown"
                    >
                      ประวัติออเดอร์
                    </NuxtLink>
                    <NuxtLink
                      to="/customer/profile"
                      class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                      @click="closeDropdown"
                    >
                      แก้ไขโปรไฟล์
                    </NuxtLink>
                  </div>

                  <div class="border-t border-gray-100 pt-1">
                    <button
                      class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[#666666] transition-colors hover:bg-gray-50 hover:text-red-600"
                      @click="logout"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </template>

        <!-- Not logged in (Guest) -->
        <template v-else>
          <div class="flex items-center gap-2">
            <NuxtLink
              to="/login"
              class="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-[#666666] transition-colors duration-200 hover:text-[#171717] sm:inline-block"
            >
              เข้าสู่ระบบ
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="inline-flex h-[42px] items-center justify-center rounded-[18px] border border-white/80 bg-white/60 px-5 text-[13px] lg:text-sm font-semibold text-[#171717] shadow-[0_4px_12px_rgba(180,190,255,0.25),inset_0_2px_4px_rgba(255,255,255,1)] transition-all hover:scale-[1.02] hover:bg-white/80 hover:shadow-[0_6px_16px_rgba(180,190,255,0.35)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25"
            >
              สมัครสมาชิก
            </NuxtLink>
          </div>
        </template>
      </div>

      <!-- Hamburger Button -->
      <button
        class="ml-1 flex h-11 w-11 items-center justify-center rounded-full border border-black/[0.06] bg-white text-[#666666] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#F3F3F1] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25 md:hidden"
        @click="toggleMobileMenu"
      >
        <svg
          v-if="!mobileMenuOpen"
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <svg
          v-else
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-300 ease-in-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[400px] opacity-100"
      leave-active-class="transition-all duration-200 ease-in-out"
      leave-from-class="max-h-[400px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div
        v-show="mobileMenuOpen"
        class="mx-auto mt-3 max-w-[1280px] overflow-hidden rounded-[20px] border border-black/[0.06] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)] md:hidden"
      >
        <nav class="flex flex-col space-y-1 px-4 pb-4 pt-3">
          <NuxtLink
            to="/"
            class="rounded-xl px-3 py-3 text-sm font-medium text-[#666666] transition-colors duration-200 hover:bg-[#F3F3F1] hover:text-[#171717]"
            :class="[activeSection === 'home' ? '!bg-black/[0.07] !text-[#171717] !font-semibold' : '']"
            @click="mobileMenuOpen = false"
          >
            หน้าแรก
          </NuxtLink>
          <NuxtLink
            to="/gallery"
            class="rounded-xl px-3 py-3 text-sm font-medium text-[#666666] transition-colors duration-200 hover:bg-[#F3F3F1] hover:text-[#171717]"
            :class="[activeSection === 'gallery' ? '!bg-black/[0.07] !text-[#171717] !font-semibold' : '']"
            @click="mobileMenuOpen = false"
          >
            ผลงาน
          </NuxtLink>
          <NuxtLink
            to="/#packages"
            class="rounded-xl px-3 py-3 text-sm font-medium text-[#666666] transition-colors duration-200 hover:bg-[#F3F3F1] hover:text-[#171717]"
            :class="[activeSection === 'packages' ? '!bg-black/[0.07] !text-[#171717] !font-semibold' : '']"
            @click="mobileMenuOpen = false"
          >
            บริการ
          </NuxtLink>
          <NuxtLink
            to="/#how-it-works"
            class="rounded-xl px-3 py-3 text-sm font-medium text-[#666666] transition-colors duration-200 hover:bg-[#F3F3F1] hover:text-[#171717]"
            :class="[activeSection === 'how-it-works' ? '!bg-black/[0.07] !text-[#171717] !font-semibold' : '']"
            @click="mobileMenuOpen = false"
          >
            ขั้นตอนการสั่งงาน
          </NuxtLink>
          <NuxtLink
            to="/policy"
            class="rounded-xl px-3 py-3 text-sm font-medium text-[#666666] transition-colors duration-200 hover:bg-[#F3F3F1] hover:text-[#171717]"
            :class="[activeSection === 'policy' ? '!bg-black/[0.07] !text-[#171717] !font-semibold' : '']"
            @click="mobileMenuOpen = false"
          >
            เกี่ยวกับเรา
          </NuxtLink>
          <div class="pt-4 mt-2 border-t border-black/[0.06] flex flex-col gap-2">
            <template v-if="currentUser">
              <NuxtLink
                v-if="isCustomer"
                to="/customer/orders"
                class="inline-flex h-11 items-center justify-center rounded-xl bg-[#171717] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-[#292929] w-full"
                @click="mobileMenuOpen = false"
              >
                งานของฉัน
              </NuxtLink>
              <NuxtLink
                v-else
                to="/customer/orders/create"
                class="inline-flex h-11 items-center justify-center rounded-xl bg-[#171717] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-[#292929] w-full"
                @click="mobileMenuOpen = false"
              >
                เริ่มสั่งงาน
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink
                to="/register"
                class="inline-flex h-11 items-center justify-center rounded-xl border border-[#C4B5FD] bg-white px-4 text-sm font-semibold text-[#171717] shadow-[0_0_12px_rgba(196,181,253,0.3)] transition hover:shadow-[0_0_18px_rgba(196,181,253,0.45)] hover:border-[#A78BFA] w-full"
                @click="mobileMenuOpen = false"
              >
                สร้างบัญชี
              </NuxtLink>
              <NuxtLink
                to="/login"
                class="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-neutral-950 shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition hover:bg-[#F3F3F1] w-full"
                @click="mobileMenuOpen = false"
              >
                เข้าสู่ระบบ
              </NuxtLink>
            </template>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.liquid-glass-nav {
  background: rgba(255, 255, 255, 0.70);
  backdrop-filter: blur(20px) saturate(1.15);
  -webkit-backdrop-filter: blur(20px) saturate(1.15);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 28px;
  box-shadow:
    0 16px 40px rgba(0, 0, 0, 0.06),
    0 8px 16px rgba(0, 0, 0, 0.03),
    inset 0 2px 4px rgba(255, 255, 255, 0.9),
    inset 0 -1px 2px rgba(0, 0, 0, 0.02);
}
.liquid-glass-nav::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 2px 8px rgba(255, 255, 255, 0.7);
  pointer-events: none;
}
.liquid-glass-nav::after {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: 29px;
  background: linear-gradient(135deg, rgba(230, 220, 255, 0.3), rgba(255, 255, 255, 0) 60%, rgba(200, 230, 255, 0.2));
  z-index: -1;
  filter: blur(6px);
  pointer-events: none;
}
</style>
