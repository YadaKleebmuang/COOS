<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { useApi } from "~/composables/useApi"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()

const policies = ref<any[]>([])
const loading = ref(true)
const error = ref("")
const saving = ref(false)

const showForm = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const form = reactive({
  policyTitle: "",
  policyContent: "",
  policyType: "privacy",
  policyIsActive: true
})

const fetchPolicies = async () => {
  loading.value = true
  error.value = ""
  try {
    const data = await apiFetch("/policies")
    policies.value = data
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถดึงข้อมูลนโยบายได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPolicies()
})

const handleAdd = () => {
  isEdit.value = false
  currentId.value = null
  form.policyTitle = ""
  form.policyContent = ""
  form.policyType = "privacy"
  form.policyIsActive = true
  showForm.value = true
}

const handleEdit = (policy: any) => {
  isEdit.value = true
  currentId.value = policy.policyId
  form.policyTitle = policy.policyTitle
  form.policyContent = policy.policyContent || ""
  form.policyType = policy.policyType
  form.policyIsActive = !!policy.policyIsActive
  showForm.value = true
}

const handleSubmit = async () => {
  saving.value = true
  try {
    if (isEdit.value && currentId.value) {
      await apiFetch(`/policies/${currentId.value}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      alert("อัปเดตนโยบายสำเร็จ")
    } else {
      await apiFetch("/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      alert("สร้างนโยบายสำเร็จ")
    }
    showForm.value = false
    fetchPolicies()
  } catch (err: any) {
    alert(err?.message || "ดำเนินการไม่สำเร็จ")
  } finally {
    saving.value = false
  }
}

const handleDelete = async (id: number) => {
  if (!confirm("คุณแน่ใจหรือไม่ที่จะลบนโยบายนี้?")) return
  
  try {
    await apiFetch(`/policies/${id}`, {
      method: "DELETE"
    })
    alert("ลบนโยบายเรียบร้อยแล้ว")
    fetchPolicies()
  } catch (err: any) {
    alert(err?.message || "ลบนโยบายไม่สำเร็จ")
  }
}
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight">📄 จัดการนโยบายและเงื่อนไข</h1>
        <p class="text-slate-500 text-sm mt-1">แก้ไขนโยบายความเป็นส่วนตัว (Privacy Policy) และข้อตกลง AI Disclaimers สำหรับร้านค้า</p>
      </div>
      <div>
        <button @click="handleAdd" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition">
          ➕ เพิ่มนโยบายใหม่
        </button>
      </div>
    </div>

    <!-- Edit/Add Modal Overlay -->
    <div v-if="showForm" class="bg-slate-50 border border-slate-100 p-6 rounded-3xl space-y-4 max-w-2xl animate-fade-in">
      <h3 class="font-bold text-slate-800 text-base border-b pb-2">
        {{ isEdit ? '✏️ แก้ไขนโยบาย' : '➕ เพิ่มนโยบายใหม่' }}
      </h3>
      
      <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-400 uppercase mb-1">หัวข้อนโยบาย</label>
            <input v-model="form.policyTitle" required type="text" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700" placeholder="เช่น Privacy Policy 2026" />
          </div>
          <div>
            <label class="block font-bold text-slate-400 uppercase mb-1">ประเภทนโยบาย (Type)</label>
            <select v-model="form.policyType" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700">
              <option value="privacy">privacy</option>
              <option value="disclaimer">disclaimer</option>
              <option value="terms">terms</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-400 uppercase mb-1">รายละเอียดข้อความนโยบาย</label>
          <textarea v-model="form.policyContent" rows="6" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 resize-none" placeholder="พิมพ์ข้อความรายละเอียดนโยบายที่นี่..." />
        </div>

        <div class="flex items-center gap-2">
          <input v-model="form.policyIsActive" type="checkbox" id="policy-active" class="rounded text-indigo-600 focus:ring-indigo-500" />
          <label for="policy-active" class="font-bold text-slate-600">เปิดใช้งานนโยบายนี้ทันที</label>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t">
          <button @click="showForm = false" type="button" class="bg-white border text-slate-600 font-bold px-4 py-2 rounded-lg">ยกเลิก</button>
          <button :disabled="saving" type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg">บันทึก</button>
        </div>
      </form>
    </div>

    <!-- Policies List Table -->
    <div v-if="loading" class="bg-white rounded-3xl p-16 text-center border shadow-sm">
      <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
      <p class="text-slate-400 font-medium">กำลังโหลดข้อมูลนโยบายร้านค้า...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 text-red-600 p-6 rounded-2xl border text-center font-bold text-sm">
      ⚠️ {{ error }}
    </div>

    <div v-else class="space-y-6">
      <div v-for="policy in policies" :key="policy.policyId" class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <div>
            <h3 class="font-bold text-slate-800 text-base">📄 {{ policy.policyTitle }}</h3>
            <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              หมวดหมู่: {{ policy.policyType }}
            </span>
          </div>
          <span
            class="px-2.5 py-1 rounded-full text-[10px] font-black border uppercase"
            :class="policy.policyIsActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'"
          >
            {{ policy.policyIsActive ? 'Active' : 'Draft' }}
          </span>
        </div>
        
        <p class="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border font-semibold whitespace-pre-wrap">{{ policy.policyContent || "ไม่มีเนื้อหาของนโยบาย" }}</p>

        <div class="flex justify-end gap-2 pt-2 border-t">
          <button @click="handleEdit(policy)" class="text-xs font-bold text-indigo-600 hover:underline">✏️ แก้ไข</button>
          <button @click="handleDelete(policy.policyId)" class="text-xs font-bold text-red-600 hover:underline">🗑️ ลบ</button>
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
