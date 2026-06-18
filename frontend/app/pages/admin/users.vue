<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()

const users = ref<any[]>([])
const loading = ref(true)
const error = ref("")
const searchQuery = ref("")

const fetchUsers = async () => {
  loading.value = true
  error.value = ""
  try {
    const data = await apiFetch("/users")
    users.value = data
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถดึงข้อมูลรายชื่อผู้ใช้ได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})

const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return users.value
  return users.value.filter(u => 
    (u.userFirstName || "").toLowerCase().includes(query) ||
    (u.userLastName || "").toLowerCase().includes(query) ||
    (u.userEmail || "").toLowerCase().includes(query)
  )
})
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">👤 จัดการผู้ใช้งาน</h1>
        <p class="text-slate-500 text-sm mt-1">ดูรายชื่อสมาชิก ลูกค้า ช่างแต่งภาพ และแอดมินทั้งหมดในระบบ</p>
      </div>
    </div>

    <!-- Search bar -->
    <div class="flex items-center justify-between gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="🔍 ค้นหาด้วย ชื่อ นามสกุล หรืออีเมล..."
        class="max-w-md w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-700 transition"
      />
      <button @click="fetchUsers" class="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white border px-4 py-2.5 rounded-xl hover:shadow-sm transition">
        🔄 รีเฟรชรายชื่อ
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-3xl p-16 text-center border shadow-sm">
      <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
      <p class="text-slate-400 font-medium">กำลังโหลดรายชื่อผู้ใช้...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-2xl border text-center font-bold text-sm">
      ⚠️ {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredUsers.length === 0" class="bg-white rounded-3xl p-16 text-center border shadow-sm space-y-4">
      <div class="text-5xl">👤</div>
      <h3 class="text-lg font-bold text-slate-700">ไม่พบรายชื่อผู้ใช้งาน</h3>
      <p class="text-slate-400 text-sm">ไม่มีข้อมูลสมาชิกที่ค้นหาในขณะนี้</p>
    </div>

    <!-- Users Table Grid -->
    <div v-else class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-bold uppercase text-xs">
              <th class="px-6 py-4">ผู้ใช้งาน</th>
              <th class="px-6 py-4">อีเมล</th>
              <th class="px-6 py-4">เบอร์โทรศัพท์</th>
              <th class="px-6 py-4">บทบาท (Role)</th>
              <th class="px-6 py-4">วันที่สมัครสมาชิก</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="user in filteredUsers" :key="user.userId" class="hover:bg-slate-50/40 text-slate-700 transition">
              <td class="px-6 py-4 flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                  {{ user.userFirstName[0].toUpperCase() }}
                </div>
                <span class="font-bold text-slate-800">{{ user.userFirstName }} {{ user.userLastName }}</span>
              </td>
              <td class="px-6 py-4 text-slate-500 font-semibold">
                {{ user.userEmail }}
              </td>
              <td class="px-6 py-4 text-slate-500 font-medium">
                {{ user.userPhone || "-" }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="px-2.5 py-1 rounded-full text-[10px] font-black border uppercase"
                  :class="
                    user.userRole === 'admin'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : user.userRole === 'editor'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-green-50 text-green-700 border-green-200'
                  "
                >
                  {{ user.userRole }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-400 text-xs">
                {{ new Date(user.userCreatedAt || Date.now()).toLocaleDateString('th-TH') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
