<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import { orderService } from "~/services/order.service"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()

const packages = ref<any[]>([])
const loading = ref(true)
const error = ref("")
const saving = ref(false)

const showForm = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const form = reactive({
  packageName: "",
  packagePrice: 0,
  packageImageCount: 1,
  packageResolution: "Full HD",
  packageDeliveryDays: 3,
  packageUrgentPrice: 0,
  packageGalleryDiscount: 20,
  packageDescription: ""
})

const fetchPackages = async () => {
  loading.value = true
  error.value = ""
  try {
    const data = await orderService.getPackages()
    packages.value = data
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถดึงข้อมูลแพ็กเกจได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPackages()
})

const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  form.packageName = ""
  form.packagePrice = 0
  form.packageImageCount = 1
  form.packageResolution = "Full HD"
  form.packageDeliveryDays = 3
  form.packageUrgentPrice = 0
  form.packageGalleryDiscount = 20
  form.packageDescription = ""
  showForm.value = true
}

const handleEdit = (pkg: any) => {
  isEdit.value = true
  currentId.value = pkg.packageId
  form.packageName = pkg.packageName
  form.packagePrice = pkg.packagePrice
  form.packageImageCount = pkg.packageImageCount
  form.packageResolution = pkg.packageResolution
  form.packageDeliveryDays = pkg.packageDeliveryDays
  form.packageUrgentPrice = pkg.packageUrgentPrice
  form.packageGalleryDiscount = pkg.packageGalleryDiscount
  form.packageDescription = pkg.packageDescription || ""
  showForm.value = true
}

const handleSubmit = async () => {
  saving.value = true
  try {
    if (isEdit.value && currentId.value) {
      await apiFetch(`/packages/${currentId.value}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      alert("อัปเดตแพ็กเกจสำเร็จ")
    } else {
      await apiFetch("/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      alert("สร้างแพ็กเกจสำเร็จ")
    }
    showForm.value = false
    fetchPackages()
  } catch (err: any) {
    alert(err?.message || "ดำเนินการไม่สำเร็จ")
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm("คุณแน่ใจหรือไม่ที่จะลบแพ็กเกจนี้?")) return
  
  try {
    await apiFetch(`/packages/${id}`, {
      method: "DELETE"
    })
    alert("ลบแพ็กเกจเรียบร้อยแล้ว")
    fetchPackages()
  } catch (err: any) {
    alert(err?.message || "ลบแพ็กเกจไม่สำเร็จ")
  }
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">📦 จัดการแพ็กเกจราคา</h1>
        <p class="text-slate-500 text-sm mt-1">เพิ่ม แก้ไข หรือลบแพ็กเกจสำหรับคำสั่งซื้อของลูกค้าในระบบ</p>
      </div>
      <div>
        <button @click="handleAdd" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition">
          ➕ เพิ่มแพ็กเกจใหม่
        </button>
      </div>
    </div>

    <!-- Edit/Add Modal Overlay -->
    <div v-if="showForm" class="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 max-w-2xl">
      <h3 class="font-bold text-slate-800 text-base border-b pb-2">
        {{ isEdit ? '✏️ แก้ไขข้อมูลแพ็กเกจ' : '➕ เพิ่มแพ็กเกจใหม่' }}
      </h3>
      
      <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-400 uppercase mb-1">ชื่อแพ็กเกจ</label>
            <input v-model="form.packageName" required type="text" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700" />
          </div>
          <div>
            <label class="block font-bold text-slate-400 uppercase mb-1">ราคาฐาน (฿)</label>
            <input v-model="form.packagePrice" required type="number" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block font-bold text-slate-400 uppercase mb-1">จำนวนรูปที่ได้รับ</label>
            <input v-model="form.packageImageCount" required type="number" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700" />
          </div>
          <div>
            <label class="block font-bold text-slate-400 uppercase mb-1">ความละเอียดภาพ</label>
            <input v-model="form.packageResolution" required type="text" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700" />
          </div>
          <div>
            <label class="block font-bold text-slate-400 uppercase mb-1">ระยะเวลาส่งงาน (วัน)</label>
            <input v-model="form.packageDeliveryDays" required type="number" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-400 uppercase mb-1">บวกเพิ่มค่าเร่งด่วน (฿)</label>
            <input v-model="form.packageUrgentPrice" required type="number" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700" />
          </div>
          <div>
            <label class="block font-bold text-slate-400 uppercase mb-1">ส่วนลด Gallery (%)</label>
            <input v-model="form.packageGalleryDiscount" required type="number" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700" />
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-400 uppercase mb-1">รายละเอียดเพิ่มเติม</label>
          <textarea v-model="form.packageDescription" rows="2" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 resize-none" />
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t">
          <button @click="showForm = false" type="button" class="bg-white border text-slate-600 font-bold px-4 py-2 rounded-lg">ยกเลิก</button>
          <button :disabled="saving" type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg">บันทึก</button>
        </div>
      </form>
    </div>

    <!-- Packages List Table -->
    <div v-if="loading" class="bg-white rounded-3xl p-16 text-center border shadow-sm">
      <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
      <p class="text-slate-400 font-medium">กำลังโหลดข้อมูลแพ็กเกจ...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-2xl border text-center font-bold text-sm">
      ⚠️ {{ error }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="pkg in packages" :key="pkg.packageId" class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-center justify-between border-b pb-2">
            <h3 class="font-bold text-slate-800 text-base">{{ pkg.packageName }}</h3>
            <span class="text-indigo-600 font-extrabold text-base">฿{{ pkg.packagePrice.toLocaleString() }}</span>
          </div>
          
          <ul class="text-xs text-slate-500 space-y-2 mt-3 font-medium">
            <li>🖼️ รูปภาพที่ได้รับ: {{ pkg.packageImageCount }} ภาพ</li>
            <li>🔍 ความละเอียด: {{ pkg.packageResolution }}</li>
            <li>📅 ส่งมอบภายใน: {{ pkg.packageDeliveryDays }} วัน</li>
            <li>⚡ ค่าส่งด่วน: +฿{{ pkg.packageUrgentPrice.toLocaleString() }}</li>
            <li>🎁 ส่วนลด Portfolio: {{ pkg.packageGalleryDiscount }}%</li>
          </ul>
        </div>

        <div class="flex justify-end gap-2 border-t pt-3">
          <button @click="handleEdit(pkg)" class="text-xs font-bold text-indigo-600 hover:underline">✏️ แก้ไข</button>
          <button @click="handleDelete(pkg.packageId)" class="text-xs font-bold text-red-600 hover:underline">🗑️ ลบ</button>
        </div>
      </div>
    </div>
  </div>
</template>
