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
      console.error("Auth check failed in NavbarDashboard:", err)
      token.value = null
      currentUser.value = null
    }
  }
}

const logout = () => {
  token.value = null
  currentUser.value = null
  router.push("/")
}

onMounted(() => {
  checkAuth()
})
</script>

<template>
  <header class="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shadow-sm">
    <!-- Breadcrumb / Welcome -->
    <div>
      <h1 class="text-sm font-bold text-slate-400 uppercase tracking-widest">
        แผงควบคุมระบบ (Dashboard Workspace)
      </h1>
    </div>

    <!-- User Section -->
    <div class="flex items-center gap-4" v-if="currentUser">
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-bold text-slate-800 leading-tight">
            {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
          </p>
          <p class="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
            {{ currentUser.userRole }}
          </p>
        </div>
        
        <!-- Avatar Dropdown -->
        <div class="relative group">
          <button class="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-black hover:ring-2 hover:ring-indigo-300 transition-all duration-300 shadow-sm">
            {{ currentUser.userFirstName[0].toUpperCase() }}
          </button>
          
          <!-- Dropdown List -->
          <div class="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 hidden group-hover:block transition-all duration-300 z-50">
            <NuxtLink to="/" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">แกลเลอรี</NuxtLink>
            <NuxtLink :to="`/${currentUser.userRole}/profile`" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">แก้ไขโปรไฟล์</NuxtLink>
            <div class="border-t border-slate-100 my-1"></div>
            <button @click="logout" class="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">ออกจากระบบ</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
