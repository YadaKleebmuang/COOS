<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useApi } from '~/composables/useApi'

const token = useCookie<string | null>('token')
const router = useRouter()
const { apiFetch } = useApi()

type CustomerUser = {
  userFirstName?: string
  userLastName?: string
  userEmail?: string
  userProfileImage?: string
}

const currentUser = ref<CustomerUser | null>(null)
const dropdownOpen = ref(false)
const mobileMenuOpen = ref(false)

const navLinks = [
  { label: 'แดชบอร์ด', to: '/customer/dashboard' },
  { label: 'งานของฉัน', to: '/customer/orders' },
  { label: 'สั่งงานใหม่', to: '/customer/orders/create' }
]

const checkAuth = async () => {
  if (token.value) {
    try {
      const data = await apiFetch<CustomerUser>('/users/me')
      currentUser.value = data
    } catch (err) {
      console.error('Auth check failed in NavbarCustomer:', err)
      token.value = null
      currentUser.value = null
    }
  }
}

const toggleDropdown = (e: Event) => {
  e.stopPropagation()
  dropdownOpen.value = !dropdownOpen.value
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const closeMobileMenuOnDesktop = () => {
  if (window.innerWidth >= 768) mobileMenuOpen.value = false
}

const userInitial = computed(() => {
  return currentUser.value?.userFirstName?.[0]?.toUpperCase() || 'C'
})

const displayName = computed(() => {
  const first = currentUser.value?.userFirstName || ''
  const last = currentUser.value?.userLastName || ''
  return `${first} ${last}`.trim() || currentUser.value?.userEmail || 'Customer'
})

const logout = async () => {
  await useAuth().logout()
  currentUser.value = null
  dropdownOpen.value = false
  router.push('/')
}

onMounted(() => {
  checkAuth()
  window.addEventListener('click', closeDropdown)
  window.addEventListener('resize', closeMobileMenuOnDesktop)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeDropdown)
  window.removeEventListener('resize', closeMobileMenuOnDesktop)
})
</script>

<template>
  <div class="h-[68px] w-full shrink-0 sm:h-[72px]">
    <header class="pointer-events-none fixed inset-x-0 top-0 z-[100]">
      <div class="mx-auto w-full max-w-[1280px] px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8">
        <div class="liquid-glass-nav pointer-events-auto flex h-16 w-full items-center justify-between px-4 sm:px-5 lg:px-6">
      <!-- Left: Logo -->
      <NuxtLink
        to="/"
        aria-label="กลับไปหน้าแรก COOS Studio"
        class="flex min-w-[108px] flex-col leading-none text-black"
      >
        <span class="text-2xl font-semibold tracking-[0.24em]">COOS</span>
        <span class="mt-1 text-[7px] font-medium tracking-[0.48em]">STUDIO</span>
      </NuxtLink>

      <!-- Center: Nav Links -->
      <nav class="hidden items-center gap-1 rounded-[22px] bg-[#f8f8f8]/40 p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.03),0_1px_0_rgba(255,255,255,0.5)] md:flex">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-[18px] px-4 py-2 text-[13px] font-medium text-[#666666] transition-all duration-200 hover:bg-white/40 hover:text-[#171717] lg:px-5"
          exact-active-class="bg-white/70 !text-[#171717] shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.9)] font-semibold"
          active-class="bg-white/70 !text-[#171717] shadow-[0_1px_4px_rgba(0,0,0,0.03),inset_0_1px_2px_rgba(255,255,255,0.9)] font-semibold"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Right: User -->
      <div
        v-if="currentUser"
        class="flex items-center gap-2 sm:gap-3"
      >
        <!-- Name -->
        <div class="hidden text-right xl:block">
          <p class="max-w-[180px] truncate text-sm font-semibold text-[#171717]">
            {{ displayName }}
          </p>
          <p class="text-[10px] font-medium uppercase tracking-[0.16em] text-[#929292]">
            Customer
          </p>
        </div>

        <!-- Avatar Dropdown -->
        <div class="relative">
          <button
            class="flex h-11 items-center gap-2 rounded-full border border-black/[0.06] bg-white px-1.5 pr-3 text-sm font-semibold text-[#171717] shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-all duration-200 hover:bg-[#F3F3F1] focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25"
            aria-label="เปิดเมนูบัญชีลูกค้า"
            @click="toggleDropdown"
          >
            <span class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#171717] text-xs font-semibold text-white ring-2 ring-white/80">
              <img
                v-if="currentUser.userProfileImage"
                :src="currentUser.userProfileImage"
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

          <!-- Dropdown -->
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
              <!-- User Info Header -->
              <div class="border-b border-black/5 px-4 py-3">
                <p class="truncate text-sm font-semibold text-[#171717]">
                  {{ displayName }}
                </p>
                <p class="truncate text-[11px] text-[#929292]">
                  {{ currentUser.userEmail }}
                </p>
              </div>

              <!-- Links -->
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

              <!-- Logout -->
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
        class="liquid-glass-nav pointer-events-auto mx-auto mt-3 max-w-[1280px] overflow-hidden md:hidden"
      >
        <nav class="flex flex-col space-y-1 px-4 pb-4 pt-3">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-xl px-3 py-3 text-sm font-medium text-[#666666] transition-colors duration-200 hover:bg-[#F3F3F1] hover:text-[#171717]"
            exact-active-class="!bg-[#171717] !text-white hover:!bg-[#171717] hover:!text-white"
            active-class="!bg-[#171717] !text-white hover:!bg-[#171717] hover:!text-white"
            @click="mobileMenuOpen = false"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>
      </div>
    </header>
  </div>
</template>

<style scoped>
.liquid-glass-nav {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border-radius: 29px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1);
}
</style>
