<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useApi } from "~/composables/useApi"

const token = useCookie<string | null>("token")
const router = useRouter()
const { apiFetch } = useApi()

const currentUser = ref<any>(null)

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

const logout = () => {
  token.value = null
  const userRole = useCookie("userRole")
  userRole.value = null
  currentUser.value = null
  router.push("/")
  // Reload current page if already on root to refresh states
  if (router.currentRoute.value.path === "/") {
    window.location.reload()
  }
}

onMounted(() => {
  checkAuth()
})
</script>

<template>
  <header class="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-100 shadow-sm transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span class="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">GALLERY</span>
      </NuxtLink>

      <!-- Navigation Links -->
      <nav class="hidden md:flex items-center gap-6">
        <NuxtLink to="/" class="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition" active-class="text-indigo-600 font-bold">แกลเลอรี</NuxtLink>
        <NuxtLink to="/customer/orders/create" class="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition" active-class="text-indigo-600 font-bold">สั่งแต่งภาพ</NuxtLink>
        <NuxtLink to="/customer/orders" class="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition" active-class="text-indigo-600 font-bold">ออเดอร์ของฉัน</NuxtLink>
      </nav>

      <!-- User / Auth Actions -->
      <div class="flex items-center gap-4">
        <template v-if="currentUser">
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-slate-600 hidden sm:inline">สวัสดี, {{ currentUser.userFirstName }}</span>
            <div class="relative group">
              <button class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 hover:ring-2 hover:ring-indigo-300 transition-all duration-300">
                {{ currentUser.userFirstName[0].toUpperCase() }}
              </button>
              <!-- Dropdown on Hover -->
              <div class="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 hidden group-hover:block transition-all duration-300">
                <NuxtLink to="/customer/orders" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">ประวัติออเดอร์</NuxtLink>
                <div class="border-t border-slate-100 my-1"></div>
                <button @click="logout" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">ออกจากระบบ</button>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex items-center gap-3">
            <NuxtLink to="/login" class="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition">เข้าสู่ระบบ</NuxtLink>
            <NuxtLink to="/register" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all duration-200">สมัครสมาชิก</NuxtLink>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>
