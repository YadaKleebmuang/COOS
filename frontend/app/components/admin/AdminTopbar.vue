<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useApi } from "~/composables/useApi"


defineProps<{
  pageTitle?: string
}>()

const emit = defineEmits<{
  (e: "toggle-sidebar"): void
}>()

const router = useRouter()
const { apiFetch } = useApi()
const token = useCookie<string | null>("token")

const currentUser = ref<any>(null)
const dropdownOpen = ref(false)

const initials = computed(() => {
  if (!currentUser.value) return "A"
  const f = currentUser.value.userFirstName?.[0] ?? ""
  const l = currentUser.value.userLastName?.[0] ?? ""
  return (f + l).toUpperCase() || "A"
})

const fetchUser = async () => {
  if (!token.value) return
  try {
    currentUser.value = await apiFetch<any>("/users/me")
  } catch {
    currentUser.value = null
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
  fetchUser()
  window.addEventListener("click", closeDropdown)
})

onBeforeUnmount(() => {
  window.removeEventListener("click", closeDropdown)
})
</script>

<template>
  <header class="h-16 bg-white/80 backdrop-blur-[15px] border-b border-[#EFEFEA]/60 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
    <!-- Left: Hamburger + Title -->
    <div class="flex items-center gap-3">
      <!-- Mobile hamburger -->
      <button
        class="lg:hidden p-1.5 rounded-lg text-[#666660] hover:bg-[#EFEFEA]/40 transition-colors"
        @click="emit('toggle-sidebar')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Page title -->
      <h1 class="text-sm font-bold text-[#171717]">
        {{ pageTitle || 'Admin Panel' }}
      </h1>
    </div>

    <!-- Right: Actions + User -->
    <div class="flex items-center gap-2">
      <!-- Search shortcut -->
      <button class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#EFEFEA]/80 bg-[#F7F7F5]/50 text-[#9A9A95] text-xs hover:border-[#EFEFEA] hover:bg-[#F7F7F5] transition-colors">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>ค้นหา...</span>
        <kbd class="hidden md:inline-flex items-center px-1.5 py-0.5 rounded border border-[#EFEFEA] bg-white text-[10px] font-mono text-[#9A9A95]">⌘K</kbd>
      </button>

      <!-- Notification -->
      <button class="p-2 rounded-lg text-[#9A9A95] hover:bg-[#EFEFEA]/40 hover:text-[#171717] transition-colors relative">
        <svg class="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      <!-- Divider -->
      <div class="w-px h-5 bg-[#EFEFEA]" />

      <!-- User avatar + dropdown -->
      <div v-if="currentUser" class="flex items-center gap-2.5">
        <!-- Name -->
        <div class="hidden md:block text-right">
          <p class="text-xs font-bold text-[#171717] leading-tight">
            {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
          </p>
          <p class="text-[10px] text-[#9A9A95]">ผู้ดูแลระบบ</p>
        </div>

        <!-- Avatar + Dropdown -->
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="w-8 h-8 rounded-full bg-[#EFEFEA] text-[#171717] text-xs font-bold flex items-center justify-center border border-white/50 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:bg-[#EFEFEA]/80 transition-colors"
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
              class="absolute right-0 mt-2 w-52 bg-white/90 backdrop-blur-[15px] border border-[#EFEFEA]/80 rounded-[20px] shadow-lg py-1.5 z-50"
              @click.stop
            >
              <!-- User info -->
              <div class="px-4 py-3 border-b border-[#EFEFEA]/60">
                <p class="text-sm font-semibold text-[#171717] truncate">
                  {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
                </p>
                <p class="text-[11px] text-[#9A9A95] truncate mt-0.5">
                  {{ currentUser.userEmail }}
                </p>
              </div>

              <!-- Links -->
              <div class="py-1 px-1.5">
                <NuxtLink
                  to="/admin/dashboard"
                  @click="closeDropdown"
                  class="flex items-center gap-2.5 px-3 py-2 text-sm text-[#666660] hover:bg-[#EFEFEA]/40 hover:text-[#171717] rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4 text-[#9A9A95]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  แดชบอร์ด
                </NuxtLink>
              </div>

              <!-- Logout -->
              <div class="border-t border-[#EFEFEA]/60 pt-1.5 px-1.5">
                <button
                  @click="logout"
                  class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50/50 rounded-lg transition-colors"
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
