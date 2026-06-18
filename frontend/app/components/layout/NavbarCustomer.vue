<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useApi } from "~/composables/useApi"
import { authService } from "~/services/auth.service"

const token = useCookie<string | null>("token")
const router = useRouter()
const { apiFetch } = useApi()

const currentUser = ref<any>(null)
const dropdownOpen = ref(false)

const checkAuth = async () => {
  if (token.value) {
    try {
      const data = await apiFetch<any>("/users/me")
      currentUser.value = data
    }
    catch (err) {
      console.error("Auth check failed in NavbarCustomer:", err)
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

const logout = async () => {
  await authService.logout()
  currentUser.value = null
  dropdownOpen.value = false
  router.push("/")
}

onMounted(() => {
  checkAuth()
  window.addEventListener("click", closeDropdown)
})

onBeforeUnmount(() => {
  window.removeEventListener("click", closeDropdown)
})
</script>

<template>
  <header class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

      <!-- Left: Logo -->
      <NuxtLink to="/customer/dashboard" class="flex items-center gap-2 group flex-shrink-0">
        <div
          class="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white shadow-sm group-hover:bg-gray-700 transition-colors duration-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span class="font-bold text-xl tracking-tight text-gray-900">COOS STUDIO</span>
      </NuxtLink>

      <!-- Center: Nav Links -->
      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink to="/"
          class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200">
          แกลเลอรี
        </NuxtLink>
        <NuxtLink to="/customer/dashboard"
          class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
          active-class="text-gray-900 bg-gray-100">
          แดชบอร์ด
        </NuxtLink>
        <NuxtLink to="/customer/orders/create"
          class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
          active-class="text-gray-900 bg-gray-100">
          สั่งแต่งภาพ
        </NuxtLink>
        <NuxtLink to="/customer/orders"
          class="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
          active-class="text-gray-900 bg-gray-100">
          ประวัติออเดอร์
        </NuxtLink>
      </nav>

      <!-- Right: User -->
      <div v-if="currentUser" class="flex items-center gap-3">

        <!-- Name -->
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
            leave-active-class="transition duration-100 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0"
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
                <NuxtLink to="/customer/profile" @click="closeDropdown"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  แก้ไขโปรไฟล์
                </NuxtLink>
                <NuxtLink to="/customer/orders" @click="closeDropdown"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  ประวัติออเดอร์
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
    </div>
  </header>
</template>
