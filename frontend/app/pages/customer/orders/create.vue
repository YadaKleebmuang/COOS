<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { orderService } from "~/services/order.service"
import type {
  WorkType,
  Package,
  OrderFormPayload,
  OrderCreateResponse,
} from "~/types/order.types"

definePageMeta({
  layout: "customer",
  middleware: ["auth", "customer"],
})

// ── Router & Auth ──
const token = useCookie<string | null>("token")
const router = useRouter()

// ── Stepper ──
const currentStep = ref(1)
const totalSteps = 4
const stepLabels = ["ประเภทงาน", "แพ็กเกจ", "รายละเอียด", "ยืนยัน"]

// ── Data from API ──
const workTypes = ref<WorkType[]>([])
const packages = ref<Package[]>([])
const loadingData = ref(true)
const dataError = ref("")

// ── Selected state ──
const selectedWorkTypeId = ref<number | null>(null)
const selectedPackageId = ref<number | null>(null)

// ── Order form ──
const form = reactive({
  orderStyle: "",
  orderColorTone: "",
  orderComposition: "",
  orderNote: "",
  orderRequiredDate: "",
  orderIsUrgent: false,
  orderIsGalleryAllowed: false,
})

// ── Submit state ──
const submitting = ref(false)
const submitError = ref("")
const submitSuccess = ref(false)
const createdOrder = ref<OrderCreateResponse | null>(null)

// ── Upload & Disclaimer state ──
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const uploadingSource = ref(false)
const uploadError = ref("")
const sourceImageUrls = ref<string[]>([])
const acceptedDisclaimer = ref(false)

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

  if (sourceImageUrls.value.length + validFiles.length > 10) {
    uploadError.value = "สามารถอัปโหลดรูปภาพได้สูงสุด 10 รูป"
    return
  }

  uploadError.value = ""
  uploadingSource.value = true
  try {
    const urls = await orderService.uploadSourceImages(validFiles)
    sourceImageUrls.value.push(...urls)
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
  sourceImageUrls.value.splice(index, 1)
}

// ── Computed helpers ──
const selectedWorkType = computed(() =>
  workTypes.value.find((wt) => wt.workTypeId === selectedWorkTypeId.value)
)

const selectedPackage = computed(() =>
  packages.value.find((p) => p.packageId === selectedPackageId.value)
)

// คำนวณราคาพรีวิว (คำนวณจริงจะทำที่ Backend)
const pricePreview = computed(() => {
  const pkg = selectedPackage.value
  if (!pkg) return { base: 0, urgent: 0, discount: 0, total: 0 }

  const base = Number(pkg.packagePrice)
  const urgent = form.orderIsUrgent ? Number(pkg.packageUrgentPrice || 0) : 0
  const discount = form.orderIsGalleryAllowed
    ? (base * Number(pkg.packageGalleryDiscount || 20)) / 100
    : 0
  const total = base + urgent - discount

  return { base, urgent, discount, total }
})

// Minimum date สำหรับ date picker (พรุ่งนี้)
const minDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split("T")[0]
})

// ── Validation ──
const canGoNext = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedWorkTypeId.value !== null
    case 2:
      return selectedPackageId.value !== null
    case 3:
      return form.orderRequiredDate !== ""
    default:
      return true
  }
})

// ── Navigation ──
const nextStep = () => {
  if (canGoNext.value && currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const goToStep = (step: number) => {
  // อนุญาตกลับไป step ก่อนหน้าได้ แต่ไปข้างหน้าได้เฉพาะ step ถัดไปที่ valid
  if (step < currentStep.value) {
    currentStep.value = step
  }
}

// ── Submit ──
const submitOrder = async () => {
  if (submitting.value) return
  if (!selectedPackageId.value || !selectedWorkTypeId.value) return

  if (!acceptedDisclaimer.value) {
    submitError.value = "กรุณายอมรับนโยบายความเป็นส่วนตัวและข้อตกลงก่อนกดยืนยัน"
    return
  }

  submitting.value = true
  submitError.value = ""

  try {
    const payload: OrderFormPayload = {
      packageId: selectedPackageId.value,
      workTypeId: selectedWorkTypeId.value,
      orderRequiredDate: form.orderRequiredDate,
      orderIsUrgent: form.orderIsUrgent,
      orderIsGalleryAllowed: form.orderIsGalleryAllowed,
    }

    // ใส่ optional fields เฉพาะที่กรอก
    if (form.orderStyle.trim()) payload.orderStyle = form.orderStyle.trim()
    if (form.orderColorTone.trim()) payload.orderColorTone = form.orderColorTone.trim()
    if (form.orderComposition.trim()) payload.orderComposition = form.orderComposition.trim()
    if (form.orderNote.trim()) payload.orderNote = form.orderNote.trim()
    
    // ใส่รูปภาพต้นฉบับที่อัปโหลด
    if (sourceImageUrls.value.length > 0) {
      payload.sourceImageUrls = sourceImageUrls.value
    }

    const result = await orderService.createOrder(payload)
    createdOrder.value = result
    submitSuccess.value = true
  } catch (err: any) {
    submitError.value = err?.message || "เกิดข้อผิดพลาดในการสร้างคำสั่งงาน"
  } finally {
    submitting.value = false
  }
}

// ── Fetch data on mount ──
onMounted(async () => {
  if (!token.value) {
    router.push("/login")
    return
  }

  loadingData.value = true
  dataError.value = ""

  try {
    const [wt, pkg] = await Promise.all([
      orderService.getWorkTypes(),
      orderService.getPackages(),
    ])
    workTypes.value = wt
    packages.value = pkg
  } catch (err: any) {
    dataError.value = err?.message || "ไม่สามารถโหลดข้อมูลได้"
  } finally {
    loadingData.value = false
  }
})

// ── Format currency ──
const formatPrice = (n: number) =>
  n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="max-w-4xl mx-auto">

      <!-- Header -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition mb-4">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          กลับหน้าหลัก
        </NuxtLink>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">🎨 สั่งทำภาพ</h1>
        <p class="text-gray-500 mt-1">กรอกข้อมูลเพื่อสร้างคำสั่งงานภาพดิจิทัล</p>
      </div>

      <!-- ===== Success State ===== -->
      <div v-if="submitSuccess && createdOrder" class="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 text-center animate-fade-in">
        <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">สร้างคำสั่งงานสำเร็จ! 🎉</h2>
        <p class="text-gray-500 mb-6">หมายเลขออเดอร์: <span class="font-bold text-gray-900">#{{ createdOrder.orderId }}</span></p>

        <div class="bg-gray-50 border border-gray-100 rounded-2xl p-5 max-w-sm mx-auto mb-6 text-left space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">ราคาแพ็กเกจ</span>
            <span class="font-medium text-gray-900">฿{{ formatPrice(createdOrder.orderBasePrice) }}</span>
          </div>
          <div v-if="createdOrder.orderUrgentPrice > 0" class="flex justify-between text-sm">
            <span class="text-gray-500">ค่าเร่งด่วน</span>
            <span class="font-medium text-orange-600">+฿{{ formatPrice(createdOrder.orderUrgentPrice) }}</span>
          </div>
          <div v-if="createdOrder.orderDiscount > 0" class="flex justify-between text-sm">
            <span class="text-gray-500">ส่วนลด Gallery</span>
            <span class="font-medium text-green-600">-฿{{ formatPrice(createdOrder.orderDiscount) }}</span>
          </div>
          <hr class="border-gray-200"/>
          <div class="flex justify-between text-base font-bold">
            <span class="text-gray-900">รวมทั้งหมด</span>
            <span class="text-gray-900">฿{{ formatPrice(createdOrder.orderTotalPrice) }}</span>
          </div>
        </div>

        <p class="text-sm text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6">
          ⏳ สถานะ: <strong>รอชำระมัดจำ</strong> — กรุณาชำระมัดจำ 30% เพื่อเริ่มดำเนินการ
        </p>

        <NuxtLink to="/"
          class="inline-block bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-xl transition shadow-sm hover:shadow-md"
        >
          กลับหน้าหลัก
        </NuxtLink>
      </div>

      <!-- ===== Loading State ===== -->
      <div v-else-if="loadingData" class="bg-white rounded-3xl border border-gray-100 shadow-xl p-12 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-slate-200 border-t-gray-900 rounded-full mx-auto mb-4"></div>
        <p class="text-gray-500 font-semibold">กำลังโหลดข้อมูล...</p>
      </div>

      <!-- ===== Error State ===== -->
      <div v-else-if="dataError" class="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <p class="text-red-600 font-medium mb-2">เกิดข้อผิดพลาด</p>
        <p class="text-gray-500 text-sm">{{ dataError }}</p>
      </div>

      <!-- ===== Form Wizard ===== -->
      <div v-else>
        <!-- Stepper -->
        <div class="flex items-center justify-center mb-8">
          <template v-for="(label, idx) in stepLabels" :key="idx">
            <button
              @click="goToStep(idx + 1)"
              class="flex items-center gap-2 transition-all duration-200"
              :class="idx + 1 <= currentStep ? 'cursor-pointer' : 'cursor-default'"
            >
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300"
                :class="
                  idx + 1 < currentStep
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : idx + 1 === currentStep
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'bg-gray-200 text-gray-400'
                "
              >
                <svg v-if="idx + 1 < currentStep" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <span
                class="text-sm font-semibold hidden sm:inline transition-colors duration-200"
                :class="
                  idx + 1 <= currentStep ? 'text-gray-800' : 'text-gray-400'
                "
              >{{ label }}</span>
            </button>

            <!-- Connector line -->
            <div
              v-if="idx < stepLabels.length - 1"
              class="w-8 sm:w-16 h-0.5 mx-2 transition-all duration-300"
              :class="idx + 1 < currentStep ? 'bg-emerald-500' : 'bg-gray-200'"
            />
          </template>
        </div>

        <!-- Card container -->
        <div class="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">

          <!-- ==================== Step 1: Work Type ==================== -->
          <div v-show="currentStep === 1" class="p-6 sm:p-8">
            <h2 class="text-xl font-bold text-gray-900 mb-1">เลือกประเภทงาน</h2>
            <p class="text-gray-500 text-sm mb-6">เลือกประเภทภาพที่ต้องการสั่งทำ</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                v-for="wt in workTypes"
                :key="wt.workTypeId"
                @click="selectedWorkTypeId = wt.workTypeId"
                class="relative p-6 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md group"
                :class="
                  selectedWorkTypeId === wt.workTypeId
                    ? 'border-gray-900 bg-gray-50/50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-300 bg-white'
                "
              >
                <!-- Check icon -->
                <div
                  v-if="selectedWorkTypeId === wt.workTypeId"
                  class="absolute top-4 right-4 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center"
                >
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </div>

                <div class="text-2xl mb-2">🎨</div>
                <h3 class="font-extrabold text-gray-800 text-lg">{{ wt.workTypeName }}</h3>
                <p v-if="wt.workTypeDescription" class="text-gray-500 text-sm mt-1.5 leading-relaxed">{{ wt.workTypeDescription }}</p>
              </button>
            </div>
          </div>

          <!-- ==================== Step 2: Package ==================== -->
          <div v-show="currentStep === 2" class="p-6 sm:p-8">
            <h2 class="text-xl font-bold text-gray-900 mb-1">เลือกแพ็กเกจ</h2>
            <p class="text-gray-500 text-sm mb-6">เลือกแพ็กเกจที่เหมาะกับความต้องการของคุณ</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <button
                v-for="pkg in packages"
                :key="pkg.packageId"
                @click="selectedPackageId = pkg.packageId"
                class="relative p-6 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-lg group flex flex-col"
                :class="
                  selectedPackageId === pkg.packageId
                    ? 'border-gray-900 bg-gray-50/50 shadow-md'
                    : 'border-gray-100 hover:border-gray-300 bg-white'
                "
              >
                <!-- Check -->
                <div
                  v-if="selectedPackageId === pkg.packageId"
                  class="absolute top-4 right-4 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center"
                >
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </div>

                <!-- Package name -->
                <h3 class="font-extrabold text-lg text-gray-800 mb-3">{{ pkg.packageName }}</h3>

                <!-- Price -->
                <div class="mb-4">
                  <span class="text-3xl font-black text-gray-900">฿{{ formatPrice(pkg.packagePrice) }}</span>
                </div>

                <!-- Details -->
                <ul class="space-y-2.5 text-sm text-gray-600 flex-1">
                  <li class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    {{ pkg.packageImageCount }} ภาพ
                  </li>
                  <li class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    ความละเอียด {{ pkg.packageResolution }}
                  </li>
                  <li class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    ส่งงานภายใน {{ pkg.packageDeliveryDays }} วัน
                  </li>
                  <li v-if="pkg.packageUrgentPrice" class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    <span class="text-orange-600">เร่งด่วน +฿{{ formatPrice(pkg.packageUrgentPrice) }}</span>
                  </li>
                  <li class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z"/></svg>
                    <span class="text-blue-600">ลด {{ pkg.packageGalleryDiscount }}% หากโชว์ Gallery</span>
                  </li>
                </ul>

                <p v-if="pkg.packageDescription" class="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100 leading-relaxed">{{ pkg.packageDescription }}</p>
              </button>
            </div>
          </div>

          <!-- ==================== Step 3: Details ==================== -->
          <div v-show="currentStep === 3" class="p-6 sm:p-8">
            <h2 class="text-xl font-bold text-gray-800 mb-1">รายละเอียดงาน</h2>
            <p class="text-gray-500 text-sm mb-6">กรอกข้อมูลเพิ่มเติมเพื่อให้ Editor เข้าใจสิ่งที่ต้องการ</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <!-- สไตล์ภาพ -->
              <div>
                <label for="order-style" class="block text-sm font-medium text-gray-700 mb-1.5">สไตล์ภาพ</label>
                <input
                  id="order-style"
                  v-model="form.orderStyle"
                  type="text"
                  placeholder="เช่น Minimal, Retro, Anime, Realistic"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700 transition text-sm"
                />
              </div>

              <!-- โทนสี -->
              <div>
                <label for="order-color" class="block text-sm font-medium text-gray-700 mb-1.5">โทนสี</label>
                <input
                  id="order-color"
                  v-model="form.orderColorTone"
                  type="text"
                  placeholder="เช่น Warm, Cool, Pastel, Earth Tone"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700 transition text-sm"
                />
              </div>

              <!-- องค์ประกอบฉาก -->
              <div class="md:col-span-2">
                <label for="order-composition" class="block text-sm font-medium text-gray-700 mb-1.5">องค์ประกอบฉาก</label>
                <textarea
                  id="order-composition"
                  v-model="form.orderComposition"
                  rows="3"
                  placeholder="อธิบายฉากหรือองค์ประกอบที่ต้องการ เช่น สวนดอกไม้ ฉากพระอาทิตย์ตก ริมทะเล"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700 transition resize-none text-sm"
                />
              </div>

              <!-- หมายเหตุ -->
              <div class="md:col-span-2">
                <label for="order-note" class="block text-sm font-medium text-gray-700 mb-1.5">หมายเหตุเพิ่มเติม</label>
                <textarea
                  id="order-note"
                  v-model="form.orderNote"
                  rows="2"
                  placeholder="ข้อมูลเพิ่มเติมที่ต้องการแจ้ง Editor"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700 transition resize-none text-sm"
                />
              </div>

              <!-- วันที่ต้องการรับงาน -->
              <div>
                <label for="order-date" class="block text-sm font-medium text-gray-700 mb-1.5">
                  วันที่ต้องการรับงาน <span class="text-red-500">*</span>
                </label>
                <input
                  id="order-date"
                  v-model="form.orderRequiredDate"
                  type="date"
                  :min="minDate"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700 transition text-sm"
                />
              </div>

              <!-- Spacer on desktop -->
              <div class="hidden md:block" />

              <!-- อัปโหลดรูปภาพต้นฉบับ -->
              <div class="md:col-span-2">
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  🖼️ รูปภาพต้นฉบับ/รูปอ้างอิง (สูงสุด 10 รูป)
                </label>
                
                <div
                  @dragover.prevent="dragOver = true"
                  @dragleave.prevent="dragOver = false"
                  @drop.prevent="handleDrop"
                  @click="triggerFileInput"
                  class="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200"
                  :class="dragOver ? 'border-gray-900 bg-gray-50/50' : 'border-gray-200 hover:border-gray-400 bg-gray-50/50'"
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
                    <div class="text-3xl text-gray-900">📤</div>
                    <p class="text-sm font-semibold text-gray-700">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
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
                <div v-if="sourceImageUrls.length > 0" class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                  <div
                    v-for="(url, idx) in sourceImageUrls"
                    :key="url"
                    class="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-white"
                  >
                    <img :src="url" class="w-full h-full object-cover" />
                    <button
                      @click.stop="removeImage(idx)"
                      class="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow transition opacity-90"
                      title="ลบรูปภาพ"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Toggle: เร่งด่วน -->
              <div class="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                <div>
                  <p class="font-bold text-gray-800 text-sm">⚡ บริการเร่งด่วน</p>
                  <p v-if="selectedPackage?.packageUrgentPrice" class="text-xs text-orange-600 mt-0.5">
                    +฿{{ formatPrice(selectedPackage.packageUrgentPrice) }}
                  </p>
                  <p v-else class="text-xs text-gray-400 mt-0.5">แพ็กเกจนี้ไม่รองรับบริการเร่งด่วน</p>
                </div>
                <button
                  @click="form.orderIsUrgent = !form.orderIsUrgent"
                  :disabled="!selectedPackage?.packageUrgentPrice"
                  class="relative w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40"
                  :class="form.orderIsUrgent ? 'bg-orange-500' : 'bg-gray-300'"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200"
                    :class="form.orderIsUrgent ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>

              <!-- Toggle: Gallery -->
              <div class="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <div>
                  <p class="font-bold text-gray-800 text-sm">🖼 อนุญาตโชว์ใน Gallery</p>
                  <p v-if="selectedPackage" class="text-xs text-blue-600 mt-0.5">
                    ลด {{ selectedPackage.packageGalleryDiscount }}% (ประหยัด ฿{{ formatPrice(pricePreview.discount || (Number(selectedPackage.packagePrice) * Number(selectedPackage.packageGalleryDiscount)) / 100) }})
                  </p>
                </div>
                <button
                  @click="form.orderIsGalleryAllowed = !form.orderIsGalleryAllowed"
                  class="relative w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none"
                  :class="form.orderIsGalleryAllowed ? 'bg-blue-500' : 'bg-gray-300'"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200"
                    :class="form.orderIsGalleryAllowed ? 'translate-x-5' : 'translate-x-0'"
                  />
                </button>
              </div>
            </div>

            <!-- Price Preview -->
            <div v-if="selectedPackage" class="mt-6 bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h3 class="font-bold text-gray-900 text-sm mb-3">💰 สรุปราคาเบื้องต้น</h3>
              <div class="space-y-1.5 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">ราคาแพ็กเกจ ({{ selectedPackage.packageName }})</span>
                  <span class="font-semibold text-gray-900">฿{{ formatPrice(pricePreview.base) }}</span>
                </div>
                <div v-if="pricePreview.urgent > 0" class="flex justify-between text-orange-600">
                  <span>ค่าเร่งด่วน</span>
                  <span class="font-semibold">+฿{{ formatPrice(pricePreview.urgent) }}</span>
                </div>
                <div v-if="pricePreview.discount > 0" class="flex justify-between text-green-600">
                  <span>ส่วนลด Gallery</span>
                  <span class="font-semibold">-฿{{ formatPrice(pricePreview.discount) }}</span>
                </div>
                <hr class="border-gray-200" />
                <div class="flex justify-between text-base font-black text-gray-900">
                  <span>รวมโดยประมาณ</span>
                  <span>฿{{ formatPrice(pricePreview.total) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ==================== Step 4: Review & Confirm ==================== -->
          <div v-show="currentStep === 4" class="p-6 sm:p-8">
            <h2 class="text-xl font-bold text-gray-800 mb-1">ตรวจสอบ & ยืนยัน</h2>
            <p class="text-gray-500 text-sm mb-6">กรุณาตรวจสอบข้อมูลก่อนกดยืนยัน</p>

            <div class="space-y-5">
              <!-- Work Type -->
              <div class="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ประเภทงาน</p>
                <p class="font-bold text-gray-800 text-lg">🎨 {{ selectedWorkType?.workTypeName }}</p>
              </div>

              <!-- Package -->
              <div class="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">แพ็กเกจ</p>
                <p class="font-bold text-gray-800 text-lg">📦 {{ selectedPackage?.packageName }}</p>
                <div class="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  <span class="bg-white px-3 py-1 rounded-lg border border-gray-200/60 font-semibold">{{ selectedPackage?.packageImageCount }} ภาพ</span>
                  <span class="bg-white px-3 py-1 rounded-lg border border-gray-200/60 font-semibold">{{ selectedPackage?.packageResolution }}</span>
                  <span class="bg-white px-3 py-1 rounded-lg border border-gray-200/60 font-semibold">{{ selectedPackage?.packageDeliveryDays }} วัน</span>
                </div>
              </div>

              <!-- Details -->
              <div class="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">รายละเอียดงาน</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div v-if="form.orderStyle">
                    <span class="text-gray-500 font-medium">สไตล์:</span>
                    <span class="ml-1 font-bold text-gray-800">{{ form.orderStyle }}</span>
                  </div>
                  <div v-if="form.orderColorTone">
                    <span class="text-gray-500 font-medium">โทนสี:</span>
                    <span class="ml-1 font-bold text-gray-800">{{ form.orderColorTone }}</span>
                  </div>
                  <div class="sm:col-span-2" v-if="form.orderComposition">
                    <span class="text-gray-500 font-medium">องค์ประกอบฉาก:</span>
                    <span class="ml-1 font-bold text-gray-800">{{ form.orderComposition }}</span>
                  </div>
                  <div class="sm:col-span-2" v-if="form.orderNote">
                    <span class="text-gray-500 font-medium">หมายเหตุ:</span>
                    <span class="ml-1 font-bold text-gray-800">{{ form.orderNote }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500 font-medium">วันรับงาน:</span>
                    <span class="ml-1 font-bold text-gray-800">{{ form.orderRequiredDate }}</span>
                  </div>
                  <div v-if="form.orderIsUrgent">
                    <span class="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-0.5 rounded-md text-xs font-bold">⚡ เร่งด่วน</span>
                  </div>
                  <div v-if="form.orderIsGalleryAllowed">
                    <span class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-md text-xs font-bold">🖼 โชว์ Gallery</span>
                  </div>
                  <div
                    v-if="!form.orderStyle && !form.orderColorTone && !form.orderComposition && !form.orderNote && !form.orderIsUrgent && !form.orderIsGalleryAllowed"
                    class="sm:col-span-2 text-gray-400 italic"
                  >
                    ไม่ได้ระบุรายละเอียดเพิ่มเติม
                  </div>
                </div>
              </div>

              <!-- Pricing -->
              <div class="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">สรุปราคา</p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-500">ราคาแพ็กเกจ ({{ selectedPackage?.packageName }})</span>
                    <span class="font-semibold text-gray-900">฿{{ formatPrice(pricePreview.base) }}</span>
                  </div>
                  <div v-if="pricePreview.urgent > 0" class="flex justify-between text-orange-600">
                    <span>ค่าเร่งด่วน</span>
                    <span class="font-semibold">+฿{{ formatPrice(pricePreview.urgent) }}</span>
                  </div>
                  <div v-if="pricePreview.discount > 0" class="flex justify-between text-green-600">
                    <span>ส่วนลด Gallery ({{ selectedPackage?.packageGalleryDiscount }}%)</span>
                    <span class="font-semibold">-฿{{ formatPrice(pricePreview.discount) }}</span>
                  </div>
                  <hr class="border-gray-200" />
                  <div class="flex justify-between text-lg font-black text-gray-900">
                    <span>รวมทั้งหมด</span>
                    <span>฿{{ formatPrice(pricePreview.total) }}</span>
                  </div>
                </div>
                <p class="text-xs text-gray-400 mt-2">* ราคาสุทธิจะถูกคำนวณอีกครั้งโดยระบบเมื่อยืนยัน</p>
              </div>

              <!-- Privacy Policy & AI Disclaimer -->
              <div class="space-y-4 border-t border-gray-100 pt-6">
                <h3 class="font-bold text-gray-800 text-sm">📄 ข้อตกลงและเงื่อนไขการใช้บริการ</h3>
                
                <!-- Privacy Card -->
                <div class="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-800 leading-relaxed text-left">
                  <p class="font-bold mb-1">นโยบายความเป็นส่วนตัว (Privacy Policy)</p>
                  <p>รูปภาพต้นฉบับที่ท่านอัปโหลดเข้าระบบ จะถูกนำไปใช้เพื่อการประมวลผลและการตกแต่งภาพตามสั่งเท่านั้น ทางเราจะเก็บรักษาไฟล์ของท่านไว้เป็นความลับ และลบออกจากฐานข้อมูลภายใน 30 วันหลังจากออเดอร์เสร็จสิ้น</p>
                </div>

                <!-- AI Disclaimer Card -->
                <div class="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed text-left">
                  <p class="font-bold mb-1">ข้อจำกัดความรับผิดชอบและลิขสิทธิ์ AI (AI Disclaimer)</p>
                  <p>ผลงานภาพชิ้นนี้มีการใช้เทคโนโลยีปัญญาประดิษฐ์ (AI) ในกระบวนการสร้างสรรค์ร่วมกับงานฝีมือของศิลปิน ลิขสิทธิ์ของภาพผลงานขั้นสุดท้ายจะถูกโอนย้ายให้เป็นของท่าน แต่ทางระบบขอสงวนสิทธิ์การนำผลงานไปโชว์ใน Portfolio/Gallery หากท่านได้เลือกรับส่วนลด</p>
                </div>

                <!-- Disclaimer Checkbox -->
                <label class="flex items-start gap-2.5 cursor-pointer mt-2 text-left">
                  <input
                    type="checkbox"
                    v-model="acceptedDisclaimer"
                    class="w-4 h-4 rounded text-gray-900 border-gray-300 focus:ring-gray-900 mt-0.5 cursor-pointer"
                  />
                  <span class="text-xs font-semibold text-gray-600 select-none">
                    ข้าพเจ้าได้อ่าน เข้าใจ และยอมรับนโยบายความเป็นส่วนตัวและข้อตกลงเกี่ยวกับผลงาน AI เรียบร้อยแล้ว
                  </span>
                </label>
              </div>

              <!-- Submit Error -->
              <div v-if="submitError" class="bg-red-50 border border-red-100 rounded-2xl p-4">
                <p class="text-red-600 text-sm font-medium">❌ {{ submitError }}</p>
              </div>
            </div>
          </div>

          <!-- ==================== Navigation Buttons ==================== -->
          <div class="px-6 sm:px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              class="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-semibold transition text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              ย้อนกลับ
            </button>
            <div v-else />

            <!-- Next / Submit -->
            <button
              v-if="currentStep < totalSteps"
              @click="nextStep"
              :disabled="!canGoNext"
              class="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl transition text-sm shadow-sm hover:shadow-md"
            >
              ถัดไป
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>

            <button
              v-else
              @click="submitOrder"
              :disabled="submitting || !acceptedDisclaimer"
              class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-xl transition text-sm shadow-sm hover:shadow-md"
            >
              <svg v-if="submitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ submitting ? "กำลังสร้าง..." : "✅ ยืนยันสั่งงาน" }}
            </button>
          </div>
        </div>
      </div>
    </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
