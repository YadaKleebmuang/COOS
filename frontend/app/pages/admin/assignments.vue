<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()

// ── Types ──────────────────────────────────────────────────────
interface WaitingOrder {
  orderId: number
  customerId: number
  customerName: string
  workTypeName: string
  packageName: string
  orderTotalPrice: number
  orderRequiredDate: string
  orderIsUrgent: number
  orderCreatedAt: string
}

interface EditorLoad {
  userId: number
  name: string
  initials: string
  activeJobs: number
  email: string
}

// ── Mock data ──────────────────────────────────────────────────
const mockOrders: WaitingOrder[] = [
  { orderId: 1023, customerId: 12, customerName: "นิรมล วงษ์ดี", workTypeName: "Realistic", packageName: "Professional", orderTotalPrice: 5000, orderRequiredDate: "2025-07-10", orderIsUrgent: 0, orderCreatedAt: "2025-06-27T14:30:00Z" },
  { orderId: 1019, customerId: 9, customerName: "กมลวรรณ สวย", workTypeName: "Anime", packageName: "Basic", orderTotalPrice: 1800, orderRequiredDate: "2025-07-05", orderIsUrgent: 1, orderCreatedAt: "2025-06-24T10:00:00Z" },
  { orderId: 1017, customerId: 7, customerName: "เจษฎา ดีมาก", workTypeName: "Watercolor", packageName: "Standard", orderTotalPrice: 3200, orderRequiredDate: "2025-07-08", orderIsUrgent: 0, orderCreatedAt: "2025-06-23T09:00:00Z" },
]

const mockEditors: EditorLoad[] = [
  { userId: 1, name: "Alex Watcharaporn", initials: "AW", activeJobs: 8, email: "alex@coos.studio" },
  { userId: 2, name: "Sarah Jinda", initials: "SJ", activeJobs: 5, email: "sarah@coos.studio" },
  { userId: 3, name: "Mark Lapanon", initials: "ML", activeJobs: 3, email: "mark@coos.studio" },
  { userId: 4, name: "Chris Patchara", initials: "CP", activeJobs: 2, email: "chris@coos.studio" },
]

// ── State ──────────────────────────────────────────────────────
const waitingOrders = ref<WaitingOrder[]>([])
const editors = ref<EditorLoad[]>([])
const loading = ref(true)
const searchQuery = ref("")
const workTypeFilter = ref("all")

const assignModal = ref({ open: false, loading: false, order: null as WaitingOrder | null, selectedEditorId: "" })

// ── Fetch ──────────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  try {
    // Future: parallel API calls
    // const [orders, users] = await Promise.all([
    //   apiFetch("/orders?status=waiting_assignment"),
    //   apiFetch("/users?role=editor")
    // ])
    await new Promise(r => setTimeout(r, 400))
    waitingOrders.value = mockOrders
    editors.value = mockEditors
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())

// ── Filters ────────────────────────────────────────────────────
const workTypeOptions = computed(() => {
  const types = [...new Set(waitingOrders.value.map(o => o.workTypeName))]
  return [{ key: "all", label: "ทุกประเภท" }, ...types.map(t => ({ key: t, label: t }))]
})

const filteredOrders = computed(() => {
  let result = waitingOrders.value
  if (workTypeFilter.value !== "all") result = result.filter(o => o.workTypeName === workTypeFilter.value)
  const q = searchQuery.value.toLowerCase().trim()
  if (q) result = result.filter(o => String(o.orderId).includes(q) || o.customerName.toLowerCase().includes(q) || o.packageName.toLowerCase().includes(q))
  return result
})

// ── Columns ────────────────────────────────────────────────────
const columns = [
  { key: "orderId", label: "เลขที่คำสั่งงาน" },
  { key: "customerName", label: "ลูกค้า" },
  { key: "workTypeName", label: "ประเภทงาน" },
  { key: "packageName", label: "แพ็กเกจ" },
  { key: "orderTotalPrice", label: "ยอดรวม", align: "right" as const },
  { key: "orderRequiredDate", label: "วันที่ต้องการ" },
  { key: "urgent", label: "เร่งด่วน", align: "center" as const },
  { key: "action", label: "มอบหมาย", align: "center" as const }
]

// ── Assign ─────────────────────────────────────────────────────
const openAssign = (order: WaitingOrder) => {
  assignModal.value = { open: true, loading: false, order, selectedEditorId: "" }
}

const handleAssign = async () => {
  if (!assignModal.value.selectedEditorId) return
  assignModal.value.loading = true
  try {
    // Future: await apiFetch(`/orders/${assignModal.value.order!.orderId}/assign`, { method: "PATCH", ... })
    await new Promise(r => setTimeout(r, 600))
    waitingOrders.value = waitingOrders.value.filter(o => o.orderId !== assignModal.value.order!.orderId)
    assignModal.value.open = false
  } finally {
    assignModal.value.loading = false
  }
}

// ── Helpers ────────────────────────────────────────────────────
const formatPrice = (n: number) => `฿${n.toLocaleString("th-TH")}`
const formatDate = (d: string) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "มอบหมายงาน" }]
</script>

<template>
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">มอบหมายงานให้ทีมผลิตภาพ</h1>
        <p class="mt-0.5 text-sm text-gray-500">คำสั่งงานที่รอการมอบหมายให้ Editor</p>
      </div>
      <AdminActionButton variant="secondary" size="sm" :loading="loading" @click="fetchData">รีเฟรช</AdminActionButton>
    </div>

    <!-- Search + filter -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
        <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input v-model="searchQuery" type="text" placeholder="ค้นหาออเดอร์, ลูกค้า..." class="text-sm text-gray-700 bg-transparent outline-none w-44 placeholder:text-gray-400"/>
      </div>
      <AdminFilterBar v-model="workTypeFilter" :filters="workTypeOptions" />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Orders table -->
      <div class="xl:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <p class="text-sm font-bold text-gray-900">คำสั่งงานรอมอบหมาย</p>
          <p class="text-xs text-gray-400 mt-0.5">{{ filteredOrders.length }} รายการ</p>
        </div>
        <AdminDataTable :columns="columns" :rows="filteredOrders" :loading="loading" row-key="orderId">
          <template #cell-orderId="{ value }">
            <span class="font-mono text-xs font-bold text-gray-900">#{{ value }}</span>
          </template>
          <template #cell-customerName="{ value }">
            <span class="text-sm text-gray-700">{{ value }}</span>
          </template>
          <template #cell-workTypeName="{ value }">
            <span class="text-xs text-gray-600">{{ value }}</span>
          </template>
          <template #cell-packageName="{ value }">
            <span class="text-xs text-gray-500">{{ value }}</span>
          </template>
          <template #cell-orderTotalPrice="{ value }">
            <span class="text-xs font-bold font-number text-gray-900">{{ formatPrice(value) }}</span>
          </template>
          <template #cell-orderRequiredDate="{ value }">
            <span class="text-xs text-gray-500">{{ formatDate(value) }}</span>
          </template>
          <template #cell-urgent="{ row }">
            <span v-if="row.orderIsUrgent" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-red-600 border border-red-200">เร่งด่วน</span>
            <span v-else class="text-gray-300 text-xs">—</span>
          </template>
          <template #cell-action="{ row }">
            <AdminActionButton variant="primary" size="sm" @click="openAssign(row)">มอบหมาย</AdminActionButton>
          </template>
        </AdminDataTable>
        <AdminEmptyState v-if="!loading && filteredOrders.length === 0" title="ไม่มีคำสั่งงานรอมอบหมาย" description="คำสั่งงานทั้งหมดถูกมอบหมาย Editor แล้ว" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </div>

      <!-- Editor Workload -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <p class="text-sm font-bold text-gray-900">ภาระงาน Editor</p>
          <p class="text-xs text-gray-400 mt-0.5">งานที่กำลังดำเนินการอยู่</p>
        </div>
        <div class="p-4 space-y-2">
          <div v-for="ed in editors" :key="ed.userId" class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div class="w-9 h-9 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{{ ed.initials }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ ed.name }}</p>
              <p class="text-xs text-gray-400 truncate">{{ ed.email }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-sm font-bold text-gray-900 font-number">{{ ed.activeJobs }}</p>
              <p class="text-xs text-gray-400">งาน</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="assignModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="assignModal.open = false" />
          <div class="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6">
            <h3 class="text-sm font-bold text-gray-900 mb-1">มอบหมายงาน #{{ assignModal.order?.orderId }}</h3>
            <p class="text-xs text-gray-400 mb-5">{{ assignModal.order?.customerName }} — {{ assignModal.order?.packageName }}</p>
            <div class="space-y-3">
              <label class="block text-xs font-medium text-gray-500">เลือก Editor</label>
              <select v-model="assignModal.selectedEditorId" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400">
                <option value="">— เลือก Editor —</option>
                <option v-for="ed in editors" :key="ed.userId" :value="ed.userId">
                  {{ ed.name }} ({{ ed.activeJobs }} งาน)
                </option>
              </select>
            </div>
            <div class="flex gap-2 justify-end mt-6 pt-4 border-t border-gray-100">
              <AdminActionButton variant="secondary" size="md" @click="assignModal.open = false">ยกเลิก</AdminActionButton>
              <AdminActionButton variant="primary" size="md" :loading="assignModal.loading" :disabled="!assignModal.selectedEditorId" @click="handleAssign">มอบหมายงาน</AdminActionButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
