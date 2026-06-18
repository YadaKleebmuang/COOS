<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useApi } from "~/composables/useApi"
import { authService } from "~/services/auth.service"

const props = defineProps<{
  role: "admin" | "editor"
}>()

const token = useCookie<string | null>("token")
const router = useRouter()
const { apiFetch } = useApi()

const currentUser = ref<any>(null)
const dropdownOpen = ref(false)

// ── Computed config per role ─────────────────────────────────────────────────

const roleConfig = computed(() => {
  if (props.role === "admin") {
    return {
      chip: "Admin",
      title: "Admin Panel",
      subLabel: "ผู้ดูแลระบบ",
      quickAction: {
        label: "จัดการออเดอร์",
        to: "/admin/orders",
        icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
      },
      dropdownLinks: [
        {
          label: "Dashboard",
          to: "/admin/dashboard",
          icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        },
        {
          label: "จัดการผู้ใช้",
          to: "/admin/users",
          icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        },
        {
          label: "แกลเลอรี",
          to: "/",
          icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        }
      ]
    }
  }

  // editor
  return {
    chip: "Editor",
    title: "Editor Workspace",
    subLabel: "นักตกแต่งภาพ",
    quickAction: {
      label: "ประวัติงาน",
      to: "/editor/jobs",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    dropdownLinks: [
      {
        label: "แก้ไขโปรไฟล์",
        to: "/editor/profile",
        icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      },
      {
        label: "ประวัติการทำงาน",
        to: "/editor/jobs",
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      },
      {
        label: "แกลเลอรี",
        to: "/",
        icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      }
    ]
  }
})

// ── Auth ─────────────────────────────────────────────────────────────────────

const checkAuth = async () => {
  if (token.value) {
    try {
      const data = await apiFetch<any>("/users/me")
      currentUser.value = data
    }
    catch (err) {
      console.error("Auth check failed in NavbarStaff:", err)
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
  <header class="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">

    <!-- Left: Workspace Label -->
    <div class="flex items-center gap-3">
      <!-- Role Chip -->
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest select-none">
        <span class="w-1.5 h-1.5 rounded-full bg-white/60 inline-block" />
        {{ roleConfig.chip }}
      </span>
      <!-- Page Title -->
      <h1 class="text-sm font-semibold text-gray-700 hidden sm:block">
        {{ roleConfig.title }}
      </h1>
    </div>

    <!-- Right: Quick Action + User -->
    <div class="flex items-center gap-3">

      <!-- Quick Action Button -->
      <NuxtLink
        :to="roleConfig.quickAction.to"
        class="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
      >
        <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="roleConfig.quickAction.icon" />
        </svg>
        {{ roleConfig.quickAction.label }}
      </NuxtLink>

      <!-- User Section -->
      <div v-if="currentUser" class="flex items-center gap-3">

        <!-- Name + Sub-label -->
        <div class="text-right hidden md:block">
          <p class="text-sm font-semibold text-gray-800 leading-tight">
            {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
          </p>
          <p class="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
            {{ roleConfig.subLabel }}
          </p>
        </div>

        <!-- Avatar Dropdown -->
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 text-gray-700 flex items-center justify-center font-bold text-sm hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200"
          >
            {{ currentUser.userFirstName?.[0]?.toUpperCase() }}
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
              class="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg shadow-gray-200/60 py-1.5 z-50 origin-top-right"
              @click.stop
            >
              <!-- User Info Header -->
              <div class="px-4 py-2.5 border-b border-gray-50">
                <p class="text-sm font-semibold text-gray-900 truncate">
                  {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
                </p>
                <p class="text-[11px] text-gray-400 truncate">
                  {{ currentUser.userEmail }}
                </p>
              </div>

              <!-- Dynamic Links -->
              <div class="py-1">
                <NuxtLink
                  v-for="link in roleConfig.dropdownLinks"
                  :key="link.to"
                  :to="link.to"
                  @click="closeDropdown"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="link.icon" />
                  </svg>
                  {{ link.label }}
                </NuxtLink>
              </div>

              <!-- Logout -->
              <div class="border-t border-gray-100 pt-1">
                <button
                  @click="logout"
                  class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-red-600 transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
