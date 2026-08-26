<script setup lang="ts">
import { ref, computed } from 'vue'
import { orderService } from '~/services/order.service'
import type { Package } from '~/types/order.types'

interface OrderDetailsForm {
  orderStyle: string
  orderColorTone: string
  orderComposition: string
  orderNote: string
  orderRequiredDate: string
  orderIsUrgent: boolean
  orderIsGalleryAllowed: boolean
}

const props = defineProps<{
  modelValue: OrderDetailsForm
  images: string[]
  selectedPackage: Package | null
  pricePreview: { base: number, urgent: number, discount: number, total: number }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: OrderDetailsForm): void
  (e: 'update:images', urls: string[]): void
}>()

const form = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})

const sourceImages = computed({
  get: () => props.images,
  set: urls => emit('update:images', urls)
})

const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const uploadingSource = ref(false)
const uploadError = ref('')

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback

const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
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
  const validFiles = files.filter(f => f.type.startsWith('image/'))
  if (validFiles.length === 0) {
    uploadError.value = 'กรุณาเลือกไฟล์ที่เป็นรูปภาพเท่านั้น'
    return
  }

  if (sourceImages.value.length + validFiles.length > 10) {
    uploadError.value = 'สามารถอัปโหลดรูปภาพได้สูงสุด 10 รูป'
    return
  }

  uploadError.value = ''
  uploadingSource.value = true
  try {
    const urls = await orderService.uploadSourceImages(validFiles)
    sourceImages.value = [...sourceImages.value, ...urls]
  } catch (err: unknown) {
    uploadError.value = getErrorMessage(err, 'ไม่สามารถอัปโหลดไฟล์บางไฟล์ได้')
  } finally {
    uploadingSource.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const removeImage = (index: number) => {
  const newImages = [...sourceImages.value]
  newImages.splice(index, 1)
  sourceImages.value = newImages
}

const formatPrice = (n: number) =>
  Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="p-6 sm:p-8">
    <div class="mb-6">
      <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
        รายละเอียดงาน
      </h2>
      <p class="mt-1 text-sm leading-[1.6] text-[#666666]">
        กรอกข้อมูลเพิ่มเติมเพื่อให้ Editor เข้าใจสิ่งที่ต้องการ
      </p>
    </div>

    <div class="space-y-6">
      <section class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <h3 class="text-base font-semibold leading-[1.45] text-[#171717]">
          รายละเอียดภาพ
        </h3>
        <div class="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              for="order-style"
              class="mb-2 block text-sm font-semibold text-[#171717]"
            >สไตล์ภาพ</label>
            <input
              id="order-style"
              v-model="form.orderStyle"
              type="text"
              placeholder="เช่น Minimal, Retro, Anime, Realistic"
              class="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.12] focus:border-[#756CE8] focus:ring-2 focus:ring-[#756CE8]/20"
            >
          </div>

          <div>
            <label
              for="order-color"
              class="mb-2 block text-sm font-semibold text-[#171717]"
            >โทนสี</label>
            <input
              id="order-color"
              v-model="form.orderColorTone"
              type="text"
              placeholder="เช่น Warm, Cool, Pastel, Earth Tone"
              class="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.12] focus:border-[#756CE8] focus:ring-2 focus:ring-[#756CE8]/20"
            >
          </div>

          <div class="md:col-span-2">
            <label
              for="order-composition"
              class="mb-2 block text-sm font-semibold text-[#171717]"
            >องค์ประกอบฉาก</label>
            <textarea
              id="order-composition"
              v-model="form.orderComposition"
              rows="3"
              placeholder="อธิบายฉากหรือองค์ประกอบที่ต้องการ เช่น สวนดอกไม้ ฉากพระอาทิตย์ตก ริมทะเล"
              class="w-full resize-none rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm leading-[1.6] text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.12] focus:border-[#756CE8] focus:ring-2 focus:ring-[#756CE8]/20"
            />
          </div>
        </div>
      </section>

      <section class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <h3 class="text-base font-semibold leading-[1.45] text-[#171717]">
          ข้อมูลเพิ่มเติม
        </h3>
        <div class="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div class="md:col-span-2">
            <label
              for="order-note"
              class="mb-2 block text-sm font-semibold text-[#171717]"
            >หมายเหตุเพิ่มเติม</label>
            <textarea
              id="order-note"
              v-model="form.orderNote"
              rows="3"
              placeholder="ข้อมูลเพิ่มเติมที่ต้องการแจ้ง Editor"
              class="w-full resize-none rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm leading-[1.6] text-[#171717] outline-none transition placeholder:text-[#929292] hover:border-black/[0.12] focus:border-[#756CE8] focus:ring-2 focus:ring-[#756CE8]/20"
            />
          </div>

          <div>
            <label
              for="order-date"
              class="mb-2 block text-sm font-semibold text-[#171717]"
            >
              วันที่ต้องการรับงาน <span class="text-[#B93B3B]">*</span>
            </label>
            <input
              id="order-date"
              v-model="form.orderRequiredDate"
              type="date"
              :min="minDate"
              required
              class="h-12 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-[#171717] outline-none transition hover:border-black/[0.12] focus:border-[#756CE8] focus:ring-2 focus:ring-[#756CE8]/20"
            >
            <p class="mt-2 text-xs leading-[1.5] text-[#666666]">
              ใช้สำหรับจัดคิวงานและประเมินกำหนดส่งมอบ
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div class="mb-4">
          <h3 class="text-base font-semibold leading-[1.45] text-[#171717]">
            รูปภาพต้นฉบับ / รูปอ้างอิง
          </h3>
          <p class="mt-1 text-sm leading-[1.6] text-[#666666]">
            อัปโหลดได้สูงสุด 10 รูป เพื่อให้ทีมเข้าใจภาพตั้งต้นและทิศทางที่ต้องการ
          </p>
        </div>

        <div
          class="cursor-pointer rounded-[16px] border-2 border-dashed p-7 text-center transition"
          :class="dragOver ? 'border-[#171717] bg-[#F3F3F1]' : 'border-black/[0.10] bg-white hover:border-black/[0.20]'"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          >
          <div class="flex flex-col items-center justify-center gap-2">
            <p class="text-sm font-semibold text-[#171717]">
              ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
            </p>
            <p class="text-xs leading-[1.5] text-[#666666]">
              รองรับไฟล์ JPEG, PNG, WebP (สูงสุด 20MB ต่อไฟล์)
            </p>
          </div>
        </div>

        <div
          v-if="uploadingSource"
          class="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-[#171717]"
        >
          <div class="h-4 w-4 animate-spin rounded-full border-2 border-[#F3F3F1] border-t-[#171717]" />
          กำลังอัปโหลดรูปภาพ...
        </div>
        <p
          v-if="uploadError"
          class="mt-3 rounded-xl border border-[#FDEEEE] bg-[#FDEEEE] px-4 py-3 text-sm font-medium text-[#B93B3B]"
        >
          {{ uploadError }}
        </p>

        <div
          v-if="sourceImages.length > 0"
          class="mt-4 grid gap-3"
          :class="sourceImages.length === 1 ? 'max-w-[220px] grid-cols-1' : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5'"
        >
          <div
            v-for="(url, idx) in sourceImages"
            :key="url"
            class="group relative overflow-hidden rounded-[16px] border border-black/[0.06] bg-[#F3F3F1]"
            :class="sourceImages.length === 1 ? 'aspect-[4/3]' : 'aspect-square'"
          >
            <img
              :src="url"
              :alt="`รูปภาพต้นฉบับหรือรูปอ้างอิง ${idx + 1}`"
              class="h-full w-full object-contain p-1"
            >
            <button
              class="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#FDEEEE] text-[#B93B3B] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:bg-[#B93B3B] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#B93B3B]/20"
              title="ลบรูปภาพ"
              type="button"
              @click.stop="removeImage(idx)"
            >
              <svg
                class="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="flex items-center justify-between gap-4 rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div>
            <p class="text-sm font-semibold text-[#171717]">
              บริการเร่งด่วน
            </p>
            <p
              v-if="selectedPackage?.packageUrgentPrice"
              class="mt-1 text-xs leading-[1.5] text-[#9A6812]"
            >
              +฿{{ formatPrice(selectedPackage.packageUrgentPrice) }}
            </p>
            <p
              v-else
              class="mt-1 text-xs leading-[1.5] text-[#929292]"
            >
              แพ็กเกจนี้ไม่รองรับบริการเร่งด่วน
            </p>
          </div>
          <button
            :disabled="!selectedPackage?.packageUrgentPrice"
            class="relative h-6 w-11 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25 disabled:opacity-40"
            :class="form.orderIsUrgent ? 'bg-[#171717]' : 'bg-[#E6E6E3]'"
            type="button"
            @click="form.orderIsUrgent = !form.orderIsUrgent"
          >
            <span
              class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
              :class="form.orderIsUrgent ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>

        <div class="flex items-center justify-between gap-4 rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div>
            <p class="text-sm font-semibold text-[#171717]">
              อนุญาตโชว์ใน Gallery
            </p>
            <p
              v-if="selectedPackage"
              class="mt-1 text-xs leading-[1.5] text-[#666666]"
            >
              ลด {{ selectedPackage.packageGalleryDiscount }}% (ประหยัด ฿{{ formatPrice(pricePreview.discount || (Number(selectedPackage.packagePrice) * Number(selectedPackage.packageGalleryDiscount)) / 100) }})
            </p>
          </div>
          <button
            class="relative h-6 w-11 rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#756CE8]/25"
            :class="form.orderIsGalleryAllowed ? 'bg-[#171717]' : 'bg-[#E6E6E3]'"
            type="button"
            @click="form.orderIsGalleryAllowed = !form.orderIsGalleryAllowed"
          >
            <span
              class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
              :class="form.orderIsGalleryAllowed ? 'translate-x-5' : 'translate-x-0'"
            />
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="selectedPackage"
      class="mt-6 rounded-[20px] border border-black/[0.06] bg-[#F3F3F1] p-5"
    >
      <h3 class="mb-3 text-sm font-semibold text-[#171717]">
        สรุปราคาเบื้องต้น
      </h3>
      <div class="space-y-2 text-sm">
        <div class="flex justify-between gap-4">
          <span class="text-[#666666]">ราคาแพ็กเกจ ({{ selectedPackage.packageName }})</span>
          <span class="font-medium text-[#171717]">฿{{ formatPrice(pricePreview.base) }}</span>
        </div>
        <div
          v-if="pricePreview.urgent > 0"
          class="flex justify-between gap-4 text-[#9A6812]"
        >
          <span>ค่าเร่งด่วน</span>
          <span class="font-medium">+฿{{ formatPrice(pricePreview.urgent) }}</span>
        </div>
        <div
          v-if="pricePreview.discount > 0"
          class="flex justify-between gap-4 text-[#267A48]"
        >
          <span>ส่วนลด Gallery</span>
          <span class="font-medium">-฿{{ formatPrice(pricePreview.discount) }}</span>
        </div>
        <hr class="my-2 border-black/[0.06]">
        <div class="flex justify-between gap-4 text-base font-semibold text-[#171717]">
          <span>รวมโดยประมาณ</span>
          <span>฿{{ formatPrice(pricePreview.total) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
