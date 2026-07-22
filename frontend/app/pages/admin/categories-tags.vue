<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useApi } from "~/composables/useApi"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()
const { alert } = useAlert()

// ── Types ──────────────────────────────────────────────────────
interface Hashtag { tagId: number; tagName: string; imageCount: number; createdAt: string }

// ── State ──────────────────────────────────────────────────────
const hashtags = ref<Hashtag[]>([])
const loading = ref(true)

// Hashtag modal
const tagModal = ref({ open: false, mode: "add" as "add" | "edit", loading: false, id: 0, name: "" })
const tagDelete = ref({ open: false, loading: false, id: 0, name: "" })

// ── Fetch ──────────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  try {
    const tgs = await apiFetch<any[]>("/tags").catch(() => [])

    hashtags.value = tgs.map(t => ({
      tagId: t.tagId,
      tagName: t.tagName,
      imageCount: 0,
      createdAt: t.createdAt || new Date().toISOString()
    }))
  } catch (error: any) {
    alert("แจ้งเตือน", "เกิดข้อผิดพลาดในการโหลดข้อมูล: " + error.message, "error")
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())

// ── Tag CRUD ───────────────────────────────────────────────────
const saveTag = async () => {
  tagModal.value.loading = true
  try {
    const formattedName = tagModal.value.name.trim().replace(/^#/, '')
    if (!formattedName) throw new Error("กรุณากรอกชื่อแฮชแท็กให้ถูกต้อง")

    if (tagModal.value.mode === "edit") {
      await apiFetch(`/tags/${tagModal.value.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagName: formattedName })
      })
      const idx = hashtags.value.findIndex(t => t.tagId === tagModal.value.id)
      if (idx !== -1) hashtags.value[idx].tagName = formattedName
    } else {
      await apiFetch("/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagName: formattedName })
      })
      await fetchData()
    }
    tagModal.value.open = false
  } catch (error: any) {
    alert("แจ้งเตือน", "เกิดข้อผิดพลาด: " + error.message, "error")
  } finally {
    tagModal.value.loading = false
  }
}

const confirmTagDelete = async () => {
  tagDelete.value.loading = true
  try {
    await apiFetch(`/tags/${tagDelete.value.id}`, { method: "DELETE" })
    hashtags.value = hashtags.value.filter(t => t.tagId !== tagDelete.value.id)
    tagDelete.value.open = false
  } catch (error: any) {
    alert("แจ้งเตือน", "เกิดข้อผิดพลาดในการลบ: " + error.message, "error")
  } finally {
    tagDelete.value.loading = false
  }
}

const tagColumns = [
  { key: "tagName", label: "แฮชแท็ก" },
  { key: "imageCount", label: "จำนวนภาพ", align: "center" as const },
  { key: "action", label: "การจัดการ", align: "center" as const }
]

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "จัดการแฮชแท็ก" }]
</script>

<template>
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <AdminBreadcrumb :items="breadcrumb" />
        <h1 class="mt-2 text-xl font-bold text-gray-900">จัดการแฮชแท็ก</h1>
        <p class="mt-0.5 text-sm text-gray-500">แฮชแท็กสำหรับจัดหมวดหมู่และค้นหารูปภาพใน Gallery</p>
      </div>
      <div class="flex gap-2">
        <AdminActionButton variant="secondary" size="sm" :loading="loading" @click="fetchData">รีเฟรช</AdminActionButton>
        <AdminActionButton variant="primary" size="sm" icon="M12 4v16m8-8H4" @click="tagModal = { open: true, mode: 'add', loading: false, id: 0, name: '' }">เพิ่มแท็ก</AdminActionButton>
      </div>
    </div>

    <!-- One-column layout for Tags -->
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <AdminDataTable :columns="tagColumns" :rows="hashtags" :loading="loading" row-key="tagId">
        <template #cell-tagName="{ value }">
          <span class="text-sm font-medium text-gray-900">#{{ value }}</span>
        </template>
        <template #cell-imageCount="{ value }">
          <span class="text-sm font-number text-gray-700">{{ value }}</span>
        </template>
        <template #cell-action="{ row }">
          <div class="flex items-center justify-center gap-1.5">
            <AdminActionButton variant="secondary" size="sm" @click="tagModal = { open: true, mode: 'edit', loading: false, id: row.tagId, name: row.tagName }">แก้ไข</AdminActionButton>
            <AdminActionButton variant="danger" size="sm" @click="tagDelete = { open: true, loading: false, id: row.tagId, name: row.tagName }">ลบ</AdminActionButton>
          </div>
        </template>
      </AdminDataTable>
      <AdminEmptyState v-if="!loading && hashtags.length === 0" title="ยังไม่มีแฮชแท็ก" description="กดเพิ่มแท็กเพื่อเริ่มต้น" icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
    </div>

    <!-- Tag Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="tagModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="tagModal.open = false"/>
          <div class="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm p-6">
            <h3 class="text-sm font-bold text-gray-900 mb-4">{{ tagModal.mode === "edit" ? "แก้ไขแฮชแท็ก" : "เพิ่มแฮชแท็ก" }}</h3>
            <label class="block text-xs font-medium text-gray-500 mb-1">ชื่อแฮชแท็ก (ไม่ต้องใส่ #)</label>
            <input v-model="tagModal.name" type="text" placeholder="เช่น portrait, anime..." class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 mb-4"/>
            <div class="flex gap-2 justify-end">
              <AdminActionButton variant="secondary" size="md" @click="tagModal.open = false">ยกเลิก</AdminActionButton>
              <AdminActionButton variant="primary" size="md" :loading="tagModal.loading" :disabled="!tagModal.name.trim()" @click="saveTag">บันทึก</AdminActionButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm Delete Dialogs -->
    <AdminConfirmDialog :open="tagDelete.open" title="ลบแฮชแท็ก" :message="`ลบแท็ก '#${tagDelete.name}' ออกจากระบบ?`" confirm-label="ลบ" :danger="true" :loading="tagDelete.loading" @confirm="confirmTagDelete" @cancel="tagDelete.open = false"/>
  </div>
</template>
