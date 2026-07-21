<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import { useRoute } from "vue-router"
import { useApi } from "~/composables/useApi"


const token = useCookie<string | null>("token")
const router = useRouter()
const route = useRoute()
const { apiFetch } = useApi()

const currentUser = ref<any>(null)
const dropdownOpen = ref(false)
const mobileMenuOpen = ref(false)
const activeSection = ref("home")

let observer: IntersectionObserver | null = null

const checkAuth = async () => {
  if (token.value) {
    try {
      const data = await apiFetch<any>("/users/me")
      currentUser.value = data
    } catch (err) {
      console.error("Auth check failed in Navbar:", err)
      token.value = null
      currentUser.value = null
    }
  }
}

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
  router.push("/")
  // Reload current page if already on root to refresh states
  if (router.currentRoute.value.path === "/") {
    window.location.reload()
  }
}

const handleScroll = () => {
  if (route.path === "/" && window.scrollY < 150) {
    activeSection.value = "home"
  }
}

onMounted(() => {
  checkAuth()
  window.addEventListener("click", closeDropdown)
  window.addEventListener("scroll", handleScroll)
  
  // Close mobile menu on window resize if crossing md breakpoint
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) mobileMenuOpen.value = false
  })

  // Set up intersection observer for scroll spy
  const options = {
    root: null,
    rootMargin: "-20% 0px -60% 0px",
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
    const howItWorksEl = document.getElementById("how-it-works")
    const packagesEl = document.getElementById("packages")
    if (howItWorksEl) observer?.observe(howItWorksEl)
    if (packagesEl) observer?.observe(packagesEl)
  }

  // Delay slightly to ensure DOM elements are loaded
  setTimeout(observeElements, 500)

  // Watch hash/route changes
  watch(
    () => [route.path, route.hash],
    ([path, hash]) => {
      if (path !== "/") {
        activeSection.value = (path as string).replace("/", "")
      } else {
        if (!hash) {
          if (window.scrollY < 300) {
            activeSection.value = "home"
          }
        } else {
          activeSection.value = (hash as string).replace("#", "")
        }
      }
    },
    { immediate: true }
  )
})

onBeforeUnmount(() => {
  window.removeEventListener("click", closeDropdown)
  window.removeEventListener("scroll", handleScroll)
  observer?.disconnect()
})
</script>

<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <div
          class="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white shadow-sm group-hover:bg-gray-700 transition-colors duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span class="font-bold text-xl tracking-tight text-gray-900">COOS STUDIO</span>
      </NuxtLink>

      <!-- Navigation Links -->
      <nav class="hidden md:flex items-center gap-6">
        <NuxtLink to="/" class="text-sm font-semibold transition-colors duration-200"
          :class="[activeSection === 'home' ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900']">
          หน้าแรก
        </NuxtLink>
        <NuxtLink to="/gallery" class="text-sm font-semibold transition-colors duration-200"
          :class="[activeSection === 'gallery' ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900']">
          แกลเลอรี
        </NuxtLink>
        <NuxtLink to="/#how-it-works" class="text-sm font-semibold transition-colors duration-200"
          :class="[activeSection === 'how-it-works' ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900']">
          ขั้นตอนการใช้งาน
        </NuxtLink>
        <NuxtLink to="/#packages" class="text-sm font-semibold transition-colors duration-200"
          :class="[activeSection === 'packages' ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900']">
          แพ็กเกจ
        </NuxtLink>
        <NuxtLink to="/policy" class="text-sm font-semibold transition-colors duration-200"
          :class="[activeSection === 'policy' ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900']">
          นโยบาย
        </NuxtLink>
      </nav>

      <!-- User / Auth Actions -->
      <div class="flex items-center gap-3">
        <template v-if="currentUser">
          <div class="flex items-center gap-3">

            <NuxtLink to="/customer/orders/create"
              class="hidden sm:flex bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all duration-200">
              เริ่มสั่งงาน
            </NuxtLink>

            <!-- Greeting -->
            <span class="text-sm font-medium text-gray-500 hidden sm:inline">
              สวัสดี, {{ currentUser.userFirstName }}
            </span>

            <!-- Avatar Dropdown -->
            <div class="relative">
              <button @click="toggleDropdown"
                class="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200">
                {{ currentUser.userFirstName?.[0]?.toUpperCase() }}
              </button>

              <!-- Dropdown -->
              <Transition enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95 translate-y-1" enter-to-class="opacity-100 scale-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100 translate-y-0"
                leave-to-class="opacity-0 scale-95 translate-y-1">
                <div v-if="dropdownOpen"
                  class="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/60 py-1.5 z-50 origin-top-right"
                  @click.stop>
                  <!-- User Info Header -->
                  <div class="px-4 py-2.5 border-b border-gray-50">
                    <p class="text-sm font-semibold text-gray-900 truncate">
                      {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
                    </p>
                    <p class="text-[11px] text-gray-400 truncate">
                      {{ currentUser.userEmail }}
                    </p>
                  </div>

                  <!-- Links -->
                  <div class="py-1">
                    <NuxtLink to="/customer/orders" @click="closeDropdown"
                      class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      ประวัติออเดอร์
                    </NuxtLink>
                    <NuxtLink to="/customer/profile" @click="closeDropdown"
                      class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      แก้ไขโปรไฟล์
                    </NuxtLink>
                  </div>

                  <!-- Logout -->
                  <div class="border-t border-gray-100 pt-1">
                    <button @click="logout"
                      class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </template>

        <!-- Not logged in -->
        <template v-else>
          <div class="flex items-center gap-2">
            <NuxtLink to="/login"
              class="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors duration-200">
              เข้าสู่ระบบ
            </NuxtLink>
            <NuxtLink to="/register"
              class="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all duration-200">
              สมัครสมาชิก
            </NuxtLink>
          </div>
        </template>
      </div>

      <!-- Hamburger Button -->
      <button @click="toggleMobileMenu" class="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors ml-2">
        <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
      <div v-show="mobileMenuOpen" class="md:hidden overflow-hidden bg-white border-b border-gray-100 shadow-inner">
        <nav class="flex flex-col px-4 pt-2 pb-4 space-y-1">
          <NuxtLink to="/" @click="mobileMenuOpen = false" class="px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200"
            :class="[activeSection === 'home' ? 'text-gray-900 bg-gray-50 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
            หน้าแรก
          </NuxtLink>
          <NuxtLink to="/gallery" @click="mobileMenuOpen = false" class="px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200"
            :class="[activeSection === 'gallery' ? 'text-gray-900 bg-gray-50 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
            แกลเลอรี
          </NuxtLink>
          <NuxtLink to="/#how-it-works" @click="mobileMenuOpen = false" class="px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200"
            :class="[activeSection === 'how-it-works' ? 'text-gray-900 bg-gray-50 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
            ขั้นตอนการใช้งาน
          </NuxtLink>
          <NuxtLink to="/#packages" @click="mobileMenuOpen = false" class="px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200"
            :class="[activeSection === 'packages' ? 'text-gray-900 bg-gray-50 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
            แพ็กเกจ
          </NuxtLink>
          <NuxtLink to="/policy" @click="mobileMenuOpen = false" class="px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200"
            :class="[activeSection === 'policy' ? 'text-gray-900 bg-gray-50 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
            นโยบาย
          </NuxtLink>
          <div class="pt-4 mt-2 border-t border-gray-100 flex flex-col gap-2">
            <template v-if="currentUser">
              <NuxtLink to="/customer/orders/create" @click="mobileMenuOpen = false" class="w-full text-center bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200">
                เริ่มสั่งงาน
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/register" @click="mobileMenuOpen = false" class="w-full text-center bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200">
                สมัครสมาชิก
              </NuxtLink>
              <NuxtLink to="/login" @click="mobileMenuOpen = false" class="w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-lg transition-all duration-200">
                เข้าสู่ระบบ
              </NuxtLink>
            </template>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>
