<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import type { User } from "~/types/user.types"
import Pagination from "~/components/ui/Pagination.vue"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()
const { alert } = useAlert()

// ── State ──────────────────────────────────────────────────────
const users = ref<User[]>([])
const loading = ref(true)
const error = ref("")
const searchQuery = ref("")
const roleFilter = ref("all")

const currentPage = ref(1)
const totalPages = ref(1)
const totalRecords = ref(0)
const limit = 10

// Modal
const modal = ref({ open: false, mode: "add" as "add" | "edit", loading: false })
const form = ref({ userId: 0, userFirstName: "", userLastName: "", userEmail: "", userPhone: "", userRole: "customer" as "admin" | "editor" | "customer", userPassword: "" })
const phoneError = ref("")

// Delete confirm
const deleteDialog = ref({ open: false, loading: false, userId: 0, name: "" })

// ── API ────────────────────────────────────────────────────────
const fetchUsers = async (page = 1) => {
  loading.value = true
  error.value = ""
  try {
    const data = await apiFetch<any>(`/users?page=${page}&limit=${limit}`)
    users.value = data.data || []
    currentPage.value = data.page || 1
    totalPages.value = data.totalPages || 1
    totalRecords.value = data.total || 0
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถโหลดข้อมูลผู้ใช้ได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchUsers())

const handlePageChange = (page: number) => {
  fetchUsers(page)
}

// ── Filters ────────────────────────────────────────────────────
const roleOptions = [
  { key: "all", label: "ทั้งหมด" },
  { key: "admin", label: "ผู้ดูแลระบบ" },
  { key: "editor", label: "นักออกแบบ" },
  { key: "customer", label: "ลูกค้า" }
]

const filteredUsers = computed(() => {
  let result = users.value
  if (roleFilter.value !== "all") result = result.filter(u => u.userRole === roleFilter.value)
  const q = searchQuery.value.toLowerCase().trim()
  if (q) result = result.filter(u =>
    (u.userFirstName ?? "").toLowerCase().includes(q) ||
    (u.userLastName ?? "").toLowerCase().includes(q) ||
    (u.userEmail ?? "").toLowerCase().includes(q)
  )
  return result
})

// ── Table columns ──────────────────────────────────────────────
const columns = [
  { key: "avatar", label: "ผู้ใช้งาน" },
  { key: "userEmail", label: "อีเมล" },
  { key: "userPhone", label: "เบอร์โทรศัพท์" },
  { key: "userRole", label: "บทบาท" },
  { key: "userCreatedAt", label: "วันที่สมัคร" },
  { key: "action", label: "การจัดการ", align: "center" as const }
]

// ── Modal ──────────────────────────────────────────────────────
const openAdd = () => {
  form.value = { userId: 0, userFirstName: "", userLastName: "", userEmail: "", userPhone: "", userRole: "customer", userPassword: "" }
  phoneError.value = ""
  modal.value = { open: true, mode: "add", loading: false }
}

const openEdit = (user: User) => {
  form.value = { userId: user.userId, userFirstName: user.userFirstName, userLastName: user.userLastName, userEmail: user.userEmail, userPhone: user.userPhone ?? "", userRole: user.userRole, userPassword: "" }
  phoneError.value = ""
  modal.value = { open: true, mode: "edit", loading: false }
}

const closeModal = () => { modal.value.open = false }

// Connect to POST /users or PATCH /users/:id
// Password is sent as plaintext — backend uses bcrypt to hash it
const saveUser = async () => {
  // Validate phone
  const phoneRegex = /^[0-9]{10}$/
  if (!form.value.userPhone || !phoneRegex.test(form.value.userPhone)) {
    phoneError.value = "กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก"
    return
  }
  phoneError.value = ""

  modal.value.loading = true
  try {
    if (modal.value.mode === "edit") {
      // Omit userPassword from PATCH if left blank (no change)
      const { userPassword, ...rest } = form.value
      const payload = userPassword.trim() ? { ...rest, userPassword } : rest
      await apiFetch(`/users/${form.value.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    } else {
      // Always include password when creating a new user
      await apiFetch("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.value)
      })
    }
    closeModal()
    fetchUsers()
  } catch (err: any) {
    alert("แจ้งเตือน", err?.message || "ดำเนินการไม่สำเร็จ", "error")
  } finally {
    modal.value.loading = false
  }
}

// ── Delete ─────────────────────────────────────────────────────
const openDelete = (user: User) => {
  deleteDialog.value = { open: true, loading: false, userId: user.userId, name: `${user.userFirstName} ${user.userLastName}` }
}

const confirmDelete = async () => {
  deleteDialog.value.loading = true
  try {
    await apiFetch(`/users/${deleteDialog.value.userId}`, { method: "DELETE" })
    deleteDialog.value.open = false
    fetchUsers()
  } catch (err: any) {
    alert("แจ้งเตือน", err?.message || "ลบไม่สำเร็จ", "error")
  } finally {
    deleteDialog.value.loading = false
  }
}

// ── Helpers ────────────────────────────────────────────────────
const roleBadgeClass = (role: string) => ({
  admin: "bg-[#171717] text-white border-transparent",
  editor: "bg-[#EFEFEA] text-[#171717] border-white/50 shadow-[0_1px_4px_rgba(0,0,0,0.005)]",
  customer: "bg-[#F7F7F5] text-[#9A9A95] border-[#EFEFEA]"
}[role] ?? "bg-[#F7F7F5] text-[#9A9A95] border-[#EFEFEA]")

const roleLabel = (role: string) => ({ admin: "ผู้ดูแลระบบ", editor: "นักออกแบบ", customer: "ลูกค้า" }[role] ?? role)

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "—"

const initials = (u: User) => ((u.userFirstName?.[0] ?? "") + (u.userLastName?.[0] ?? "")).toUpperCase() || "?"

const breadcrumb = [
  { label: "หน้าแรก", to: "/admin/dashboard" },
  { label: "บัญชีผู้ใช้" }
]
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <AdminBreadcrumb :items="breadcrumb" />
      <button
        @click="() => fetchUsers(currentPage)"
        class="px-4 py-2 rounded-full border border-black/[0.06] bg-white text-[13px] font-medium text-[#171717] hover:bg-[#F7F7F5] transition-colors shadow-sm flex items-center gap-2"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        รีเฟรช
      </button>
    </div>

    <!-- Users Workspace Card -->
    <div class="bg-white/90 backdrop-blur-md border border-black/[0.06] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col">
      
      <!-- Header & Search -->
      <div class="px-6 pt-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-[#171717] tracking-tight">บัญชีผู้ใช้ทั้งหมด</h2>
          <p class="text-[13px] font-medium text-[#666666] mt-0.5">จัดการข้อมูลบัญชีลูกค้า นักออกแบบ และผู้ดูแลระบบ</p>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="flex items-center gap-2 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl px-3 py-2 focus-within:bg-white focus-within:border-black/[0.12] focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all">
            <svg class="w-4 h-4 text-[#929292] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input v-model="searchQuery" type="text" placeholder="ค้นหาชื่อ, อีเมล..." class="text-xs text-[#171717] bg-transparent outline-none w-48 placeholder:text-[#9A9A95]" />
          </div>
          <button @click="openAdd" class="px-4 py-2 text-[13px] font-semibold text-white bg-black hover:bg-[#171717] transition-colors rounded-xl shadow-sm border border-black/[0.06] whitespace-nowrap">
            เพิ่มผู้ใช้ใหม่
          </button>
        </div>
      </div>

      <!-- Filter Row -->
      <div class="px-4 sm:px-6 pb-4 border-b border-black/[0.06] overflow-x-auto">
        <AdminFilterBar v-model="roleFilter" :filters="roleOptions" />
      </div>

      <!-- Error -->
      <div v-if="error" class="p-12 text-center">
        <p class="text-sm text-red-600 font-medium">{{ error }}</p>
        <button @click="() => fetchUsers(currentPage)" class="mt-2 text-xs text-[#9A9A95] underline">ลองใหม่</button>
      </div>

      <!-- Table -->
      <div v-else class="flex flex-col flex-1">
        <div class="overflow-x-auto bg-[#FDFDFB]/30 users-table-scope">
          <AdminDataTable :columns="columns" :rows="filteredUsers" :loading="loading" row-key="userId">
            <!-- Avatar + Name -->
            <template #cell-avatar="{ row }">
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-full bg-[#EFEFEA] border border-white/50 flex items-center justify-center text-[10px] font-bold text-[#171717] flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  {{ initials(row as any) }}
                </div>
                <span class="text-[13px] font-medium text-[#171717]">{{ row.userFirstName }} {{ row.userLastName }}</span>
              </div>
            </template>
            <!-- Email -->
            <template #cell-userEmail="{ value }">
              <span class="text-xs text-[#666666] font-number">{{ value }}</span>
            </template>
            <!-- Phone -->
            <template #cell-userPhone="{ value }">
              <span class="text-xs text-[#9A9A95] font-number">{{ value || "—" }}</span>
            </template>
            <!-- Role badge -->
            <template #cell-userRole="{ value }">
              <span 
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap"
                :class="{
                  'bg-[#171717] text-white border-[#171717] shadow-sm': value === 'admin',
                  'bg-[#F7F7F5] text-[#171717] border-black/[0.06] shadow-sm': value === 'editor',
                  'bg-[#FDFDFB] text-[#666666] border-black/[0.04]': value !== 'admin' && value !== 'editor'
                }"
              >
                {{ roleLabel(value) }}
              </span>
            </template>
            <!-- Date -->
            <template #cell-userCreatedAt="{ value }">
              <span class="text-xs text-[#9A9A95]">{{ formatDate(value) }}</span>
            </template>
            <!-- Actions -->
            <template #cell-action="{ row }">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  @click="openEdit(row as any)"
                  class="px-2 py-1 text-[11px] font-semibold text-[#171717] bg-white hover:bg-[#F7F7F5] transition-colors rounded shadow-sm border border-black/[0.06]"
                >
                  แก้ไข
                </button>
                <button
                  @click="openDelete(row as any)"
                  class="px-2 py-1 text-[11px] font-semibold text-[#C53030] bg-[#FFF5F5] hover:bg-[#FED7D7] transition-colors rounded shadow-sm border border-[#FEB2B2]"
                >
                  ลบ
                </button>
              </div>
            </template>
          </AdminDataTable>
        </div>

        <!-- Empty state -->
        <AdminEmptyState
          v-if="!loading && filteredUsers.length === 0"
          title="ไม่พบผู้ใช้งาน"
          description="ไม่มีบัญชีผู้ใช้ที่ตรงกับเงื่อนไขที่เลือก"
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />

        <!-- Pagination wrapper -->
        <div v-if="totalPages > 1" class="px-6 py-4 border-t border-black/[0.06] flex items-center justify-between bg-[#FDFDFB]/50">
          <div class="hidden sm:block text-xs text-[#666666]">
            <span class="font-bold text-[#171717]">{{ ((currentPage - 1) * limit) + 1 }}</span>–<span class="font-bold text-[#171717]">{{ Math.min(currentPage * limit, totalRecords) }}</span> จาก <span class="font-bold text-[#171717]">{{ totalRecords }}</span> รายการ
          </div>
          <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            :total="totalRecords"
            :limit="limit"
            @page-change="handlePageChange"
            class="!border-0 !shadow-none !mt-0 !rounded-none !p-0 !bg-transparent flex-1 sm:flex-initial"
          />
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />
          <div class="relative bg-white/95 backdrop-blur-[15px] rounded-[24px] shadow-2xl border border-black/[0.06] w-full max-w-md p-0 overflow-hidden flex flex-col max-h-[90vh]">
            
            <!-- Modal Header -->
            <div class="p-6 pb-4 border-b border-black/[0.06] bg-white">
              <h3 class="text-[17px] font-semibold text-[#171717] tracking-tight mb-2">
                {{ modal.mode === "edit" ? "แก้ไขบัญชีผู้ใช้" : "เพิ่มผู้ใช้ใหม่" }}
              </h3>
              <p class="text-[13px] text-[#666666]">
                {{ modal.mode === "edit" ? "แก้ไขข้อมูลรายละเอียดของบัญชีผู้ใช้ในระบบ" : "สร้างบัญชีผู้ใช้ใหม่สำหรับลูกค้า Editor หรือผู้ดูแลระบบ" }}
              </p>
            </div>
            
            <!-- Modal Body -->
            <div class="p-6 overflow-y-auto flex-1 bg-[#FDFDFB]/50">
              <form id="userForm" @submit.prevent="saveUser" class="space-y-4">
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-semibold text-[#171717] mb-1.5">ชื่อ</label>
                    <input v-model="form.userFirstName" required type="text" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717] placeholder:text-[#9A9A95]" />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[#171717] mb-1.5">นามสกุล</label>
                    <input v-model="form.userLastName" required type="text" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717] placeholder:text-[#9A9A95]" />
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[#171717] mb-1.5">อีเมล</label>
                  <input v-model="form.userEmail" required type="email" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717] placeholder:text-[#9A9A95]" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[#171717] mb-1.5">
                    รหัสผ่าน
                    <span v-if="modal.mode === 'edit'" class="text-[#9A9A95] font-normal">(เว้นว่างไว้หากไม่ต้องการเปลี่ยน)</span>
                  </label>
                  <input
                    v-model="form.userPassword"
                    :required="modal.mode === 'add'"
                    type="password"
                    :placeholder="modal.mode === 'edit' ? '••••••••' : 'รหัสผ่านใหม่'"
                    class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717] placeholder:text-[#9A9A95]"
                  />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[#171717] mb-1.5">เบอร์โทรศัพท์</label>
                  <input v-model="form.userPhone" required type="text" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717] placeholder:text-[#9A9A95]" @input="phoneError = ''" maxlength="10" />
                  <p v-if="phoneError" class="text-[10px] font-bold text-red-600 mt-1">{{ phoneError }}</p>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[#171717] mb-1.5">บทบาท (Role)</label>
                  <select v-model="form.userRole" class="w-full text-[13px] px-3 py-2.5 bg-[#F7F7F5]/50 border border-black/[0.06] rounded-xl focus:outline-none focus:bg-white focus:border-black/[0.12] transition-all font-medium text-[#171717]">
                    <option value="customer">ลูกค้า</option>
                    <option value="editor">นักออกแบบ</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                </div>
              </form>
            </div>
            
            <!-- Modal Footer -->
            <div class="p-6 pt-4 border-t border-black/[0.06] bg-white flex gap-2 justify-end">
              <button type="button" @click="closeModal" class="px-4 py-2 text-[13px] font-medium text-[#666666] hover:text-[#171717] hover:bg-black/[0.04] transition-colors rounded-xl">
                ยกเลิก
              </button>
              <button
                type="submit"
                form="userForm"
                :disabled="modal.loading"
                class="inline-flex items-center justify-center px-4 py-2 text-[13px] font-semibold text-white bg-black hover:bg-[#171717] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl shadow-sm border border-black/[0.06]"
              >
                <svg v-if="modal.loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                บันทึก
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirm -->
    <AdminConfirmDialog
      :open="deleteDialog.open"
      title="ยืนยันการลบบัญชีผู้ใช้"
      :message="`คุณต้องการลบบัญชีของ '${deleteDialog.name}' ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`"
      confirm-label="ลบบัญชี"
      :danger="true"
      :loading="deleteDialog.loading"
      @confirm="confirmDelete"
      @cancel="deleteDialog.open = false"
    />
  </div>
</template>

<style scoped>
:deep(p.text-sm.text-gray-700) {
  display: none !important;
}

/* Override shared DataTable styles to match Dashboard neutral tones */
.users-table-scope :deep(.rounded-xl) {
  border-radius: 0 !important;
  border-color: rgba(0, 0, 0, 0.06) !important;
}

.users-table-scope :deep(thead.bg-gray-50) {
  background-color: rgba(247, 247, 245, 0.8) !important;
  border-bottom-color: rgba(0, 0, 0, 0.06) !important;
}

.users-table-scope :deep(tbody.bg-white tr:hover) {
  background-color: #FDFDFB !important;
}

.users-table-scope :deep(tbody.bg-white.divide-gray-100 > tr) {
  border-color: rgba(0, 0, 0, 0.04) !important;
}
</style>
