<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useApi } from '~/composables/useApi'
import { useAlert } from '~/composables/useAlert'
import type { OrderImage, OrderDetail } from '~/types/order.types'

const props = defineProps<{
  image: OrderImage | null
  order: OrderDetail | null
  resolvedImageUrl: string
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { apiFetch } = useApi()
const alert = useAlert()

const loading = ref(true)
const saving = ref(false)

const tags = ref<any[]>([])
const selectedTagIds = ref<number[]>([])
const searchQuery = ref('')

const orderIsGalleryAllowed = computed(() => props.order?.orderIsGalleryAllowed === 1)

// Filter tags based on search query
const filteredTags = computed(() => {
  if (!searchQuery.value) return tags.value
  const q = searchQuery.value.toLowerCase()
  return tags.value.filter(t => t.tagName.toLowerCase().includes(q))
})

const selectedTags = computed(() => {
  return selectedTagIds.value
    .map(id => tags.value.find(t => t.tagId === id))
    .filter(Boolean)
})

onMounted(async () => {
  if (!props.image || !props.order) return
  
  try {
    // 1. Fetch master tags
    const tagsData = await apiFetch<any[]>('/tags')
    tags.value = tagsData || []
    
    // 2. Fetch current metadata
    const meta = await apiFetch<any>(`/orders/${props.order.orderId}/images/${props.image.orderImageId}/gallery-metadata`)
    
    selectedTagIds.value = meta.tags.map((t: any) => t.tagId)
  } catch (e) {
    alert.toast('ไม่สามารถดึงข้อมูล Gallery ได้', 'error')
  } finally {
    loading.value = false
  }
})

const toggleTag = (tagId: number) => {
  const index = selectedTagIds.value.indexOf(tagId)
  if (index === -1) {
    selectedTagIds.value.push(tagId)
  } else {
    selectedTagIds.value.splice(index, 1)
  }
}

const saveMetadata = async () => {
  if (!props.image || !props.order) return
  saving.value = true
  try {
    await apiFetch(`/orders/${props.order.orderId}/images/${props.image.orderImageId}/gallery-metadata`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tagIds: selectedTagIds.value
      })
    })
    alert.toast('บันทึกข้อมูล Gallery เรียบร้อยแล้ว', 'success')
    emit('saved')
    emit('close')
  } catch (e) {
    alert.toast('ไม่สามารถบันทึกข้อมูล Gallery ได้ กรุณาลองใหม่อีกครั้ง', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <button class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')" />
    
    <section class="relative flex max-h-[90vh] w-full max-w-[500px] flex-col overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-2xl">
      <header class="flex items-center justify-between border-b border-black/[0.06] px-6 py-5">
        <h2 class="text-lg font-semibold text-[#171717]">ข้อมูล Gallery</h2>
        <button class="rounded-lg p-2 text-[#666666] hover:bg-[#F7F7F5] transition-colors" @click="emit('close')">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div class="overflow-y-auto p-6 space-y-6">
        <div v-if="loading" class="text-center py-8 text-sm text-[#666666]">กำลังโหลดข้อมูล...</div>
        
        <template v-else>
          <!-- Preview -->
          <div>
            <h3 class="text-[13px] font-semibold text-[#666666] mb-2">รูปภาพ</h3>
            <div class="bg-[#F7F7F5] rounded-xl overflow-hidden aspect-[4/3]">
              <img v-if="props.resolvedImageUrl" :src="props.resolvedImageUrl" class="w-full h-full object-contain" />
            </div>
          </div>

          <!-- Hashtags -->
          <div>
            <h3 class="text-[13px] font-semibold text-[#666666] mb-2">แฮชแท็ก</h3>
            
            <!-- Selected Tags -->
            <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-2 mb-4">
              <span v-for="tag in selectedTags" :key="tag.tagId" class="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                {{ tag.tagName }}
                <button @click="toggleTag(tag.tagId)" class="text-indigo-400 hover:text-indigo-700">×</button>
              </span>
            </div>

            <!-- Search -->
            <div class="relative mb-3">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="ค้นหาแฮชแท็ก..." 
                class="w-full rounded-xl border border-black/[0.06] bg-[#F7F7F5] px-4 py-2.5 text-sm outline-none focus:border-black/[0.12] focus:bg-white transition-colors"
              />
            </div>

            <!-- Available Tags -->
            <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
              <button 
                v-for="tag in filteredTags" 
                :key="tag.tagId"
                @click="toggleTag(tag.tagId)"
                class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
                :class="selectedTagIds.includes(tag.tagId) ? 'border-indigo-200 bg-indigo-50 text-indigo-700 opacity-50 cursor-default' : 'border-black/[0.06] bg-white text-[#666666] hover:border-black/[0.12] hover:text-[#171717]'"
                :disabled="selectedTagIds.includes(tag.tagId)"
              >
                {{ tag.tagName }}
              </button>
              <div v-if="filteredTags.length === 0" class="text-xs text-[#929292] w-full text-center py-2">
                ไม่พบแฮชแท็กที่ค้นหา
              </div>
            </div>
          </div>

          <!-- Consent -->
          <div class="pt-2">
            <h3 class="text-[13px] font-semibold text-[#666666] mb-2">สิทธิ์การเผยแพร่</h3>
            <div class="rounded-xl border border-black/[0.06] bg-[#F7F7F5]/50 p-3 text-sm">
              <div v-if="orderIsGalleryAllowed" class="flex items-center gap-2 text-[#171717] font-medium">
                <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                ลูกค้าอนุญาตให้นำผลงานไปใช้ใน Gallery
              </div>
              <div v-else class="flex items-center gap-2 text-[#929292]">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                ลูกค้าไม่อนุญาตให้นำผลงานไปใช้ใน Gallery
              </div>
            </div>
          </div>
        </template>
      </div>

      <footer class="flex justify-end gap-3 border-t border-black/[0.06] bg-white p-6 pt-4">
        <button class="px-4 py-2 text-sm font-medium text-[#666666] hover:text-[#171717]" @click="emit('close')" :disabled="saving">
          ยกเลิก
        </button>
        <button class="rounded-xl bg-[#171717] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#333333] disabled:opacity-50" @click="saveMetadata" :disabled="loading || saving">
          {{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
        </button>
      </footer>
    </section>
  </div>
</template>
