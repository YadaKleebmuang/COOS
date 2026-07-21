<script setup lang="ts">
import { ref, computed } from "vue"
import { orderService } from "~/services/order.service"
import type { Package } from "~/types/order.types"

const props = defineProps<{
  modelValue: {
    orderStyle: string
    orderColorTone: string
    orderComposition: string
    orderNote: string
    orderRequiredDate: string
    orderIsUrgent: boolean
    orderIsGalleryAllowed: boolean
  }
  images: string[]
  selectedPackage: Package | null
  pricePreview: { base: number; urgent: number; discount: number; total: number }
}>()

const emit = defineEmits<{
  (e: "update:modelValue", val: any): void
  (e: "update:images", urls: string[]): void
}>()

const form = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val)
})

const sourceImages = computed({
  get: () => props.images,
  set: (urls) => emit("update:images", urls)
})

const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const uploadingSource = ref(false)
const uploadError = ref("")

const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split("T")[0]
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    uploadFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  dragOver.value = false
  if (event.dataTransfer?.files) {
    uploadFiles(Array.from(event.dataTransfer.files))
  }
}

const uploadFiles = async (files: File[]) => {
  const validFiles = files.filter(f => f.type.startsWith("image/"))
  if (validFiles.length === 0) {
    uploadError.value = "กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น"
    return
  }

  if (sourceImages.value.length + validFiles.length > 10) {
    uploadError.value = "สามารถอัปโหลดรูปภาพได้สูงสุด 10 รูป"
    return
  }

  uploadError.value = ""
  uploadingSource.value = true
  try {
    const urls = await orderService.uploadSourceImages(validFiles)
    sourceImages.value = [...sourceImages.value, ...urls]
  } catch (err: any) {
    uploadError.value = err?.message || "ไม่สามารถอัปโหลดไฟล์บางไฟล์ได้"
  } finally {
    uploadingSource.value = false
    if (fileInput.value) {
      fileInput.value.value = ""
    }
  }
}

const removeImage = (index: number) => {
  const newImages = [...sourceImages.value]
  newImages.splice(index, 1)
  sourceImages.value = newImages
}

const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="p-6 sm:p-8">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-1">รายละเอียดงาน</h2>
      <p class="text-gray-500 text-sm">กรอกข้อมูลเพิ่มเติมเพื่อให้ Editor เข้าใจสิ่งที่ต้องการ</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- สไตล์ภาพ -->
      <div>
        <label for="order-style" class="block text-sm font-medium text-gray-700 mb-1">สไตล์ภาพ</label>
        <input
          id="order-style"
          v-model="form.orderStyle"
          type="text"
          placeholder="เช่น Minimal, Retro, Anime, Realistic"
          class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        />
      </div>

      <!-- โทนสี -->
      <div>
        <label for="order-color" class="block text-sm font-medium text-gray-700 mb-1">โทนสี</label>
        <input
          id="order-color"
          v-model="form.orderColorTone"
          type="text"
          placeholder="เช่น Warm, Cool, Pastel, Earth Tone"
          class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        />
      </div>

      <!-- องค์ประกอบฉาก -->
      <div class="md:col-span-2">
        <label for="order-composition" class="block text-sm font-medium text-gray-700 mb-1">องค์ประกอบฉาก</label>
        <textarea
          id="order-composition"
          v-model="form.orderComposition"
          rows="3"
          placeholder="อธิบายฉากหรือองค์ประกอบที่ต้องการ เช่น สวนดอกไม้ ฉากพระอาทิตย์ตก ริมทะเล"
          class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
        />
      </div>

      <!-- หมายเหตุ -->
      <div class="md:col-span-2">
        <label for="order-note" class="block text-sm font-medium text-gray-700 mb-1">หมายเหตุเพิ่มเติม</label>
        <textarea
          id="order-note"
          v-model="form.orderNote"
          rows="2"
          placeholder="ข้อมูลเพิ่มเติมที่ต้องการแจ้ง Editor"
          class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition resize-none"
        />
      </div>

      <!-- วันที่ต้องการรับงาน -->
      <div>
        <label for="order-date" class="block text-sm font-medium text-gray-700 mb-1">
          วันที่ต้องการรับงาน <span class="text-red-500">*</span>
        </label>
        <input
          id="order-date"
          v-model="form.orderRequiredDate"
          type="date"
          :min="minDate"
          class="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
        />
      </div>

      <!-- Spacer on desktop -->
      <div class="hidden md:block" />

      <!-- อัปโหลดรูปภาพต้นฉบับ -->
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          รูปภาพต้นฉบับ/รูปอ้างอิง (สูงสุด 10 รูป)
        </label>
        
        <div
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
          class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-200"
          :class="dragOver ? 'border-gray-900 bg-slate-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'"
        >
          <input
            type="file"
            ref="fileInput"
            multiple
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />
          <div class="flex flex-col items-center justify-center space-y-2">
            <p class="text-sm font-medium text-gray-700 mt-2">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
            <p class="text-xs text-gray-400">รองรับไฟล์ JPEG, PNG, WebP (สูงสุด 20MB ต่อไฟล์)</p>
          </div>
        </div>

        <!-- Upload progress / error -->
        <div v-if="uploadingSource" class="mt-3 flex items-center justify-center gap-2 text-sm text-gray-900 font-medium">
          <div class="animate-spin w-4 h-4 border-2 border-slate-200 border-t-gray-900 rounded-full"></div>
          กำลังอัปโหลดรูปภาพ...
        </div>
        <p v-if="uploadError" class="mt-2 text-xs text-red-600 font-medium">⚠️ {{ uploadError }}</p>

        <!-- Previews -->
        <div v-if="sourceImages.length > 0" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
          <div
            v-for="(url, idx) in sourceImages"
            :key="url"
            class="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-white"
          >
            <img :src="url" class="w-full h-full object-cover" />
            <button
              @click.stop="removeImage(idx)"
              class="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition opacity-90"
              title="ลบรูปภาพ"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Toggle: เร่งด่วน -->
      <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div>
          <p class="font-bold text-gray-800 text-sm">บริการเร่งด่วน</p>
          <p v-if="selectedPackage?.packageUrgentPrice" class="text-xs text-orange-600 mt-0.5">
            +฿{{ formatPrice(selectedPackage.packageUrgentPrice) }}
          </p>
          <p v-else class="text-xs text-gray-400 mt-0.5">แพ็กเกจนี้ไม่รองรับบริการเร่งด่วน</p>
        </div>
        <button
          @click="form.orderIsUrgent = !form.orderIsUrgent"
          :disabled="!selectedPackage?.packageUrgentPrice"
          class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40"
          :class="form.orderIsUrgent ? 'bg-orange-500' : 'bg-gray-200'"
        >
          <span
            class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
            :class="form.orderIsUrgent ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

      <!-- Toggle: Gallery -->
      <div class="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div>
          <p class="font-bold text-gray-800 text-sm">อนุญาตโชว์ใน Gallery</p>
          <p v-if="selectedPackage" class="text-xs text-blue-600 mt-0.5">
            ลด {{ selectedPackage.packageGalleryDiscount }}% (ประหยัด ฿{{ formatPrice(pricePreview.discount || (Number(selectedPackage.packagePrice) * Number(selectedPackage.packageGalleryDiscount)) / 100) }})
          </p>
        </div>
        <button
          @click="form.orderIsGalleryAllowed = !form.orderIsGalleryAllowed"
          class="relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none"
          :class="form.orderIsGalleryAllowed ? 'bg-blue-500' : 'bg-gray-200'"
        >
          <span
            class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
            :class="form.orderIsGalleryAllowed ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>
    </div>

    <!-- Price Preview -->
    <div v-if="selectedPackage" class="mt-6 bg-slate-50 rounded-xl p-5 border border-slate-100">
      <h3 class="font-bold text-gray-900 text-sm mb-3">สรุปราคาเบื้องต้น</h3>
      <div class="space-y-1.5 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-500">ราคาแพ็กเกจ ({{ selectedPackage.packageName }})</span>
          <span class="font-medium text-gray-900">฿{{ formatPrice(pricePreview.base) }}</span>
        </div>
        <div v-if="pricePreview.urgent > 0" class="flex justify-between text-orange-600">
          <span>ค่าเร่งด่วน</span>
          <span class="font-medium">+฿{{ formatPrice(pricePreview.urgent) }}</span>
        </div>
        <div v-if="pricePreview.discount > 0" class="flex justify-between text-green-600">
          <span>ส่วนลด Gallery</span>
          <span class="font-medium">-฿{{ formatPrice(pricePreview.discount) }}</span>
        </div>
        <hr class="border-gray-200 my-2" />
        <div class="flex justify-between text-base font-bold text-gray-900">
          <span>รวมโดยประมาณ</span>
          <span>฿{{ formatPrice(pricePreview.total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
