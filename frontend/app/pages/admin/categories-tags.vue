<script setup lang="ts">
import { ref, computed, onMounted } from "vue"

definePageMeta({
  layout: "admin",
  middleware: ["auth", "admin"]
})

const { apiFetch } = useApi()

// ── Types ──────────────────────────────────────────────────────
interface Category { categoryId: number; categoryName: string; imageCount: number; createdAt: string }
interface Hashtag { tagId: number; tagName: string; imageCount: number; createdAt: string }


// ── State ──────────────────────────────────────────────────────
const categories = ref<Category[]>([])
const hashtags = ref<Hashtag[]>([])
const loading = ref(true)

// Category modal
const catModal = ref({ open: false, mode: "add" as "add" | "edit", loading: false, id: 0, name: "" })
const catDelete = ref({ open: false, loading: false, id: 0, name: "" })

// Hashtag modal
const tagModal = ref({ open: false, mode: "add" as "add" | "edit", loading: false, id: 0, name: "" })
const tagDelete = ref({ open: false, loading: false, id: 0, name: "" })

// ── Fetch ──────────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  try {
    const [cats, tgs] = await Promise.all([
      apiFetch<any[]>("/work-types").catch(() => []),
      apiFetch<string[]>("/gallery-images/tags").catch(() => [])
    ])
    
    categories.value = cats.map(c => ({
      categoryId: c.typeId,
      categoryName: c.typeName,
      imageCount: 0,
      createdAt: c.createdAt || new Date().toISOString()
    }))

    hashtags.value = tgs.map((t, idx) => ({
      tagId: idx + 1,
      tagName: t,
      imageCount: 0,
      createdAt: new Date().toISOString()
    }))
  } catch (error: any) {
    alert("เกิดข้อผิดพลาดในการโหลดข้อมูล: " + error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())

// ── Category CRUD ──────────────────────────────────────────────
const saveCat = async () => {
  catModal.value.loading = true
  try {
    if (catModal.value.mode === "edit") {
      await apiFetch(`/work-types/${catModal.value.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typeName: catModal.value.name, typeDescription: "" })
      })
      const idx = categories.value.findIndex(c => c.categoryId === catModal.value.id)
      if (idx !== -1) categories.value[idx].categoryName = catModal.value.name
    } else {
      await apiFetch("/work-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typeName: catModal.value.name, typeDescription: "" })
      })
      await fetchData()
    }
    catModal.value.open = false
  } catch (error: any) {
    alert("เกิดข้อผิดพลาด: " + error.message)
  } finally {
    catModal.value.loading = false
  }
}

const confirmCatDelete = async () => {
  catDelete.value.loading = true
  try {
    await apiFetch(`/work-types/${catDelete.value.id}`, { method: "DELETE" })
    categories.value = categories.value.filter(c => c.categoryId !== catDelete.value.id)
    catDelete.value.open = false
  } catch (error: any) {
    alert("เกิดข้อผิดพลาดในการลบ: " + error.message)
  } finally {
    catDelete.value.loading = false
  }
}

// ── Tag CRUD ───────────────────────────────────────────────────
const saveTag = async () => {
  alert("ไม่สามารถเพิ่มหรือแก้ไขแฮชแท็กได้โดยตรง แฮชแท็กจะถูกสร้างอัตโนมัติเมื่อมีการเพิ่มแฮชแท็กใหม่ในรูปภาพ")
  tagModal.value.open = false
}

const confirmTagDelete = async () => {
  alert("ไม่สามารถลบแฮชแท็กได้โดยตรง แฮชแท็กจะหายไปเองเมื่อไม่มีรูปภาพใดใช้แฮชแท็กนี้")
  tagDelete.value.open = false
}

const catColumns = [
  { key: "categoryName", label: "ชื่อหมวดหมู่" },
  { key: "imageCount", label: "จำนวนภาพ", align: "center" as const },
  { key: "action", label: "การจัดการ", align: "center" as const }
]

const tagColumns = [
  { key: "tagName", label: "แฮชแท็ก" },
  { key: "imageCount", label: "จำนวนภาพ", align: "center" as const },
  { key: "action", label: "การจัดการ", align: "center" as const }
]

const breadcrumb = [{ label: "หน้าแรก", to: "/admin/dashboard" }, { label: "หมวดหมู่และแฮชแท็ก" }]
</script>

<template>
  <div class="space-y-5 max-w-7xl mx-auto">
    <!-- Header -->
    <div>
      <AdminBreadcrumb :items="breadcrumb" />
      <h1 class="mt-2 text-xl font-bold text-gray-900">จัดการหมวดหมู่และแฮชแท็ก</h1>
      <p class="mt-0.5 text-sm text-gray-500">หมวดหมู่และแท็กสำหรับแสดงรูปภาพใน Gallery</p>
    </div>

    <!-- Two-column layout -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">

      <!-- ── Categories ── -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-gray-900">หมวดหมู่</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ categories.length }} หมวดหมู่</p>
          </div>
          <AdminActionButton variant="primary" size="sm" icon="M12 4v16m8-8H4" @click="catModal = { open: true, mode: 'add', loading: false, id: 0, name: '' }">เพิ่มหมวดหมู่</AdminActionButton>
        </div>
        <AdminDataTable :columns="catColumns" :rows="categories" :loading="loading" row-key="categoryId">
          <template #cell-categoryName="{ value }">
            <span class="text-sm font-medium text-gray-900">{{ value }}</span>
          </template>
          <template #cell-imageCount="{ value }">
            <span class="text-sm font-number text-gray-700">{{ value }}</span>
          </template>
          <template #cell-action="{ row }">
            <div class="flex items-center justify-center gap-1.5">
              <AdminActionButton variant="secondary" size="sm" @click="catModal = { open: true, mode: 'edit', loading: false, id: row.categoryId, name: row.categoryName }">แก้ไข</AdminActionButton>
              <AdminActionButton variant="danger" size="sm" @click="catDelete = { open: true, loading: false, id: row.categoryId, name: row.categoryName }">ลบ</AdminActionButton>
            </div>
          </template>
        </AdminDataTable>
        <AdminEmptyState v-if="!loading && categories.length === 0" title="ยังไม่มีหมวดหมู่" description="กดเพิ่มหมวดหมู่เพื่อเริ่มต้น" icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
      </div>

      <!-- ── Hashtags ── -->
      <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <p class="text-sm font-bold text-gray-900">แฮชแท็ก</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ hashtags.length }} แท็ก</p>
          </div>
          <AdminActionButton variant="primary" size="sm" icon="M12 4v16m8-8H4" @click="tagModal = { open: true, mode: 'add', loading: false, id: 0, name: '' }">เพิ่มแท็ก</AdminActionButton>
        </div>
        <AdminDataTable :columns="tagColumns" :rows="hashtags" :loading="loading" row-key="tagId">
          <template #cell-tagName="{ value }">
            <span class="text-sm font-medium text-gray-900">#{{ value }}</span>
          </template>
          <template #cell-imageCount="{ value }">
            <span class="text-sm font-number text-gray-700">{{ value }}</span>
          </template>
          <template #cell-action="{ row }">
            <div class="flex items-center justify-center gap-1.5">
              <AdminActionButton variant="secondary" size="sm" @click="saveTag">แก้ไข</AdminActionButton>
              <AdminActionButton variant="danger" size="sm" @click="confirmTagDelete">ลบ</AdminActionButton>
            </div>
          </template>
        </AdminDataTable>
        <AdminEmptyState v-if="!loading && hashtags.length === 0" title="ยังไม่มีแฮชแท็ก" description="กดเพิ่มแท็กเพื่อเริ่มต้น" icon="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
      </div>
    </div>

    <!-- Category Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="catModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="catModal.open = false"/>
          <div class="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-sm p-6">
            <h3 class="text-sm font-bold text-gray-900 mb-4">{{ catModal.mode === "edit" ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่" }}</h3>
            <label class="block text-xs font-medium text-gray-500 mb-1">ชื่อหมวดหมู่</label>
            <input v-model="catModal.name" type="text" placeholder="เช่น Realistic, Anime..." class="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 mb-4"/>
            <div class="flex gap-2 justify-end">
              <AdminActionButton variant="secondary" size="md" @click="catModal.open = false">ยกเลิก</AdminActionButton>
              <AdminActionButton variant="primary" size="md" :loading="catModal.loading" :disabled="!catModal.name.trim()" @click="saveCat">บันทึก</AdminActionButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
    <AdminConfirmDialog :open="catDelete.open" title="ลบหมวดหมู่" :message="`ลบ '${catDelete.name}' ออกจากระบบ?`" confirm-label="ลบ" :danger="true" :loading="catDelete.loading" @confirm="confirmCatDelete" @cancel="catDelete.open = false"/>
    <AdminConfirmDialog :open="tagDelete.open" title="ลบแฮชแท็ก" :message="`ลบแท็ก '#${tagDelete.name}' ออกจากระบบ?`" confirm-label="ลบ" :danger="true" :loading="tagDelete.loading" @confirm="confirmTagDelete" @cancel="tagDelete.open = false"/>
  </div>
</template>
