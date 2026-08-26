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
  customerFirstName?: string
  customerLastName?: string
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
  completedJobs: number
  email: string
}



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
    const [ordersRes, usersRes] = await Promise.all([
      apiFetch<any>("/orders?limit=1000"),
      apiFetch<any>("/users?limit=1000")
    ])
    
    const allOrders = ordersRes.data || []
    const users = usersRes.data || []
    
    waitingOrders.value = allOrders.filter((o: any) => o.orderStatus === 'waiting_assignment')
    const activeOrders = allOrders.filter((o: any) => 
      ['waiting_to_start', 'in_progress', 'waiting_selection', 'waiting_final_payment'].includes(o.orderStatus)
    )
    const completedOrders = allOrders.filter((o: any) => o.orderStatus === 'completed')
    
    editors.value = users.filter((u: any) => u.userRole === 'editor').map((u: any) => ({
      userId: u.userId,
      name: `${u.userFirstName} ${u.userLastName}`,
      initials: `${u.userFirstName?.[0] || ''}${u.userLastName?.[0] || ''}`.toUpperCase(),
      activeJobs: activeOrders.filter((o: any) => o.editorId === u.userId).length,
      completedJobs: completedOrders.filter((o: any) => o.editorId === u.userId).length,
      email: u.userEmail
    }))
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
  if (q) result = result.filter(o => String(o.orderId).includes(q) || (o.customerFirstName + ' ' + o.customerLastName).toLowerCase().includes(q) || o.packageName.toLowerCase().includes(q))
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
    await apiFetch(`/orders/${assignModal.value.order!.orderId}/assign`, { 
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editorId: assignModal.value.selectedEditorId })
    })
    await fetchData()
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
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-lg font-black text-[#171717] tracking-tight">มอบหมายงาน</h1>
        <p class="mt-0.5 text-xs text-[#9A9A95]">เลือกผู้รับผิดชอบให้กับคำสั่งงานที่รอมอบหมาย</p>
      </div>
      <AdminActionButton variant="secondary" size="sm" :loading="loading" icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" @click="fetchData">รีเฟรช</AdminActionButton>
    </div>

    <!-- Filter + Search Toolbar -->
    <div class="flex flex-col md:flex-row md:items-center gap-4 justify-between bg-white border border-[#EFEFEA]/60 rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
      <div class="overflow-x-auto flex-1">
        <AdminFilterBar v-model="workTypeFilter" :filters="workTypeOptions" />
      </div>
      <div class="flex-shrink-0 flex items-center">
        <div class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-[#171717]/30 focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.015)] transition-all">
          <svg class="w-4 h-4 text-[#9A9A95] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input v-model="searchQuery" type="text" placeholder="ค้นหาออเดอร์, ลูกค้า..." class="text-xs text-[#171717] bg-transparent outline-none w-48 placeholder:text-[#9A9A95]"/>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Orders table -->
      <div class="xl:col-span-2 bg-white border border-[#EFEFEA]/60 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.01)] overflow-hidden">
        <div class="px-6 py-4 border-b border-[#EFEFEA]/60">
          <p class="text-sm font-black text-[#171717] tracking-tight">คำสั่งงานรอมอบหมาย</p>
          <p class="text-xs text-[#9A9A95] mt-0.5">{{ filteredOrders.length }} รายการ</p>
        </div>
        <AdminDataTable :columns="columns" :rows="filteredOrders" :loading="loading" row-key="orderId">
          <template #cell-orderId="{ value }">
            <span class="font-mono text-xs font-bold text-[#171717]">#{{ value }}</span>
          </template>
          <template #cell-customerName="{ row }">
            <span class="text-xs font-medium text-[#171717]">{{ row.customerFirstName }} {{ row.customerLastName }}</span>
          </template>
          <template #cell-workTypeName="{ value }">
            <span class="text-xs text-[#171717] font-medium">{{ value }}</span>
          </template>
          <template #cell-packageName="{ value }">
            <span class="text-xs text-[#666660]">{{ value }}</span>
          </template>
          <template #cell-orderTotalPrice="{ value }">
            <span class="text-xs font-bold font-number text-[#171717]">{{ formatPrice(value) }}</span>
          </template>
          <template #cell-orderRequiredDate="{ value }">
            <span class="text-xs text-[#9A9A95] font-medium">{{ formatDate(value) }}</span>
          </template>
          <template #cell-urgent="{ row }">
            <span v-if="row.orderIsUrgent" class="inline-flex items-center px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 rounded-lg">เร่งด่วน</span>
            <span v-else class="text-[#EFEFEA] text-xs">—</span>
          </template>
          <template #cell-action="{ row }">
            <button
              @click="openAssign(row as any)"
              class="px-3 py-1.5 text-xs font-bold text-white bg-[#171717] hover:bg-[#333333] transition-colors rounded-xl border border-[#171717]"
            >
              มอบหมาย
            </button>
          </template>
        </AdminDataTable>
        <AdminEmptyState v-if="!loading && filteredOrders.length === 0" title="ไม่มีคำสั่งงานรอมอบหมาย" description="คำสั่งงานทั้งหมดถูกมอบหมาย Editor แล้ว" icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </div>

      <!-- Editor Workload -->
      <div class="bg-white border border-[#EFEFEA]/60 rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.01)] overflow-hidden">
        <div class="px-6 py-4 border-b border-[#EFEFEA]/60">
          <p class="text-sm font-black text-[#171717] tracking-tight">ภาระงาน Editor</p>
          <p class="text-xs text-[#9A9A95] mt-0.5">ภาพรวมงานทั้งหมดที่ได้รับมอบหมาย</p>
        </div>
        <div class="p-4 space-y-2">
          <div v-for="ed in editors" :key="ed.userId" class="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F7F7F5]/50 transition-colors border border-transparent">
            <div class="w-9 h-9 rounded-full bg-[#EFEFEA] text-[#171717] border border-white/50 text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">{{ ed.initials }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-[#171717] truncate">{{ ed.name }}</p>
              <p class="text-xs text-[#9A9A95] truncate mt-0.5">{{ ed.email }}</p>
            </div>
            <div class="text-right flex-shrink-0 flex items-center gap-3">
              <div class="text-center">
                <p class="text-sm font-bold text-[#171717] font-number">{{ ed.activeJobs }}</p>
                <p class="text-[10px] text-[#9A9A95]">กำลังทำ</p>
              </div>
              <div class="text-center pl-3 border-l border-[#EFEFEA]">
                <p class="text-sm font-bold text-emerald-600 font-number">{{ ed.completedJobs }}</p>
                <p class="text-[10px] text-[#9A9A95]">เสร็จแล้ว</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="assignModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" @click="assignModal.open = false" />
          <div class="relative bg-white/90 backdrop-blur-[15px] rounded-[24px] shadow-2xl border border-[#EFEFEA]/80 w-full max-w-md p-6">
            <h3 class="text-base font-black text-[#171717] tracking-tight mb-1">มอบหมายงาน #{{ assignModal.order?.orderId }}</h3>
            <p class="text-xs text-[#9A9A95] mb-5 pb-3 border-b border-[#EFEFEA]/60">{{ assignModal.order?.customerFirstName }} {{ assignModal.order?.customerLastName }} — {{ assignModal.order?.packageName }}</p>
            <div class="space-y-3">
              <label class="block text-xs font-bold text-[#666660]">เลือก Editor</label>
              <select v-model="assignModal.selectedEditorId" class="w-full text-xs px-3 py-2 bg-[#F7F7F5]/50 border border-[#EFEFEA] rounded-xl focus:outline-none focus:bg-white focus:border-[#171717]/30 transition-all font-medium text-[#171717]">
                <option value="">— เลือก Editor —</option>
                <option v-for="ed in editors" :key="ed.userId" :value="ed.userId">
                  {{ ed.name }} ({{ ed.activeJobs }} งาน)
                </option>
              </select>
            </div>
            <div class="flex gap-2 justify-end mt-6 pt-4 border-t border-[#EFEFEA]/60">
              <AdminActionButton variant="secondary" size="md" @click="assignModal.open = false">ยกเลิก</AdminActionButton>
              <button
                :disabled="!assignModal.selectedEditorId || assignModal.loading"
                @click="handleAssign"
                class="inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-[#171717] hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl border border-[#171717]"
              >
                <svg v-if="assignModal.loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                มอบหมายงาน
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
