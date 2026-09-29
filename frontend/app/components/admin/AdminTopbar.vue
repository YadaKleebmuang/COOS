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

const searchOpen = ref(false)
const searchQuery = ref("")
const searchLoading = ref(false)
const searchResults = ref<{
  type: "nav" | "order" | "user"
  title: string
  subtitle?: string
  path: string
}[]>([])

// Static navigation items
const navItems = [
  { name: "แดชบอร์ด", path: "/admin/dashboard" },
  { name: "คำสั่งงาน", path: "/admin/orders" },
  { name: "ตรวจสอบการชำระเงิน", path: "/admin/payments" },
  { name: "มอบหมายงาน", path: "/admin/assignments" },
  { name: "บัญชีผู้ใช้", path: "/admin/users" },
  { name: "ประเภทงาน", path: "/admin/work-types" },
  { name: "แพ็กเกจ", path: "/admin/packages" },
  { name: "คลังรูปภาพ", path: "/admin/gallery" },
  { name: "หมวดหมู่และแฮชแท็ก", path: "/admin/categories-tags" },
  { name: "นโยบายและเงื่อนไข", path: "/admin/policies" },
  { name: "รายงาน", path: "/admin/reports" },
  { name: "ตั้งค่า", path: "/admin/settings" }
]

let searchTimeout: NodeJS.Timeout | null = null

const performSearch = async () => {
  const q = searchQuery.value.trim().toLowerCase()
  if (q.length < 2) {
    searchResults.value = []
    searchLoading.value = false
    return
  }

  searchLoading.value = true
  const results: any[] = []

  // 1. Search Navigation
  const matchedNav = navItems.filter(item => item.name.toLowerCase().includes(q))
  results.push(...matchedNav.slice(0, 3).map(n => ({
    type: "nav",
    title: n.name,
    subtitle: "เมนู",
    path: n.path
  })))

  // 2. Search Orders (using existing API)
  try {
    const ordersRes = await apiFetch<any>("/orders")
    const orders = Array.isArray(ordersRes.data) ? ordersRes.data : []
    const matchedOrders = orders.filter((o: any) => 
      String(o.orderId).includes(q) ||
      (o.customerFirstName && o.customerFirstName.toLowerCase().includes(q)) ||
      (o.customerLastName && o.customerLastName.toLowerCase().includes(q))
    )
    
    results.push(...matchedOrders.slice(0, 4).map((o: any) => ({
      type: "order",
      title: `คำสั่งงาน #${o.orderId}`,
      subtitle: `${o.customerFirstName || ''} ${o.customerLastName || ''} • ${o.packageName || ''}`,
      path: `/admin/orders` // Existing route for orders list
    })))
  } catch (err) {
    // silently fail search for orders if API errors
  }

  // 3. Search Users (using existing API)
  try {
    const usersRes = await apiFetch<any>("/users")
    const users = Array.isArray(usersRes.data) ? usersRes.data : []
    const matchedUsers = users.filter((u: any) => 
      (u.userFirstName && u.userFirstName.toLowerCase().includes(q)) ||
      (u.userLastName && u.userLastName.toLowerCase().includes(q)) ||
      (u.userEmail && u.userEmail.toLowerCase().includes(q))
    )
    
    results.push(...matchedUsers.slice(0, 3).map((u: any) => ({
      type: "user",
      title: `${u.userFirstName || ''} ${u.userLastName || ''}`.trim() || 'No Name',
      subtitle: u.userEmail,
      path: `/admin/users` // Existing route for users
    })))
  } catch (err) {
    // silently fail search for users if API errors
  }

  searchResults.value = results
  searchLoading.value = false
}

const onSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    performSearch()
  }, 300)
}

const openSearch = () => {
  searchOpen.value = true
  // setTimeout to allow rendering before focus
  setTimeout(() => {
    const input = document.getElementById('admin-search-input')
    if (input) input.focus()
  }, 50)
}

const closeSearch = () => {
  searchOpen.value = false
  searchQuery.value = ""
  searchResults.value = []
}

// Global click outside to close search & dropdown
const closeAll = (e: Event) => {
  closeDropdown()
  const target = e.target as HTMLElement
  if (!target.closest('.search-container')) {
    closeSearch()
  }
}

onMounted(() => {
  fetchUser()
  window.addEventListener("click", closeAll)
  
  // Shortcut cmd+k
  window.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      openSearch()
    }
    if (e.key === 'Escape') {
      closeSearch()
      closeDropdown()
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener("click", closeAll)
})
</script>

<template>
  <div class="h-[68px] sm:h-[72px] shrink-0 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 w-full max-w-[1440px] mx-auto">
    <header class="liquid-glass-nav h-16 flex items-center justify-between px-4 sm:px-5 lg:px-6 w-full">
      <!-- Left: Hamburger + Title -->
      <div class="flex items-center gap-3">
        <!-- Mobile hamburger -->
        <button
          class="lg:hidden p-1.5 rounded-lg text-[#666666] hover:bg-[#F3F3F1] transition-colors focus:outline-none"
          @click="emit('toggle-sidebar')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Page title -->
        <h1 class="text-[13px] font-semibold text-[#171717] tracking-wide">
          {{ pageTitle || 'Admin Panel' }}
        </h1>
      </div>

      <!-- Right: Actions + User -->
      <div class="flex items-center gap-2 sm:gap-3">
        <!-- Search shortcut (Clickable) -->
        <div class="relative search-container">
          <button 
            v-if="!searchOpen"
            @click.stop="openSearch"
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.06] bg-white text-[#929292] text-xs hover:bg-[#F3F3F1] transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span class="font-medium text-[11px] uppercase tracking-[0.05em]">Search</span>
            <kbd class="hidden md:inline-flex items-center px-1.5 rounded bg-[#F7F7F5] text-[9px] font-mono font-bold text-[#666666]">⌘K</kbd>
          </button>

          <!-- Active Search Input -->
          <div 
            v-else
            class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-black/[0.12] bg-white text-[#171717] text-[13px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] min-w-[280px]"
            @click.stop
          >
            <svg class="w-4 h-4 text-[#929292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              id="admin-search-input"
              v-model="searchQuery"
              @input="onSearchInput"
              type="text" 
              placeholder="ค้นหาคำสั่งงาน ผู้ใช้ หรือเมนู..." 
              class="bg-transparent border-none outline-none w-full text-[13px] placeholder:text-[#929292]"
            />
            <button v-if="searchQuery" @click="searchQuery = ''; onSearchInput()" class="text-[#929292] hover:text-[#171717]">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <button @click="closeSearch" class="text-[#929292] hover:text-[#171717] pl-1.5 border-l border-black/[0.06] text-[10px] font-bold uppercase tracking-wider">
              ESC
            </button>
          </div>

          <!-- Search Dropdown -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-1"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-1"
          >
            <div
              v-if="searchOpen && searchQuery.length >= 2"
              class="absolute right-0 top-full mt-2 w-[340px] rounded-[16px] border border-black/[0.06] bg-white/95 backdrop-blur-xl py-2 shadow-[0_16px_48px_rgba(0,0,0,0.08)] z-50 origin-top-right overflow-hidden"
              @click.stop
            >
              <div v-if="searchLoading" class="px-4 py-3 text-sm text-[#929292] flex items-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                กำลังค้นหา...
              </div>
              <div v-else-if="searchResults.length === 0" class="px-4 py-3 text-[13px] text-[#666666]">
                ไม่พบรายการที่ตรงกับคำค้นหา
              </div>
              <div v-else class="max-h-[320px] overflow-y-auto px-1.5 py-1">
                <NuxtLink
                  v-for="(result, idx) in searchResults"
                  :key="idx"
                  :to="result.path"
                  @click="closeSearch"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-[10px] hover:bg-[#F3F3F1] transition-colors group"
                >
                  <div class="w-8 h-8 rounded-full bg-black/[0.03] flex items-center justify-center text-[#666666] group-hover:text-[#171717] group-hover:bg-white group-hover:shadow-sm transition-all flex-shrink-0">
                    <svg v-if="result.type === 'nav'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 6h16M4 12h16M4 18h7" /></svg>
                    <svg v-else-if="result.type === 'order'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    <svg v-else-if="result.type === 'user'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-[13px] font-semibold text-[#171717] truncate leading-tight">{{ result.title }}</p>
                    <p v-if="result.subtitle" class="text-[11px] text-[#929292] truncate mt-0.5">{{ result.subtitle }}</p>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Divider -->
        <div class="hidden sm:block w-px h-5 bg-black/[0.06] mx-1" />

        <!-- User avatar + dropdown -->
        <div v-if="currentUser" class="flex items-center gap-2.5">
          <!-- Name -->
          <div class="hidden md:block text-right">
            <p class="text-[13px] font-semibold text-[#171717] leading-tight">
              {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
            </p>
            <p class="text-[10px] font-medium uppercase tracking-[0.16em] text-[#929292]">
              Admin
            </p>
          </div>

          <!-- Avatar + Dropdown -->
          <div class="relative">
            <button
              @click="toggleDropdown"
              class="w-9 h-9 rounded-full bg-[#171717] text-white text-xs font-semibold flex items-center justify-center ring-2 ring-white/80 shadow-[0_4px_14px_rgba(0,0,0,0.04)] transition-transform hover:scale-105 focus:outline-none"
            >
              {{ initials }}
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
                class="absolute right-0 mt-3 w-56 rounded-[14px] border border-black/[0.06] bg-white py-2 shadow-[0_16px_48px_rgba(0,0,0,0.08)] z-50 origin-top-right"
                @click.stop
              >
                <!-- User info -->
                <div class="px-4 py-3 border-b border-black/[0.06]">
                  <p class="text-sm font-semibold text-[#171717] truncate">
                    {{ currentUser.userFirstName }} {{ currentUser.userLastName }}
                  </p>
                  <p class="text-[11px] text-[#929292] truncate mt-0.5">
                    {{ currentUser.userEmail }}
                  </p>
                </div>

                <!-- Links -->
                <div class="py-1">
                  <NuxtLink
                    to="/admin/dashboard"
                    @click="closeDropdown"
                    class="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#666666] transition-colors hover:bg-[#F3F3F1] hover:text-[#171717]"
                  >
                    <svg class="h-4 w-4 text-[#929292]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l9-9 9 9M5 10v10h14V10" />
                    </svg>
                    แดชบอร์ด
                  </NuxtLink>
                </div>

                <!-- Logout -->
                <div class="border-t border-black/[0.06] pt-1">
                  <button
                    @click="logout"
                    class="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#666666] transition-colors hover:bg-[#FDEEEE] hover:text-[#B93B3B]"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div v-else class="w-9 h-9 rounded-full bg-white border border-black/5 animate-pulse" />
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
