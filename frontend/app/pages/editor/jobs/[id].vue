<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import { orderService } from "~/services/order.service"
import type { OrderDetail } from "~/types/order.types"

definePageMeta({
  layout: "editor",
  middleware: ["auth", "editor"]
})

const route = useRoute()
const router = useRouter()
const jobId = route.params.id as string

const order = ref<OrderDetail | null>(null)
const loading = ref(true)
const error = ref("")

const tabs = [
  { key: "overview", label: "ภาพรวมคำสั่งงาน" },
  { key: "sources", label: "รูปอ้างอิงต้นฉบับ" },
  { key: "generated", label: "รูป AI Generated" },
  { key: "selected", label: "รูปภาพที่ลูกค้าเลือก" },
  { key: "prompts", label: "ประวัติ Prompt" },
  { key: "history", label: "ประวัติดำเนินงาน" }
]

const activeTab = computed({
  get: () => (route.query.tab as string) || "overview",
  set: (val) => {
    router.replace({ query: { ...route.query, tab: val } })
  }
})

const fetchOrderDetails = async () => {
  loading.value = true
  error.value = ""
  try {
    const res = await orderService.getOrderById(jobId)
    order.value = res
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถดึงข้อมูลรายละเอียดออเดอร์นี้ได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrderDetails()
})
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-3xl p-16 text-center border shadow-sm">
      <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
      <p class="text-slate-400 font-medium">กำลังโหลดห้องทำงาน...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !order" class="bg-white rounded-3xl p-12 text-center border border-red-100">
      <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h3 class="text-lg font-bold text-red-600 mb-1">เกิดข้อผิดพลาด</h3>
      <p class="text-gray-500 text-sm mb-6">{{ error || 'ไม่พบข้อมูลงานนี้' }}</p>
      <NuxtLink to="/editor/dashboard" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm">
        กลับหน้าหลักแดชบอร์ด
      </NuxtLink>
    </div>

    <!-- Workspace Main View -->
    <div v-else class="space-y-6 animate-fade-in">
      <!-- 1. Header component -->
      <EditorJobHeader :order="order" @refresh="fetchOrderDetails" />

      <!-- 2. Tabs Switcher -->
      <EditorJobTabs :tabs="tabs" v-model:active="activeTab" />

      <!-- 3. Dynamic Tab Component Panel -->
      <div class="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        <EditorJobOverviewTab v-if="activeTab === 'overview'" :order="order" />
        <EditorJobSourceImagesTab v-else-if="activeTab === 'sources'" :order="order" />
        <EditorJobGeneratedImagesTab v-else-if="activeTab === 'generated'" :order="order" @refresh="fetchOrderDetails" />
        <EditorJobSelectedImagesTab v-else-if="activeTab === 'selected'" :order="order" />
        <EditorJobPromptLogsTab v-else-if="activeTab === 'prompts'" :order="order" />
        <EditorJobHistoryTab v-else-if="activeTab === 'history'" :order="order" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
