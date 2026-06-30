<script setup lang="ts">
import { ref, reactive } from "vue"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

// ── Types ──────────────────────────────────────────────────────
interface SystemSettings {
  maxUploadSizeMb: number
  allowedImageTypes: string
  orderAutoExpireDays: number
  depositPercentage: number
  maintenanceMode: boolean
}

interface StudioInfo {
  studioName: string
  studioEmail: string
  studioPhone: string
  studioAddress: string
  studioLineId: string
  studioFacebook: string
  studioInstagram: string
}

interface AdminAccount {
  currentEmail: string
  newEmail: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ── State ──────────────────────────────────────────────────────
const saving = ref<string | null>(null)
const savedSection = ref<string | null>(null)

const systemSettings = reactive<SystemSettings>({
  maxUploadSizeMb: 20,
  allowedImageTypes: "jpg,jpeg,png,webp",
  orderAutoExpireDays: 7,
  depositPercentage: 30,
  maintenanceMode: false
})

const studioInfo = reactive<StudioInfo>({
  studioName: "COOS Studio",
  studioEmail: "hello@coos.studio",
  studioPhone: "02-xxx-xxxx",
  studioAddress: "กรุงเทพมหานคร ประเทศไทย",
  studioLineId: "@coosstudio",
  studioFacebook: "facebook.com/coosstudio",
  studioInstagram: "@coos.studio"
})

const adminAccount = reactive<AdminAccount>({
  currentEmail: "admin@coos.studio",
  newEmail: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
})

// ── Save handlers (API-ready) ──────────────────────────────────
const saveSection = async (section: string) => {
  saving.value = section
  try {
    // Future: await apiFetch(`/settings/${section}`, { method: "PATCH", body: JSON.stringify({ ... }) })
    await new Promise(r => setTimeout(r, 700))
    savedSection.value = section
    setTimeout(() => { savedSection.value = null }, 2500)
  } finally {
    saving.value = null
  }
}

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "ตั้งค่า" }]
</script>

<template>
  <div class="space-y-6 max-w-3xl mx-auto">
    <!-- Header -->
    <div>
      <AdminBreadcrumb :items="breadcrumb" />
      <h1 class="mt-2 text-xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
      <p class="mt-0.5 text-sm text-gray-500">จัดการการตั้งค่าทั่วไปและข้อมูลสตูดิโอ</p>
    </div>

    <!-- ── System Settings ── -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-sm font-bold text-gray-900">การตั้งค่าระบบ</h2>
        <p class="text-xs text-gray-400 mt-0.5">กำหนดพฤติกรรมทั่วไปของระบบ</p>
      </div>
      <div class="p-6 space-y-5">
        <!-- Upload size -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">ขนาดไฟล์สูงสุด (MB)</label>
            <input v-model.number="systemSettings.maxUploadSizeMb" type="number" min="1" max="100" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">ประเภทไฟล์ที่อนุญาต</label>
            <input v-model="systemSettings.allowedImageTypes" type="text" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400" placeholder="jpg,png,webp"/>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">ออเดอร์หมดอายุใน (วัน)</label>
            <input v-model.number="systemSettings.orderAutoExpireDays" type="number" min="1" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">เปอร์เซ็นต์มัดจำ (%)</label>
            <input v-model.number="systemSettings.depositPercentage" type="number" min="0" max="100" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
          </div>
        </div>

        <!-- Maintenance mode -->
        <div class="flex items-center gap-3 py-3 border-t border-gray-100">
          <button
            @click="systemSettings.maintenanceMode = !systemSettings.maintenanceMode"
            class="relative w-10 h-5.5 h-[22px] rounded-full transition-colors flex-shrink-0"
            :class="systemSettings.maintenanceMode ? 'bg-gray-900' : 'bg-gray-200'"
          >
            <span class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" :class="systemSettings.maintenanceMode ? 'translate-x-[18px]' : 'translate-x-0'"/>
          </button>
          <div>
            <p class="text-sm font-medium text-gray-900">โหมดซ่อมบำรุง</p>
            <p class="text-xs text-gray-400">เปิดใช้งานเพื่อปิดหน้าเว็บไซต์ชั่วคราวสำหรับผู้ใช้ทั่วไป</p>
          </div>
          <span v-if="systemSettings.maintenanceMode" class="ml-auto text-xs text-red-600 font-medium">เปิดอยู่</span>
        </div>

        <!-- Save button -->
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <p v-if="savedSection === 'system'" class="text-xs text-gray-500 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            บันทึกแล้ว
          </p>
          <span v-else/>
          <AdminActionButton variant="primary" size="md" :loading="saving === 'system'" @click="saveSection('system')">บันทึกการตั้งค่า</AdminActionButton>
        </div>
      </div>
    </div>

    <!-- ── Studio Info ── -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-sm font-bold text-gray-900">ข้อมูลสตูดิโอ</h2>
        <p class="text-xs text-gray-400 mt-0.5">ข้อมูลที่แสดงบนหน้าเว็บและใช้ติดต่อลูกค้า</p>
      </div>
      <div class="p-6 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">ชื่อสตูดิโอ</label>
            <input v-model="studioInfo.studioName" type="text" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">อีเมลติดต่อ</label>
            <input v-model="studioInfo.studioEmail" type="email" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">เบอร์โทรศัพท์</label>
            <input v-model="studioInfo.studioPhone" type="text" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">LINE ID</label>
            <input v-model="studioInfo.studioLineId" type="text" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Facebook</label>
            <input v-model="studioInfo.studioFacebook" type="text" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Instagram</label>
            <input v-model="studioInfo.studioInstagram" type="text" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5">ที่อยู่</label>
          <textarea v-model="studioInfo.studioAddress" rows="2" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"/>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <p v-if="savedSection === 'studio'" class="text-xs text-gray-500 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            บันทึกแล้ว
          </p>
          <span v-else/>
          <AdminActionButton variant="primary" size="md" :loading="saving === 'studio'" @click="saveSection('studio')">บันทึกข้อมูล</AdminActionButton>
        </div>
      </div>
    </div>

    <!-- ── Admin Account ── -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-100">
        <h2 class="text-sm font-bold text-gray-900">บัญชีผู้ดูแลระบบ</h2>
        <p class="text-xs text-gray-400 mt-0.5">เปลี่ยนอีเมลหรือรหัสผ่านของบัญชี Admin</p>
      </div>
      <div class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5">อีเมลปัจจุบัน</label>
          <input :value="adminAccount.currentEmail" disabled type="email" class="w-full text-sm px-3 py-2 border border-gray-100 rounded-lg bg-gray-50 text-gray-400"/>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5">อีเมลใหม่ (ถ้าต้องการเปลี่ยน)</label>
          <input v-model="adminAccount.newEmail" type="email" placeholder="อีเมลใหม่..." class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
        </div>
        <div class="border-t border-gray-100 pt-4">
          <p class="text-xs font-medium text-gray-500 mb-3">เปลี่ยนรหัสผ่าน</p>
          <div class="space-y-3">
            <input v-model="adminAccount.currentPassword" type="password" placeholder="รหัสผ่านปัจจุบัน" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
            <input v-model="adminAccount.newPassword" type="password" placeholder="รหัสผ่านใหม่" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
            <input v-model="adminAccount.confirmPassword" type="password" placeholder="ยืนยันรหัสผ่านใหม่" class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"/>
          </div>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
          <p v-if="savedSection === 'account'" class="text-xs text-gray-500 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            บันทึกแล้ว
          </p>
          <span v-else/>
          <AdminActionButton variant="primary" size="md" :loading="saving === 'account'" @click="saveSection('account')">บันทึกบัญชี</AdminActionButton>
        </div>
      </div>
    </div>
  </div>
</template>
