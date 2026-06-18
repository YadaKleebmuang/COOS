<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { useApi } from "~/composables/useApi"

definePageMeta({
  layout: "editor",
  middleware: ["auth", "editor"]
})

const token = useCookie<string | null>("token")
const { apiFetch } = useApi()

const loading = ref(true)
const saving = ref(false)
const successMessage = ref("")
const errorMessage = ref("")

const profileForm = reactive({
  userFirstName: "",
  userLastName: "",
  userEmail: "", // Display only
  userPhone: "",
  userAddress: "",
  userProfileImage: "",
  facebook: "",
  line: "",
  tel: ""
})

const profileImageFile = ref<File | null>(null)
const previewImageUrl = ref("")

// Fetch user profile
const fetchProfile = async () => {
  loading.value = true
  errorMessage.value = ""
  try {
    const data = await apiFetch("/users/me")
    profileForm.userFirstName = data.userFirstName || ""
    profileForm.userLastName = data.userLastName || ""
    profileForm.userEmail = data.userEmail || ""
    profileForm.userPhone = data.userPhone || ""
    profileForm.userAddress = data.userAddress || ""
    profileForm.userProfileImage = data.userProfileImage || ""
    
    // Parse contact channels
    const channels = data.userContactChannels || {}
    profileForm.facebook = channels.facebook || ""
    profileForm.line = channels.line || ""
    profileForm.tel = channels.tel || ""
  } catch (err: any) {
    errorMessage.value = err?.message || "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})

const handleImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (!file.type.startsWith("image/")) {
      errorMessage.value = "กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น"
      return
    }
    profileImageFile.value = file
    previewImageUrl.value = URL.createObjectURL(file)
  }
}

const saveProfile = async () => {
  saving.value = true
  successMessage.value = ""
  errorMessage.value = ""
  
  try {
    const formData = new FormData()
    formData.append("userFirstName", profileForm.userFirstName)
    formData.append("userLastName", profileForm.userLastName)
    formData.append("userPhone", profileForm.userPhone)
    formData.append("userAddress", profileForm.userAddress)
    
    const channels = {
      facebook: profileForm.facebook,
      line: profileForm.line,
      tel: profileForm.tel
    }
    formData.append("userContactChannels", JSON.stringify(channels))
    
    if (profileImageFile.value) {
      formData.append("profileImage", profileImageFile.value)
    }

    const config = useRuntimeConfig()
    const headers = new Headers()
    if (token.value) {
      headers.set("Authorization", "Bearer " + token.value)
    }
    
    const response = await fetch(`${config.public.apiBase}/users/me`, {
      method: "PATCH",
      headers,
      body: formData
    })
    
    if (!response.ok) {
      const errRes = await response.json().catch(() => ({}))
      throw new Error(errRes.message || "บันทึกโปรไฟล์ไม่สำเร็จ")
    }

    const resData = await response.json()
    successMessage.value = "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!"
    
    if (resData.user) {
      profileForm.userProfileImage = resData.user.userProfileImage || ""
    }
    profileImageFile.value = null
    previewImageUrl.value = ""
    
    setTimeout(() => {
      window.location.reload()
    }, 1200)
    
  } catch (err: any) {
    errorMessage.value = err?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล"
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <div class="border-b border-slate-100 pb-4">
      <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">⚙️ แก้ไขข้อมูลโปรไฟล์ช่างภาพ</h1>
      <p class="text-slate-500 text-sm mt-1">อัปเดตข้อมูลส่วนตัว ช่องทางการติดต่อ และรูปภาพโปรไฟล์ผู้ปฏิบัติงาน</p>
    </div>

    <div v-if="loading" class="bg-white rounded-3xl p-16 text-center border shadow-sm">
      <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
      <p class="text-slate-400 font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
    </div>

    <form v-else @submit.prevent="saveProfile" class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Left Column: Avatar & Quick Info -->
      <div class="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col items-center text-center space-y-6">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">รูปโปรไฟล์</h3>
        
        <div class="relative group">
          <div class="w-32 h-32 rounded-full overflow-hidden border-2 border-indigo-100 shadow bg-slate-50 flex items-center justify-center">
            <img v-if="previewImageUrl" :src="previewImageUrl" class="w-full h-full object-cover" />
            <img v-else-if="profileForm.userProfileImage" :src="profileForm.userProfileImage" class="w-full h-full object-cover" />
            <div v-else class="text-4xl text-indigo-400 font-black">
              {{ profileForm.userFirstName[0]?.toUpperCase() }}
            </div>
          </div>
          <label class="absolute bottom-0 right-0 w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md transition group-hover:scale-105">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <input type="file" accept="image/*" class="hidden" @change="handleImageChange" />
          </label>
        </div>
        
        <div>
          <p class="font-bold text-slate-800 text-lg">{{ profileForm.userFirstName }} {{ profileForm.userLastName }}</p>
          <p class="text-xs text-slate-400 mt-0.5">{{ profileForm.userEmail }}</p>
        </div>
      </div>

      <!-- Right Column: Profile Fields Form (Col Span 2) -->
      <div class="md:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 class="text-base font-bold text-slate-800 border-b border-slate-50 pb-3">ข้อมูลส่วนตัวทั่วไป</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">ชื่อจริง</label>
            <input v-model="profileForm.userFirstName" required type="text" class="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-700 transition" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">นามสกุล</label>
            <input v-model="profileForm.userLastName" required type="text" class="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-700 transition" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">อีเมล (ไม่สามารถเปลี่ยนได้)</label>
          <input :value="profileForm.userEmail" disabled type="email" class="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">เบอร์โทรศัพท์</label>
            <input v-model="profileForm.userPhone" type="text" class="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-700 transition" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">เบอร์ติดต่อด่วน (Tel)</label>
            <input v-model="profileForm.tel" type="text" class="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-700 transition" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">ที่อยู่จัดส่ง / ที่อยู่ติดต่อ</label>
          <textarea v-model="profileForm.userAddress" rows="2" class="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-700 transition resize-none" />
        </div>

        <h3 class="text-base font-bold text-slate-800 border-b border-slate-50 pb-3 pt-4">ช่องทางโซเชียลสำหรับการส่งงาน</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Facebook Profile</label>
            <input v-model="profileForm.facebook" type="text" placeholder="ชื่อ Facebook" class="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-700 transition" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Line ID</label>
            <input v-model="profileForm.line" type="text" placeholder="ไลน์ไอดี" class="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm text-slate-700 transition" />
          </div>
        </div>

        <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <p class="text-green-600 text-xs font-bold text-center">✓ {{ successMessage }}</p>
        </div>
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p class="text-red-600 text-xs font-bold text-center">⚠️ {{ errorMessage }}</p>
        </div>

        <div class="flex justify-end pt-4">
          <button :disabled="saving" type="submit" class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition duration-200 shadow flex items-center gap-2">
            <span v-if="saving" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            {{ saving ? "กำลังบันทึก..." : "💾 บันทึกการเปลี่ยนแปลง" }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
