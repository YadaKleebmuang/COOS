<script setup lang="ts">
import { ref, reactive, watch, onBeforeUnmount } from "vue"
import { orderService } from "~/services/order.service"
import type { OrderImage } from "~/types/order.types"
import { useProtectedAsset } from "~/composables/useProtectedAsset"
import { useAlert } from "~/composables/useAlert"

const props = defineProps<{
  orderId: number
  img: OrderImage | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: "close"): void
  (e: "refresh", payload?: { orderImageId: number; imageChanged: boolean }): void
}>()

const { protectedAssetUrl, loadProtectedAsset } = useProtectedAsset()
const { toast } = useAlert()
const orderImageEndpoint = (imageId: number) => `/media/order-images/${imageId}`

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const submitting = ref(false)
const uploadError = ref("")

// local Preview if user selects a NEW image
const previewUrl = ref("")
const uploadedFileUrl = ref("")

const paramsForm = reactive({
  aiEngine: "",
  positivePrompt: "",
  negativePrompt: "",
  cfgScale: 7.5,
  steps: 30,
  seed: -1
})

// Initialize form when modal opens or image changes
watch(
  () => props.isOpen,
  (open) => {
    if (open && props.img) {
      paramsForm.aiEngine = props.img.aiEngine || ""
      paramsForm.positivePrompt = props.img.positivePrompt || ""
      paramsForm.negativePrompt = props.img.negativePrompt || ""
      paramsForm.cfgScale = props.img.cfgScale || 7.5
      paramsForm.steps = props.img.steps || 30
      paramsForm.seed = props.img.seed ? Number(props.img.seed) : -1

      loadProtectedAsset(orderImageEndpoint(props.img.orderImageId))
      handleCancelNewImage()
    }
  }
)

const handleCancelNewImage = () => {
  if (previewUrl.value && !previewUrl.value.startsWith('blob:')) {
    // Only revoke if it was a data URL or blob
  }
  previewUrl.value = ""
  uploadedFileUrl.value = ""
  uploadError.value = ""
  if (fileInput.value) fileInput.value.value = ""
}

const handleClose = () => {
  if (submitting.value || uploading.value) return
  handleCancelNewImage()
  emit("close")
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadImage(target.files[0])
  }
}

const uploadImage = async (file: File) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    uploadError.value = 'รองรับไฟล์ JPG, PNG และ WebP เท่านั้น'
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    previewUrl.value = typeof reader.result === 'string' ? reader.result : ''
  }
  reader.onerror = () => {
    previewUrl.value = ''
  }
  reader.readAsDataURL(file)

  uploadError.value = ""
  uploadedFileUrl.value = ""
  uploading.value = true

  try {
    const url = await orderService.uploadGeneratedImageFile(file)
    uploadedFileUrl.value = url
  } catch (err: any) {
    uploadError.value = err?.message || "อัปโหลดภาพไม่สำเร็จ"
    previewUrl.value = ""
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ""
  }
}

const handleSave = async () => {
  if (!props.img) return
  if (submitting.value || uploading.value) return

  submitting.value = true
  uploadError.value = ""
  try {
    const updatePayload: any = {
      aiEngine: paramsForm.aiEngine,
      positivePrompt: paramsForm.positivePrompt,
      negativePrompt: paramsForm.negativePrompt,
      cfgScale: Number(paramsForm.cfgScale),
      steps: Number(paramsForm.steps),
      seed: Number(paramsForm.seed)
    }

    if (uploadedFileUrl.value) {
      updatePayload.imageUrl = uploadedFileUrl.value
      updatePayload.imageThumbnailUrl = uploadedFileUrl.value
    }

    await orderService.updateOrderImage(props.orderId, props.img.orderImageId, updatePayload)

    emit("refresh", {
      orderImageId: props.img.orderImageId,
      imageChanged: Boolean(uploadedFileUrl.value)
    })

    handleClose()
    toast("แก้ไขผลงานดราฟต์เรียบร้อยแล้ว", "success")
  } catch (err: any) {
    uploadError.value = "ไม่สามารถแก้ไขผลงานได้ กรุณาลองใหม่อีกครั้ง"
  } finally {
    submitting.value = false
  }
}

onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && img"
      class="editor-theme editor-overlay fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6"
    >
      <button
        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label="ปิดหน้าต่าง"
        @click="handleClose"
      ></button>

      <div class="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[14px] border border-[#172c3b]/10 bg-[#fcf9f3] shadow-2xl">

        <!-- Header -->
        <header class="flex items-start justify-between gap-4 border-b border-[#172c3b]/10 p-6 pb-4">
          <div>
            <h2 class="text-lg font-semibold text-[#172c3b]">
              แก้ไขผลงานดราฟต์
            </h2><p class="mt-1 text-[13px] text-[#52616a]">
              แก้ไขรูปภาพและข้อมูลที่ใช้ในการสร้างผลงาน
            </p>
          </div>
          <button
            @click="handleClose"
            :disabled="submitting || uploading"
            class="rounded-lg p-2 text-[#52616a] hover:bg-[#eee7db]"
            aria-label="ปิด"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-width="1.8" d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </header>

        <!-- Body -->
        <div class="p-6 overflow-y-auto bg-[#e5e9e1]">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- Image Area -->
            <div class="space-y-4">
              <div class="aspect-[4/3] bg-[#eee7db] rounded-xl overflow-hidden relative border border-[#172c3b]/10 flex items-center justify-center">
                <template v-if="previewUrl">
                  <img :src="previewUrl" class="w-full h-full object-contain" />
                  <span class="absolute top-3 left-3 bg-[#172c3b] text-white text-[11px] font-semibold px-2 py-1 rounded-lg shadow-sm border border-[#172c3b]">
                    รูปภาพใหม่ที่เลือก
                  </span>
                </template>
                <template v-else>
                  <img :src="protectedAssetUrl(orderImageEndpoint(img.orderImageId))" class="w-full h-full object-contain" />
                  <span class="absolute top-3 left-3 bg-[#fcf9f3] text-[#172c3b] text-[11px] font-semibold px-2 py-1 rounded-lg shadow-sm border border-[#172c3b]/10">
                    รูปภาพปัจจุบัน
                  </span>
                </template>
              </div>

              <div class="flex flex-col items-center">
                <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileSelect" />

                <template v-if="!previewUrl">
                  <button
                    @click="triggerFileInput"
                    class="text-[13px] font-semibold text-[#172c3b] hover:bg-[#eee7db] border border-[#172c3b]/10 rounded-xl px-4 py-2 w-full transition-colors bg-[#fcf9f3] shadow-sm"
                  >
                    เลือกรูปภาพใหม่
                  </button>
                </template>
                <template v-else>
                  <button
                    @click="handleCancelNewImage"
                    class="text-[13px] font-semibold text-red-600 hover:bg-red-50 border border-red-100 rounded-xl px-4 py-2 w-full transition-colors bg-[#fcf9f3] shadow-sm"
                  >
                    ยกเลิกรูปภาพใหม่ (ใช้รูปเดิม)
                  </button>
                </template>
              </div>

              <div v-if="uploading" class="text-center text-xs font-medium text-[#52616a]">
                กำลังประมวลผลไฟล์รูปภาพ...
              </div>
              <p v-if="uploadError" class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
                {{ uploadError }}
              </p>
            </div>

            <!-- Metadata Form -->
            <div class="space-y-4 text-xs">
              <div class="grid grid-cols-2 gap-3">
                <label class="block">
                  <span class="mb-1 block font-semibold text-[#52616a]">AI Engine</span>
                  <input v-model="paramsForm.aiEngine" type="text" class="w-full rounded-xl border border-[#172c3b]/10 bg-[#eee7db] px-3 py-2.5 text-[#172c3b] outline-none transition-all focus:border-[#172c3b]/20 focus:bg-[#fcf9f3]" />
                </label>
                <label class="block">
                  <span class="mb-1 block font-semibold text-[#52616a]">Seed</span>
                  <input v-model="paramsForm.seed" type="number" class="w-full rounded-xl border border-[#172c3b]/10 bg-[#eee7db] px-3 py-2.5 text-[#172c3b] outline-none transition-all focus:border-[#172c3b]/20 focus:bg-[#fcf9f3]" />
                </label>
              </div>

              <label class="block">
                <span class="mb-1 block font-semibold text-[#52616a]">Positive Prompt</span>
                <textarea v-model="paramsForm.positivePrompt" rows="3" class="w-full resize-none rounded-xl border border-[#172c3b]/10 bg-[#eee7db] px-3 py-2.5 text-[#172c3b] outline-none transition-all focus:border-[#172c3b]/20 focus:bg-[#fcf9f3]" />
              </label>

              <label class="block">
                <span class="mb-1 block font-semibold text-[#52616a]">Negative Prompt</span>
                <textarea v-model="paramsForm.negativePrompt" rows="3" class="w-full resize-none rounded-xl border border-[#172c3b]/10 bg-[#eee7db] px-3 py-2.5 text-[#172c3b] outline-none transition-all focus:border-[#172c3b]/20 focus:bg-[#fcf9f3]" />
              </label>

              <div class="grid grid-cols-2 gap-3">
                <label class="block">
                  <span class="mb-1 block font-semibold text-[#52616a]">CFG Scale</span>
                  <input v-model="paramsForm.cfgScale" type="number" step="0.1" class="w-full rounded-xl border border-[#172c3b]/10 bg-[#eee7db] px-3 py-2.5 text-[#172c3b] outline-none transition-all focus:border-[#172c3b]/20 focus:bg-[#fcf9f3]" />
                </label>
                <label class="block">
                  <span class="mb-1 block font-semibold text-[#52616a]">Inference Steps</span>
                  <input v-model="paramsForm.steps" type="number" class="w-full rounded-xl border border-[#172c3b]/10 bg-[#eee7db] px-3 py-2.5 text-[#172c3b] outline-none transition-all focus:border-[#172c3b]/20 focus:bg-[#fcf9f3]" />
                </label>
              </div>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <footer class="flex items-center justify-end gap-3 border-t border-[#172c3b]/10 bg-[#fcf9f3] p-6 pt-4">
          <button
            @click="handleClose"
            :disabled="submitting || uploading"
            class="px-4 py-2 text-sm font-medium text-[#52616a]"
          >
            ยกเลิก
          </button>
          <button
            @click="handleSave"
            :disabled="submitting || uploading"
            class="editor-primary rounded-xl border border-transparent bg-[#172c3b] px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-[#294655] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {{ submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข' }}
          </button>
        </footer>

      </div>
    </div>
  </Teleport>
</template>
