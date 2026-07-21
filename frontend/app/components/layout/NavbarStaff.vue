<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useApi } from "~/composables/useApi"


const props = defineProps<{
  role: "admin" | "editor"
}>()

const token = useCookie<string | null>("token")
const route = useRoute()
const router = useRouter()
const { apiFetch } = useApi()

const currentUser = ref<any>(null)
const dropdownOpen = ref(false)
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// ── Mobile Menu Items (Same as SidebarDashboard) ───────────────────────────
interface SidebarItem {
  name: string
  path: string
  icon: string
}

const menuItems = computed<SidebarItem[]>(() => {
  if (props.role === "admin") {
    return [
      { name: "แดชบอร์ดภาพรวม", path: "/admin/dashboard", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
      { name: "จัดการผู้ใช้", path: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
      { name: "จัดการออเดอร์", path: "/admin/orders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
      { name: "จัดการแพ็กเกจ", path: "/admin/packages", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
      { name: "จัดการประเภทงาน", path: "/admin/work-types", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
      { name: "จัดการแกลเลอรี", path: "/admin/gallery", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
      { name: "จัดการนโยบายร้าน", path: "/admin/policies", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }
    ]
  }
  return [
    { name: "แดชบอร์ด", path: "/editor/dashboard", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { name: "งานที่ได้รับมอบหมาย", path: "/editor/jobs", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { name: "บันทึก Prompt", path: "/editor/prompt-notes", icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
    { name: "โปรไฟล์", path: "/editor/profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }
  ]
})

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
  await useAuth().logout()
  currentUser.value = null
  dropdownOpen.value = false
  router.push("/")
}

onMounted(() => {
  checkAuth()
  window.addEventListener("click", closeDropdown)

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) mobileMenuOpen.value = false // lg breakpoint
  })
})

onBeforeUnmount(() => {
  window.removeEventListener("click", closeDropdown)
})
</script>

<template>
  <header class="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
    <!-- Left: Hamburger + Title -->
    <div class="flex items-center gap-3">
      <!-- Mobile hamburger -->
      <button @click="toggleMobileMenu" class="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
        <svg v-if="!mobileMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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

    <!-- Mobile Menu Slide-down -->
    <Transition
      enter-active-class="transition-all duration-300 ease-in-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[500px] opacity-100"
      leave-active-class="transition-all duration-200 ease-in-out"
      leave-from-class="max-h-[500px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-show="mobileMenuOpen" class="lg:hidden absolute top-14 left-0 w-full overflow-y-auto bg-white border-b border-gray-100 shadow-lg z-40">
        <nav class="flex flex-col px-4 py-3 space-y-1 max-h-[80vh]">
          <p class="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 select-none">
            เมนูหลัก
          </p>
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            @click="mobileMenuOpen = false"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200"
            :class="[
              $route.fullPath === item.path || ($route.path.startsWith(item.path) && item.path !== '/' && item.path.indexOf('?') === -1 && Object.keys($route.query).length === 0)
                ? 'bg-gray-900 text-white shadow-sm font-bold'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <svg
              class="w-4 h-4 flex-shrink-0"
              :class="[$route.fullPath === item.path || ($route.path.startsWith(item.path) && item.path !== '/' && item.path.indexOf('?') === -1 && Object.keys($route.query).length === 0) ? 'text-white' : 'text-gray-400']"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="item.icon" />
            </svg>
            <span>{{ item.name }}</span>
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>
