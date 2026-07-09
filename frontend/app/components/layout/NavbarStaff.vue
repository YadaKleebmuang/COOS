<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useApi } from "~/composables/useApi"
import { authService } from "~/services/auth.service"

const props = defineProps<{
  role: "admin" | "editor"
}>()

const token = useCookie<string | null>("token")
const route = useRoute()
const router = useRouter()
const { apiFetch } = useApi()

const currentUser = ref<any>(null)
const dropdownOpen = ref(false)

// ── Title Logic ──────────────────────────────────────────────────────────────
const editorPageTitles: Record<string, string> = {
  "/editor/dashboard": "แดชบอร์ด",
  "/editor/jobs": "งานที่ได้รับมอบหมาย",
  "/editor/profile": "แก้ไขโปรไฟล์"
}
const currentPageTitle = computed(() => {
  if (props.role === "editor") {
    if (route.path.startsWith("/editor/jobs/") && route.path !== "/editor/jobs") {
      return "ห้องทำงาน (Workspace)"
    }
    return editorPageTitles[route.path] ?? "บันทึก Prompt"
  }
  return "Admin Panel"
})

// ── Dropdown Config ──────────────────────────────────────────────────────────
const roleConfig = computed(() => {
  if (props.role === "admin") {
    return {
      subLabel: "ผู้ดูแลระบบ",
      dropdownLinks: [
        { label: "Dashboard", to: "/admin/dashboard", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
        { label: "จัดการผู้ใช้", to: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" }
      ]
    }
  }
  return {
    subLabel: "ช่างแต่งภาพ (Editor)",
    dropdownLinks: [
      { label: "แก้ไขโปรไฟล์", to: "/editor/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
      { label: "งานที่ได้รับมอบหมาย", to: "/editor/jobs", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
      { label: "แดชบอร์ด", to: "/editor/dashboard", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }
    ]
  }
})

const initials = computed(() => {
  if (!currentUser.value) return "A"
  const f = currentUser.value.userFirstName?.[0] ?? ""
  const l = currentUser.value.userLastName?.[0] ?? ""
  return (f + l).toUpperCase() || "A"
})

const checkAuth = async () => {
  if (token.value) {
    try {
      const data = await apiFetch<any>("/users/me")
      currentUser.value = data
    }
    catch (err) {
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
  <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
    <!-- Left: Hamburger + Title -->
    <div class="flex items-center gap-3">
      <!-- Mobile hamburger (placeholder) -->
      <button class="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Page title -->
      <h1 class="text-sm font-semibold text-gray-900">
        {{ currentPageTitle }}
      </h1>
    </div>

    <!-- Right: Actions + User -->
    <div class="flex items-center gap-2">
      <!-- Search shortcut -->
      <button class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-xs hover:border-gray-300 transition-colors">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>ค้นหางาน...</span>
        <kbd class="hidden md:inline-flex items-center px-1.5 py-0.5 rounded border border-gray-300 bg-white text-[10px] font-mono text-gray-400">⌘K</kbd>
      </button>

      <!-- Notification -->
      <button class="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors relative">
        <svg class="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      <!-- Divider -->
      <div class="w-px h-5 bg-gray-200" />

      <!-- User avatar + dropdown -->
      <div v-if="currentUser" class="flex items-center gap-2.5">
        <!-- Name -->
        <div class="hidden md:block text-right">
          <p class="text-xs font-semibold text-gray-900 leading-tight">
            {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
          </p>
          <p class="text-[10px] text-gray-400">{{ roleConfig.subLabel }}</p>
        </div>

        <!-- Avatar + Dropdown -->
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            {{ initials }}
          </button>

          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 -translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 -translate-y-1"
          >
            <div
              v-if="dropdownOpen"
              class="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50"
              @click.stop
            >
              <!-- User info -->
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-semibold text-gray-900 truncate">
                  {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
                </p>
                <p class="text-[11px] text-gray-400 truncate mt-0.5">
                  {{ currentUser.userEmail }}
                </p>
              </div>

              <!-- Links -->
              <div class="py-1">
                <NuxtLink
                  v-for="link in roleConfig.dropdownLinks"
                  :key="link.to"
                  :to="link.to"
                  @click="closeDropdown"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                  class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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

      <!-- Fallback loading skeleton -->
      <div v-else class="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    </div>
  </header>
</template>
