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
const showAllOrders = ref(false)

const assignModal = ref({ open: false, loading: false, order: null as WaitingOrder | null, selectedEditorId: null as number | null })

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

const displayedOrders = computed(() => {
  if (showAllOrders.value) return filteredOrders.value
  return filteredOrders.value.slice(0, 5)
})

// ── Assign ─────────────────────────────────────────────────────
const openAssign = (order: WaitingOrder) => {
  assignModal.value = { open: true, loading: false, order, selectedEditorId: null }
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
const formatDate = (d: string) => new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "มอบหมายงาน" }]
</script>

<template>
  <div class="admin-page space-y-6 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="admin-page-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <p class="admin-eyebrow">ASSIGNMENTS</p>
        <h1>มอบหมายงาน</h1>
        <p class="admin-intro mt-2">จัดสรรงานให้ทีมและติดตามภาระงานของนักออกแบบ</p>
      </div>
      <button
        @click="() => fetchData()"
        class="px-4 py-2 rounded-full border border-[#172c3b]/10 bg-[#fcf9f3] text-[13px] font-medium text-[#172c3b] hover:bg-[#eee7db] transition-colors shadow-sm flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        รีเฟรช
      </button>
    </div>

    <!-- Assignments Workspace Card -->
    <div class="bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">

      <!-- Header & Search -->
      <div class="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-[#172c3b] tracking-tight">มอบหมายงาน</h2>
          <p class="text-[13px] font-medium text-[#52616a] mt-0.5">เลือกผู้รับผิดชอบให้กับคำสั่งงานที่รอมอบหมาย</p>
        </div>
        <div class="coos-search-field flex items-center gap-2 bg-[#eee7db] border border-[#172c3b]/10 rounded-xl px-3 py-2 focus-within:bg-[#fcf9f3] focus-within:border-[#172c3b]/20 focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all">
          <svg class="w-4 h-4 text-[#69777f] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="ค้นหาออเดอร์, ลูกค้า..."
            class="text-xs text-[#172c3b] bg-transparent outline-none min-w-0 w-full sm:w-48 placeholder:text-[#69777f]"
           aria-label="ค้นหาออเดอร์, ลูกค้า..."/>
        </div>
      </div>

      <!-- Filter Row -->
      <div class="px-4 sm:px-6 pb-4 border-b border-[#172c3b]/10 overflow-x-auto">
        <AdminFilterBar class="admin-filters" v-model="workTypeFilter" :filters="workTypeOptions" />
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 xl:grid-cols-3 divide-y xl:divide-y-0 xl:divide-x divide-black/[0.06]">

        <!-- Left: Compact Orders List (65%) -->
        <div class="xl:col-span-2 flex flex-col bg-[#fcf9f3]">
          <div class="px-6 py-4 border-b border-[#172c3b]/10 bg-[#e5e9e1] flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-[#172c3b]">คำสั่งงานรอมอบหมาย</p>
              <p class="text-[13px] text-[#52616a] mt-0.5">{{ filteredOrders.length }} รายการ</p>
            </div>
            <button
              v-if="filteredOrders.length > 5"
              @click="showAllOrders = !showAllOrders"
              class="text-[13px] font-medium text-[#172c3b] underline hover:text-[#52616a] transition-colors"
            >
              {{ showAllOrders ? 'แสดงแบบย่อ' : 'ดูทั้งหมด' }}
            </button>
          </div>

          <div class="flex-1 bg-[#fcf9f3]">
            <div v-if="loading" class="p-6 text-center text-xs text-[#52616a]">กำลังโหลด...</div>
            <AdminEmptyState
              v-else-if="filteredOrders.length === 0"
              title="ไม่มีคำสั่งงานรอมอบหมาย"
              description="คำสั่งงานทั้งหมดถูกมอบหมายให้ Editor แล้ว"
              icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <div v-else class="divide-y divide-black/[0.04]">
              <div v-for="order in displayedOrders" :key="order.orderId" class="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-[#f5f0e7] transition-colors group">
                <div class="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <!-- ID & Customer -->
                  <div class="w-full sm:w-48 flex-shrink-0">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-[13px] font-bold text-[#172c3b]">#{{ order.orderId }}</span>
                      <span v-if="order.orderIsUrgent" class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-[4px]">ด่วน</span>
                    </div>
                    <p class="text-[13px] text-[#52616a] truncate mt-0.5">{{ order.customerFirstName }} {{ order.customerLastName }}</p>
                  </div>

                  <!-- Details -->
                  <div class="flex-1 min-w-0">
                    <p class="text-[13px] font-medium text-[#172c3b] truncate">{{ order.workTypeName }}</p>
                    <div class="flex items-center gap-3 mt-0.5">
                      <p class="text-[11px] text-[#52616a] truncate">{{ order.packageName }}</p>
                      <span class="w-1 h-1 rounded-full bg-[#ded7cb]"></span>
                      <p class="text-[11px] text-[#52616a] flex-shrink-0">ส่ง: {{ formatDate(order.orderRequiredDate) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Action -->
                <div class="mt-4 sm:mt-0 sm:pl-4 flex-shrink-0">
                  <button
                    @click="openAssign(order as any)"
                    class="admin-primary w-full sm:w-auto px-4 py-2 text-[11px] font-semibold text-white bg-black hover:bg-[#172c3b] transition-colors rounded-[8px] shadow-sm border border-[#172c3b]/10 whitespace-nowrap"
                  >
                    มอบหมายงาน
                  </button>
                </div>
              </div>
            </div>
            <!-- Show more row (if limit applied) -->
            <div v-if="filteredOrders.length > 5 && !showAllOrders" class="p-3 text-center border-t border-[#172c3b]/10 bg-[#e5e9e1]">
              <span class="text-xs text-[#69777f]">มีอีก {{ filteredOrders.length - 5 }} รายการที่ซ่อนอยู่</span>
            </div>
          </div>
        </div>

        <!-- Right: Editor Workload (35%) -->
        <div class="flex flex-col bg-[#fcf9f3]">
          <div class="px-6 py-4 border-b border-[#172c3b]/10 bg-[#e5e9e1]">
            <p class="text-sm font-semibold text-[#172c3b]">ภาระงาน Editor</p>
            <p class="text-[13px] text-[#52616a] mt-0.5">ภาพรวมงานทั้งหมดที่ได้รับมอบหมาย</p>
          </div>
          <div class="p-4 space-y-1 h-[500px] overflow-y-auto">
            <div v-for="ed in editors" :key="ed.userId" class="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f0e7] transition-colors border border-transparent">
              <div class="w-9 h-9 rounded-full bg-[#eee7db] text-[#172c3b] border border-[#172c3b]/10 text-xs font-semibold flex items-center justify-center flex-shrink-0">{{ ed.initials }}</div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-semibold text-[#172c3b] truncate">{{ ed.name }}</p>
                <p class="text-[11px] text-[#52616a] truncate mt-0.5">{{ ed.email }}</p>
              </div>
              <div class="text-right flex-shrink-0 flex items-center gap-3">
                <div class="text-center min-w-[36px]">
                  <p class="text-[13px] font-semibold text-[#172c3b] font-mono">{{ ed.activeJobs }}</p>
                  <p class="text-[10px] font-medium text-[#52616a]">กำลังทำ</p>
                </div>
                <div class="text-center pl-3 border-l border-[#172c3b]/10 min-w-[48px]">
                  <p class="text-[13px] font-semibold text-[#172c3b] font-mono">{{ ed.completedJobs }}</p>
                  <p class="text-[10px] font-medium text-[#52616a]">เสร็จแล้ว</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="assignModal.open" class="admin-theme admin-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="assignModal.open = false" />
          <div class="relative bg-[#fcf9f3] rounded-[14px] shadow-2xl border border-[#172c3b]/10 w-full max-w-lg p-0 overflow-hidden flex flex-col max-h-[90vh]">

            <!-- Modal Header -->
            <div class="p-6 pb-4 border-b border-[#172c3b]/10 bg-[#fcf9f3]">
              <h3 class="text-[17px] font-semibold text-[#172c3b] tracking-tight mb-2">มอบหมายคำสั่งงาน #{{ assignModal.order?.orderId }}</h3>
              <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[13px] text-[#52616a]">
                <p class="font-medium text-[#172c3b]">{{ assignModal.order?.customerFirstName }} {{ assignModal.order?.customerLastName }}</p>
                <span class="hidden sm:inline w-1 h-1 rounded-full bg-[#ded7cb]"></span>
                <p>{{ assignModal.order?.packageName }}</p>
                <span class="hidden sm:inline w-1 h-1 rounded-full bg-[#ded7cb]"></span>
                <p>ส่ง: {{ formatDate(assignModal.order?.orderRequiredDate || '') }}</p>
                <span v-if="assignModal.order?.orderIsUrgent" class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-red-50 text-red-600 border border-red-200 rounded-[4px] ml-auto sm:ml-0">ด่วน</span>
              </div>
            </div>

            <!-- Modal Body (Editors List) -->
            <div class="p-6 overflow-y-auto flex-1 bg-[#e5e9e1]">
              <label class="block text-xs font-semibold text-[#172c3b] mb-3">เลือก Editor ที่ต้องการมอบหมาย</label>
              <div class="space-y-2">
                <label v-for="ed in editors" :key="ed.userId" class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all" :class="assignModal.selectedEditorId === ed.userId ? 'bg-[#fcf9f3] border-[#172c3b]/20 shadow-sm' : 'bg-transparent border-transparent hover:bg-[#fcf9f3] hover:border-[#172c3b]/10'">
                  <div class="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full border" :class="assignModal.selectedEditorId === ed.userId ? 'border-[#172c3b] bg-[#172c3b]' : 'border-[#D4D4D4] bg-[#fcf9f3]'">
                    <svg v-if="assignModal.selectedEditorId === ed.userId" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <input type="radio" :value="ed.userId" v-model="assignModal.selectedEditorId" class="hidden" />
                  <div class="flex-1 min-w-0">
                    <p class="text-[13px] font-semibold text-[#172c3b] truncate">{{ ed.name }}</p>
                    <p class="text-[11px] text-[#52616a] truncate mt-0.5">{{ ed.email }}</p>
                  </div>
                  <div class="text-right flex-shrink-0 flex items-center gap-3">
                    <div class="text-center min-w-[36px]">
                      <p class="text-[13px] font-semibold text-[#172c3b] font-mono">{{ ed.activeJobs }}</p>
                      <p class="text-[10px] font-medium text-[#52616a]">กำลังทำ</p>
                    </div>
                    <div class="text-center pl-3 border-l border-[#172c3b]/10 min-w-[48px]">
                      <p class="text-[13px] font-semibold text-[#172c3b] font-mono">{{ ed.completedJobs }}</p>
                      <p class="text-[10px] font-medium text-[#52616a]">เสร็จแล้ว</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-6 pt-4 border-t border-[#172c3b]/10 bg-[#fcf9f3] flex gap-2 justify-end">
              <button @click="assignModal.open = false" class="px-4 py-2 text-[13px] font-medium text-[#52616a] hover:text-[#172c3b] hover:bg-black/[0.04] transition-colors rounded-xl">
                ยกเลิก
              </button>
              <button
                :disabled="!assignModal.selectedEditorId || assignModal.loading"
                @click="handleAssign"
                class="admin-primary inline-flex items-center justify-center px-4 py-2 text-[13px] font-semibold text-white bg-[#172c3b] hover:bg-[#294655] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl shadow-sm border border-transparent"
              >
                <svg v-if="assignModal.loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                ยืนยันมอบหมาย
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
:deep(p.text-sm.text-gray-700) {
  display: none !important;
}

/* Override shared DataTable styles to match Dashboard neutral tones */
.assignments-table-scope :deep(.rounded-xl) {
  border-radius: 0 !important;
  border-color: rgba(0, 0, 0, 0.06) !important;
}

.assignments-table-scope :deep(thead.bg-gray-50) {
  background-color: #e5e9e1 !important;
  border-bottom-color: rgba(0, 0, 0, 0.06) !important;
}

.assignments-table-scope :deep(tbody.bg-white tr:hover) {
  background-color: #eee7db !important;
}

.assignments-table-scope :deep(tbody.bg-white.divide-gray-100 > tr) {
  border-color: rgba(0, 0, 0, 0.04) !important;
}
</style>
