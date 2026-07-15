<script setup lang="ts">
import { ref, computed, reactive } from "vue"
import { orderService } from "~/services/order.service"
import type { OrderDetail } from "~/types/order.types"

const props = defineProps<{
  order: OrderDetail
}>()

const emit = defineEmits(["refresh"])

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const submitting = ref(false)
const dragOver = ref(false)
const uploadError = ref("")
const previewUrl = ref("")
const uploadedFileUrl = ref("")

const paramsForm = reactive({
  aiEngine: "Stable Diffusion XL",
  positivePrompt: "",
  negativePrompt: "nsfw, low quality, bad anatomy, blurry",
  cfgScale: 7.5,
  steps: 30,
  seed: -1
})

const generatedImages = computed(() => {
  if (!props.order.images) return []
  return props.order.images.filter(img => img.imageType === "ai_generated")
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadImage(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  dragOver.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    uploadImage(event.dataTransfer.files[0])
  }
}

const uploadImage = async (file: File) => {
  if (!file.type.startsWith("image/")) {
    uploadError.value = "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น"
    return
  }
  
  uploadError.value = ""
  uploadedFileUrl.value = ""
  uploading.value = true
  
  try {
    const url = await orderService.uploadGeneratedImageFile(file)
    uploadedFileUrl.value = url
    previewUrl.value = url
  } catch (err: any) {
    uploadError.value = err?.message || "อัปโหลดภาพไม่สำเร็จ"
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ""
  }
}

const handleCancelUpload = () => {
  uploadedFileUrl.value = ""
  previewUrl.value = ""
  uploadError.value = ""
}

const handleSubmitImage = async () => {
  if (!uploadedFileUrl.value || submitting.value) return
  
  submitting.value = true
  try {
    await orderService.addOrderImage(props.order.orderId, {
      imageType: "ai_generated",
      imageUrl: uploadedFileUrl.value,
      imageThumbnailUrl: uploadedFileUrl.value,
      aiEngine: paramsForm.aiEngine,
      positivePrompt: paramsForm.positivePrompt,
      negativePrompt: paramsForm.negativePrompt,
      cfgScale: Number(paramsForm.cfgScale),
      steps: Number(paramsForm.steps),
      seed: Number(paramsForm.seed)
    })
    
    // Clear and refresh
    handleCancelUpload()
    emit("refresh")
  } catch (err: any) {
    uploadError.value = err?.message || "บันทึกข้อมูลรูปภาพไม่สำเร็จ"
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="border-b border-gray-50 pb-2.5">
      <h3 class="text-base font-bold text-gray-800">🤖 รูปภาพที่สังเคราะห์ด้วยปัญญาประดิษฐ์ (AI Generated Layouts)</h3>
      <p class="text-xs text-gray-400 mt-0.5">ส่วนสำหรับอัปโหลดภาพดราฟต์ที่สังเคราะห์จากระบบหรือประมวลผลขึ้นมา เพื่อส่งให้ลูกค้าคัดเลือก</p>
    </div>

    <!-- Upload Panel Form -->
    <div class="bg-gray-50 rounded-xl border border-gray-100 p-5 sm:p-6 space-y-6">
      <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest">📤 อัปโหลดผลงานดราฟต์ใหม่</h4>
      
      <!-- Drag & Drop Zone -->
      <div
        v-if="!uploadedFileUrl"
        @dragover.prevent="dragOver = true"
        @dragleave.prevent="dragOver = false"
        @drop.prevent="handleDrop"
        @click="triggerFileInput"
        class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition bg-white"
        :class="dragOver ? 'border-indigo-500 bg-gray-100/20' : 'border-gray-200 hover:border-indigo-400'"
      >
        <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileSelect" />
        <div class="flex flex-col items-center justify-center space-y-2 text-xs">
          <div class="text-3xl text-indigo-500">🌌</div>
          <p class="font-bold text-gray-700">ลากไฟล์ผลงานมาวางที่นี่ หรือคลิกเพื่ออัปโหลด</p>
          <p class="text-gray-400">รองรับไฟล์รูปภาพความละเอียดสูง (สูงสุด 10MB)</p>
        </div>
      </div>

      <!-- Preview image & input metadata form if uploaded -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-gray-100 p-5 rounded-xl">
        <!-- Thumbnail preview -->
        <div class="flex flex-col items-center justify-center gap-3">
          <img :src="previewUrl" class="max-h-48 rounded-lg shadow-sm border object-contain bg-gray-50" />
          <button @click="handleCancelUpload" class="text-xs font-bold text-red-600 hover:underline">
            ❌ ยกเลิกรูปภาพนี้
          </button>
        </div>
        
        <!-- Metadata Form -->
        <div class="md:col-span-2 space-y-4 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-400 uppercase mb-1">AI Engine</label>
              <input v-model="paramsForm.aiEngine" type="text" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700" />
            </div>
            <div>
              <label class="block font-bold text-gray-400 uppercase mb-1">Seed Parameter</label>
              <input v-model="paramsForm.seed" type="number" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700" />
            </div>
          </div>
          
          <div>
            <label class="block font-bold text-gray-400 uppercase mb-1">Positive Prompt</label>
            <textarea v-model="paramsForm.positivePrompt" rows="2" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 resize-none" placeholder="เช่น masterpiece, highly detailed, photorealistic, cinematic lighting" />
          </div>

          <div>
            <label class="block font-bold text-gray-400 uppercase mb-1">Negative Prompt</label>
            <textarea v-model="paramsForm.negativePrompt" rows="2" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 resize-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-gray-400 uppercase mb-1">CFG Scale</label>
              <input v-model="paramsForm.cfgScale" type="number" step="0.1" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700" />
            </div>
            <div>
              <label class="block font-bold text-gray-400 uppercase mb-1">Inference Steps</label>
              <input v-model="paramsForm.steps" type="number" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700" />
            </div>
          </div>

          <div class="flex justify-end pt-2 border-t border-gray-50">
            <button
              @click="handleSubmitImage"
              :disabled="submitting"
              class="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white font-bold px-4 py-2 rounded-lg transition"
            >
              {{ submitting ? "กำลังแนบรูปภาพ..." : "✅ บันทึกรูปภาพเข้าออเดอร์" }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="uploading" class="text-center text-xs text-gray-900 font-bold">
        ⏳ กำลังประมวลผลไฟล์รูปภาพ...
      </div>
      <p v-if="uploadError" class="text-xs text-red-600 font-bold text-center">⚠️ {{ uploadError }}</p>
    </div>

    <!-- Generated Images Gallery -->
    <div class="space-y-4">
      <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest">🖼️ คลังรูปภาพที่แนบไปแล้ว ({{ generatedImages.length }} รูป)</h4>
      
      <div v-if="generatedImages.length === 0" class="text-center py-8 text-gray-400 text-xs">
        ยังไม่มีการแนบรูปภาพที่สังเคราะห์จากระบบ AI ในตอนนี้
      </div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div v-for="img in generatedImages" :key="img.orderImageId" class="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm flex flex-col group">
          <div class="aspect-[4/3] bg-gray-100 overflow-hidden relative">
            <img :src="img.imageUrl" class="w-full h-full object-cover" />
            <span class="absolute top-2 left-2 bg-gray-900 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">
              AI GENERATED DRAFT
            </span>
          </div>
          <div class="p-4 flex-1 text-xs space-y-2 bg-gray-50/20">
            <div v-if="img.aiEngine" class="flex justify-between">
              <span class="text-gray-400 font-bold">Engine:</span>
              <span class="text-gray-700 font-semibold">{{ img.aiEngine }}</span>
            </div>
            <div v-if="img.positivePrompt">
              <span class="text-gray-400 font-bold">Positive Prompt:</span>
              <p class="text-gray-600 bg-white p-2 rounded border mt-0.5 line-clamp-3 font-mono leading-relaxed select-all">{{ img.positivePrompt }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


