<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { useApi } from "~/composables/useApi"
import { orderService } from "~/services/order.service"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()

const workTypes = ref<any[]>([])
const loading = ref(true)
const error = ref("")
const saving = ref(false)

const showForm = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const form = reactive({
  workTypeName: "",
  workTypeDescription: ""
})

const fetchWorkTypes = async () => {
  loading.value = true
  error.value = ""
  try {
    const data = await orderService.getWorkTypes()
    workTypes.value = data
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถดึงข้อมูลประเภทงานได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchWorkTypes()
})

const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  form.workTypeName = ""
  form.workTypeDescription = ""
  showForm.value = true
}

const handleEdit = (wt: any) => {
  isEdit.value = true
  currentId.value = wt.workTypeId
  form.workTypeName = wt.workTypeName
  form.workTypeDescription = wt.workTypeDescription || ""
  showForm.value = true
}

const handleSubmit = async () => {
  saving.value = true
  try {
    if (isEdit.value && currentId.value) {
      await apiFetch(`/work-types/${currentId.value}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      alert("อัปเดตประเภทงานสำเร็จ")
    } else {
      await apiFetch("/work-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      alert("สร้างประเภทงานสำเร็จ")
    }
    showForm.value = false
    fetchWorkTypes()
  } catch (err: any) {
    alert(err?.message || "ดำเนินการไม่สำเร็จ")
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm("คุณแน่ใจหรือไม่ที่จะลบประเภทงานนี้?")) return
  
  try {
    await apiFetch(`/work-types/${id}`, {
      method: "DELETE"
    })
    alert("ลบประเภทงานเรียบร้อยแล้ว")
    fetchWorkTypes()
  } catch (err: any) {
    alert(err?.message || "ลบประเภทงานไม่สำเร็จ")
  }
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">🎨 จัดการประเภทงานแต่งภาพ</h1>
        <p class="text-slate-500 text-sm mt-1">ตั้งค่าและระบุชื่อประเภทงานแต่งภาพต่างๆ ที่พร้อมให้บริการบนหน้าร้านค้า</p>
      </div>
      <div>
        <button @click="handleAdd" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition">
          ➕ เพิ่มประเภทงานใหม่
        </button>
      </div>
    </div>

    <!-- Edit/Add Modal Overlay -->
    <div v-if="showForm" class="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 max-w-xl animate-fade-in">
      <h3 class="font-bold text-slate-800 text-base border-b pb-2">
        {{ isEdit ? '✏️ แก้ไขประเภทงาน' : '➕ เพิ่มประเภทงานใหม่' }}
      </h3>
      
      <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
        <div>
          <label class="block font-bold text-slate-400 uppercase mb-1">ชื่อประเภทงาน</label>
          <input v-model="form.workTypeName" required type="text" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700" placeholder="เช่น Realistic, Anime, Watercolor" />
        </div>

        <div>
          <label class="block font-bold text-slate-400 uppercase mb-1">รายละเอียดอธิบายประเภทงาน</label>
          <textarea v-model="form.workTypeDescription" rows="3" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 resize-none" placeholder="คำอธิบายสั้นๆ สำหรับแสดงให้ลูกค้าเห็น..." />
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t">
          <button @click="showForm = false" type="button" class="bg-white border text-slate-600 font-bold px-4 py-2 rounded-lg">ยกเลิก</button>
          <button :disabled="saving" type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg">บันทึก</button>
        </div>
      </form>
    </div>

    <!-- Work Types List Grid -->
    <div v-if="loading" class="bg-white rounded-3xl p-16 text-center border shadow-sm">
      <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
      <p class="text-slate-400 font-medium">กำลังโหลดประเภทงาน...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-2xl border text-center font-bold text-sm">
      ⚠️ {{ error }}
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="wt in workTypes" :key="wt.workTypeId" class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <h3 class="font-extrabold text-slate-800 text-base">🎨 {{ wt.workTypeName }}</h3>
          <p class="text-xs text-slate-500 mt-2 leading-relaxed font-semibold">{{ wt.workTypeDescription || "ไม่มีคำอธิบายเพิ่มเติม" }}</p>
        </div>

        <div class="flex justify-end gap-2 border-t pt-3">
          <button @click="handleEdit(wt)" class="text-xs font-bold text-indigo-600 hover:underline">✏️ แก้ไข</button>
          <button @click="handleDelete(wt.workTypeId)" class="text-xs font-bold text-red-600 hover:underline">🗑️ ลบ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
