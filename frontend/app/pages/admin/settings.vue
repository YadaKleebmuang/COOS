<script setup lang="ts">
import { ref, reactive } from "vue"
import { useApi } from "~/composables/useApi"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()

interface AdminAccount {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ── State ──────────────────────────────────────────────────────
const saving = ref<boolean>(false)
const saved = ref<boolean>(false)
const saveError = ref<string | null>(null)

const adminAccount = reactive<AdminAccount>({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
})

// ── Save handlers (API-ready) ──────────────────────────────────
const savePassword = async () => {
  saveError.value = null

  // Frontend Validation
  if (!adminAccount.currentPassword) {
    saveError.value = "กรุณาระบุรหัสผ่านปัจจุบัน"
    return
  }
  if (!adminAccount.newPassword) {
    saveError.value = "กรุณาระบุรหัสผ่านใหม่"
    return
  }
  if (!adminAccount.confirmPassword) {
    saveError.value = "กรุณายืนยันรหัสผ่านใหม่"
    return
  }
  if (adminAccount.newPassword.length < 8) {
    saveError.value = "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร"
    return
  }
  if (adminAccount.newPassword !== adminAccount.confirmPassword) {
    saveError.value = "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน"
    return
  }

  saving.value = true
  try {
    await apiFetch("/users/me/password", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        oldPassword: adminAccount.currentPassword,
        newPassword: adminAccount.newPassword
      })
    })
    
    // Clear form on success
    adminAccount.currentPassword = ""
    adminAccount.newPassword = ""
    adminAccount.confirmPassword = ""

    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } catch (err: any) {
    saveError.value = "เกิดข้อผิดพลาด: " + (err.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้")
    setTimeout(() => { saveError.value = null }, 5000)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="admin-page space-y-6 max-w-4xl mx-auto pb-12">
    <!-- Page Header -->
    <div class="admin-page-heading mb-8">
      <div class="admin-breadcrumb flex items-center gap-2 text-[13px] font-medium text-[#52616a] mb-3">
        <NuxtLink to="/admin/dashboard" class="hover:text-[#172c3b] transition-colors">หน้าแรก</NuxtLink>
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        <span class="text-[#172c3b]">ตั้งค่า</span>
      </div>
      <p class="admin-eyebrow">ACCOUNT SETTINGS</p>
      <h1 class="text-2xl sm:text-3xl font-semibold text-[#172c3b] tracking-tight">ตั้งค่า</h1>
      <p class="mt-1 text-sm font-medium text-[#52616a]">จัดการความปลอดภัยของบัญชีผู้ดูแลระบบ</p>
    </div>

    <!-- Global Error -->
    <div v-if="saveError" class="p-4 bg-[#FFF5F5] border border-[#FEB2B2] rounded-xl flex items-center gap-3">
      <svg class="w-5 h-5 text-[#C53030] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
      <p class="text-[13px] font-medium text-[#C53030]">{{ saveError }}</p>
    </div>

    <!-- ── Admin Account ── -->
    <div class="bg-[#fcf9f3] border border-[#172c3b]/10 rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden">
      <div class="px-6 py-5 border-b border-[#172c3b]/10">
        <h2 class="text-lg font-semibold text-[#172c3b] tracking-tight">บัญชีผู้ดูแลระบบ</h2>
        <p class="text-[13px] font-medium text-[#52616a] mt-0.5">เปลี่ยนรหัสผ่านสำหรับบัญชีผู้ดูแลระบบที่กำลังเข้าสู่ระบบ</p>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="sm:col-span-1 lg:col-span-1">
            <label class="block text-[13px] font-semibold text-[#172c3b] mb-1.5">รหัสผ่านปัจจุบัน</label>
            <input v-model="adminAccount.currentPassword" type="password" class="w-full h-10 px-3 text-[13px] text-[#172c3b] bg-[#fcf9f3] border border-[#172c3b]/20 rounded-lg focus:outline-none focus:border-[#172c3b] focus:ring-1 focus:ring-[#172c3b] transition-shadow"/>
          </div>
          <div class="sm:col-span-1 lg:col-span-1">
            <label class="block text-[13px] font-semibold text-[#172c3b] mb-1.5">รหัสผ่านใหม่</label>
            <input v-model="adminAccount.newPassword" type="password" class="w-full h-10 px-3 text-[13px] text-[#172c3b] bg-[#fcf9f3] border border-[#172c3b]/20 rounded-lg focus:outline-none focus:border-[#172c3b] focus:ring-1 focus:ring-[#172c3b] transition-shadow"/>
          </div>
          <div class="sm:col-span-1 lg:col-span-1">
            <label class="block text-[13px] font-semibold text-[#172c3b] mb-1.5">ยืนยันรหัสผ่านใหม่</label>
            <input v-model="adminAccount.confirmPassword" type="password" class="w-full h-10 px-3 text-[13px] text-[#172c3b] bg-[#fcf9f3] border border-[#172c3b]/20 rounded-lg focus:outline-none focus:border-[#172c3b] focus:ring-1 focus:ring-[#172c3b] transition-shadow"/>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-3 pt-5 border-t border-[#172c3b]/10">
          <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-1">
            <div v-if="saved" class="flex items-center gap-1.5 text-[12px] font-semibold text-[#172c3b]">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              บันทึกแล้ว
            </div>
          </transition>
          <button @click="savePassword" :disabled="saving" class="admin-primary px-5 py-2 rounded-lg bg-[#172c3b] text-white text-[13px] font-medium hover:bg-black transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            บันทึกรหัสผ่าน
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
