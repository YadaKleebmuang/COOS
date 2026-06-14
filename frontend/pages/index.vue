<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import type { WorkType } from "~/app/types/order.types"

const token = useCookie<string | null>("token")
const router = useRouter()
const { apiFetch } = useApi()

// --- Auth & User State ---
const currentUser = ref<any>(null)
const checkAuth = async () => {
  if (token.value) {
    try {
      const data = await apiFetch<any>("/users/me")
      currentUser.value = data
    } catch (err) {
      console.error("Auth check failed:", err)
      token.value = null // Clear invalid token
      currentUser.value = null
    }
  }
}

const logout = async () => {
  token.value = null
  currentUser.value = null
  router.push("/")
}

// --- Gallery & Category State ---
const images = ref<any[]>([])
const workTypes = ref<WorkType[]>([])
const loading = ref(false)
const error = ref("")

// Search & Filter state
const search = ref("")
const selectedWorkTypeId = ref<number | null>(null) // null means "All"
const sortBy = ref("newest") // newest, oldest
const otherLimit = ref(6) // Number of other images to display initially

const loadData = async () => {
  loading.value = true
  error.value = ""
  try {
    const [imgData, wtData] = await Promise.all([
      apiFetch<any[]>("/gallery-images"),
      apiFetch<WorkType[]>("/work-types").catch(() => []), // fallback if guest or error
    ])
    images.value = imgData

    if (wtData && wtData.length > 0) {
      workTypes.value = wtData.filter(wt => wt.workTypeIsActive === 1)
    } else {
      // Fallback categories for guest visitors
      workTypes.value = [
        { workTypeId: 1, workTypeName: "Pre-wedding", workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() },
        { workTypeId: 2, workTypeName: "Portrait", workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() },
        { workTypeId: 3, workTypeName: "ครอบครัว (Family)", workTypeDescription: null, workTypeIsActive: 1, workTypeCreatedAt: new Date(), workTypeUpdatedAt: new Date() },
      ]
    }
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถโหลดข้อมูลแกลเลอรีได้"
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await checkAuth()
  await loadData()
})

// --- Computed Filters & Sorting ---
const filteredImages = computed(() => {
  let result = images.value

  // Filter by category
  if (selectedWorkTypeId.value !== null) {
    result = result.filter(img => img.workTypeId === selectedWorkTypeId.value)
  }

  // Filter by search text
  if (search.value.trim()) {
    const query = search.value.toLowerCase().trim()
    result = result.filter(img => 
      img.imageTitle?.toLowerCase().includes(query) ||
      img.imageDescription?.toLowerCase().includes(query) ||
      img.imageTags?.toLowerCase().includes(query)
    )
  }

  // Apply sorting
  const sorted = [...result]
  if (sortBy.value === "oldest") {
    // Newest is default in DB, reverse to get oldest
    return sorted.reverse()
  }

  return sorted
})

// --- Category Tabs ---
const categoryTabs = computed(() => {
  return [
    { id: null, name: "ทั้งหมด" },
    ...workTypes.value.map(wt => ({ id: wt.workTypeId, name: wt.workTypeName }))
  ]
})

// --- Featured Work (First 2 images) ---
const featuredImages = computed(() => {
  return filteredImages.value.slice(0, 2)
})

// --- Other Work (Remaining images) ---
const otherImages = computed(() => {
  return filteredImages.value.slice(2, 2 + otherLimit.value)
})

const hasMore = computed(() => {
  return filteredImages.value.length > otherImages.value.length + 2
})

const loadMore = () => {
  otherLimit.value += 6
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
    <!-- Header/Navbar -->
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
          <NuxtLink to="/" class="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">แกลเลอรี</NuxtLink>
          <NuxtLink to="/create-order" class="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition">สั่งแต่งภาพ</NuxtLink>
          <NuxtLink to="/my-orders" class="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition">ออเดอร์ของฉัน</NuxtLink>
        </nav>

        <!-- User / Auth status -->
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
                  <NuxtLink to="/my-orders" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">ประวัติออเดอร์</NuxtLink>
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

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      <!-- Search & Filters Container -->
      <div class="space-y-6">
        <!-- Search input -->
        <div class="relative max-w-3xl mx-auto">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="search"
            type="text"
            placeholder="ค้นหาภาพถ่ายหรือคำจำกัดความ (Prompt)..."
            class="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-700 placeholder-slate-400 transition-all duration-300 hover:border-slate-300 text-sm"
          />
        </div>

        <!-- Filter Controls -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">FILTER:</span>
            <button
              v-for="tab in categoryTabs"
              :key="tab.id ?? 'all'"
              @click="selectedWorkTypeId = tab.id"
              class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 uppercase tracking-wider"
              :class="selectedWorkTypeId === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/60'"
            >
              {{ tab.name }}
            </button>
          </div>

          <!-- Sort / Layout Selectors -->
          <div class="flex items-center gap-3">
            <select
              v-model="sortBy"
              class="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">อัปเดตล่าสุด</option>
              <option value="oldest">อัปเดตเก่าสุด</option>
            </select>
          </div>
        </div>
      </div>

      <!-- ===== Loading State ===== -->
      <div v-if="loading" class="py-20 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
        <p class="text-slate-400 font-medium">กำลังโหลดผลงานแกลเลอรี...</p>
      </div>

      <!-- ===== Error State ===== -->
      <div v-else-if="error" class="py-12 text-center max-w-md mx-auto">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-red-600 mb-1">ไม่สามารถโหลดแกลเลอรีได้</h3>
        <p class="text-slate-500 text-sm mb-4">{{ error }}</p>
        <button @click="loadData" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl transition text-sm">
          ลองใหม่อีกครั้ง
        </button>
      </div>

      <!-- ===== Empty State ===== -->
      <div v-else-if="filteredImages.length === 0" class="py-20 text-center">
        <div class="text-5xl mb-4">🖼️</div>
        <h3 class="text-lg font-bold text-slate-700 mb-1">ไม่พบรูปภาพผลงาน</h3>
        <p class="text-slate-400 text-sm">ไม่พบรูปภาพที่ตรงกับการค้นหาหรือตัวกรองนี้</p>
      </div>

      <!-- ===== Gallery Content ===== -->
      <div v-else class="space-y-12">
        
        <!-- SECTION 1: FEATURED WORK -->
        <section v-if="featuredImages.length > 0" class="space-y-4 text-left">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">FEATURED_WORK</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              v-for="img in featuredImages"
              :key="img.imageId"
              class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            >
              <!-- Card Image with Hover overlay -->
              <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <img :src="img.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <a :href="img.imageUrl" target="_blank" class="bg-white/95 hover:bg-white text-slate-900 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    เปิดดูรูปภาพ
                  </a>
                </div>
                <!-- Work Type Badge -->
                <span class="absolute top-4 left-4 bg-indigo-600/90 text-white backdrop-blur-sm text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow">
                  {{ img.workTypeName }}
                </span>
              </div>
              
              <!-- Card Details -->
              <div class="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="font-extrabold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{{ img.imageTitle || 'Untitled' }}</h3>
                  <p class="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2">{{ img.imageDescription || 'ไม่มีคำอธิบายเพิ่มเติม' }}</p>
                </div>
                <!-- Tags -->
                <div v-if="img.imageTags" class="flex flex-wrap gap-1.5 mt-4">
                  <span
                    v-for="tag in img.imageTags.split(',')"
                    :key="tag"
                    class="text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold px-2.5 py-1 rounded-md transition"
                  >
                    #{{ tag.trim() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECTION 2: OTHER WORK -->
        <section v-if="otherImages.length > 0" class="space-y-4 text-left">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">OTHER_WORK</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="img in otherImages"
              :key="img.imageId"
              class="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col group"
            >
              <!-- Card Image with Hover Overlay -->
              <div class="relative aspect-square overflow-hidden bg-slate-100">
                <img :src="img.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <a :href="img.imageUrl" target="_blank" class="bg-white/95 hover:bg-white text-slate-900 font-bold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 shadow transition">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    เปิดดูรูปภาพ
                  </a>
                </div>
                <!-- Category Badge -->
                <span class="absolute top-3 left-3 bg-slate-900/80 text-white backdrop-blur-sm text-[9px] font-bold tracking-wider px-2 py-0.5 rounded">
                  {{ img.workTypeName }}
                </span>
              </div>

              <!-- Card Details -->
              <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors line-clamp-1">{{ img.imageTitle || 'Untitled' }}</h3>
                  <p class="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">{{ img.imageDescription || 'ไม่มีคำอธิบายเพิ่มเติม' }}</p>
                </div>
                <!-- Tags -->
                <div v-if="img.imageTags" class="flex flex-wrap gap-1 mt-3">
                  <span
                    v-for="tag in img.imageTags.split(',')"
                    :key="tag"
                    class="text-[9px] bg-slate-50 hover:bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-bold transition"
                  >
                    #{{ tag.trim() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- LOAD MORE BUTTON -->
        <div v-if="hasMore" class="flex justify-center pt-4">
          <button
            @click="loadMore"
            class="px-6 py-2.5 border border-slate-300 hover:border-indigo-600 hover:text-indigo-600 text-slate-600 bg-white hover:bg-indigo-50/10 rounded-xl font-bold text-xs transition-all duration-300 focus:outline-none uppercase tracking-wider"
          >
            LOAD_MORE
          </button>
        </div>

      </div>

    </main>
  </div>
</template>

