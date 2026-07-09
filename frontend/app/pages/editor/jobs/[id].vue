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

const breadcrumb = computed(() => [
  { label: "หน้าแรก", to: "/editor/dashboard" },
  { label: "งานที่ได้รับมอบหมาย", to: "/editor/jobs" },
  { label: `งาน #${jobId}` }
])
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Breadcrumb Header -->
    <div v-if="!loading && !error && order" class="flex items-center justify-between">
      <AdminBreadcrumb :items="breadcrumb" />
    </div>

    <!-- Loading State (Skeleton) -->
    <div v-if="loading" class="space-y-6">
      <div class="h-6 w-1/3 bg-gray-200 rounded animate-pulse"></div>
      <div class="bg-white rounded-xl border border-gray-200 p-6 h-48 animate-pulse"></div>
      <div class="bg-white rounded-xl border border-gray-200 p-8 h-96 animate-pulse"></div>
    </div>

    <!-- Error State -->
    <AdminEmptyState
      v-else-if="error || !order"
      title="เกิดข้อผิดพลาด"
      :description="error || 'ไม่พบข้อมูลงานนี้'"
      icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    >
      <NuxtLink to="/editor/dashboard">
        <AdminActionButton variant="primary">กลับหน้าหลักแดชบอร์ด</AdminActionButton>
      </NuxtLink>
    </AdminEmptyState>

    <!-- Workspace Main View -->
    <div v-else class="space-y-6 animate-fade-in">
      <!-- 1. Header component -->
      <EditorJobHeader :order="order" @refresh="fetchOrderDetails" />

      <!-- 2. Tabs Switcher -->
      <EditorJobTabs :tabs="tabs" v-model:active="activeTab" />

      <!-- 3. Dynamic Tab Component Panel -->
      <div class="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-sm">
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
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
