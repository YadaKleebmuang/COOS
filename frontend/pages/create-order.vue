<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { orderService } from "~/app/services/order.service"
import type {
  WorkType,
  Package,
  OrderFormPayload,
  OrderCreateResponse,
} from "~/app/types/order.types"

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
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-indigo-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">

      <!-- Header -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600 transition mb-4">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          กลับหน้าหลัก
        </NuxtLink>
        <h1 class="text-3xl font-bold text-gray-800">🎨 สั่งทำภาพ</h1>
        <p class="text-gray-500 mt-1">กรอกข้อมูลเพื่อสร้างคำสั่งงานภาพดิจิทัล</p>
      </div>

      <!-- ===== Success State ===== -->
      <div v-if="submitSuccess && createdOrder" class="bg-white rounded-2xl shadow-lg p-8 text-center animate-fade-in">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">สร้างคำสั่งงานสำเร็จ! 🎉</h2>
        <p class="text-gray-500 mb-6">หมายเลขออเดอร์: <span class="font-semibold text-indigo-600">#{{ createdOrder.orderId }}</span></p>

        <div class="bg-gray-50 rounded-xl p-5 max-w-sm mx-auto mb-6 text-left space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">ราคาแพ็กเกจ</span>
            <span class="font-medium">฿{{ formatPrice(createdOrder.orderBasePrice) }}</span>
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
            <span>รวมทั้งหมด</span>
            <span class="text-indigo-600">฿{{ formatPrice(createdOrder.orderTotalPrice) }}</span>
          </div>
        </div>

        <p class="text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mb-6">
          ⏳ สถานะ: <strong>รอชำระมัดจำ</strong> — กรุณาชำระมัดจำ 30% เพื่อเริ่มดำเนินการ
        </p>

        <NuxtLink to="/"
          class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition"
        >
          กลับหน้าหลัก
        </NuxtLink>
      </div>

      <!-- ===== Loading State ===== -->
      <div v-else-if="loadingData" class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="animate-spin w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"></div>
        <p class="text-gray-500">กำลังโหลดข้อมูล...</p>
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
                    ? 'bg-green-500 text-white shadow-md shadow-green-200'
                    : idx + 1 === currentStep
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-gray-200 text-gray-400'
                "
              >
                <svg v-if="idx + 1 < currentStep" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <span
                class="text-sm font-medium hidden sm:inline transition-colors duration-200"
                :class="
                  idx + 1 <= currentStep ? 'text-gray-700' : 'text-gray-400'
                "
              >{{ label }}</span>
            </button>

            <!-- Connector line -->
            <div
              v-if="idx < stepLabels.length - 1"
              class="w-8 sm:w-16 h-0.5 mx-2 transition-all duration-300"
              :class="idx + 1 < currentStep ? 'bg-green-400' : 'bg-gray-200'"
            />
          </template>
        </div>

        <!-- Card container -->
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">

          <!-- ==================== Step 1: Work Type ==================== -->
          <div v-show="currentStep === 1" class="p-6 sm:p-8">
            <h2 class="text-xl font-bold text-gray-800 mb-1">เลือกประเภทงาน</h2>
            <p class="text-gray-500 text-sm mb-6">เลือกประเภทภาพที่ต้องการสั่งทำ</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                v-for="wt in workTypes"
                :key="wt.workTypeId"
                @click="selectedWorkTypeId = wt.workTypeId"
                class="relative p-5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md group"
                :class="
                  selectedWorkTypeId === wt.workTypeId
                    ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                    : 'border-gray-200 hover:border-indigo-300 bg-white'
                "
              >
                <!-- Check icon -->
                <div
                  v-if="selectedWorkTypeId === wt.workTypeId"
                  class="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center"
                >
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </div>

                <div class="text-2xl mb-2">🎨</div>
                <h3 class="font-semibold text-gray-800 text-lg">{{ wt.workTypeName }}</h3>
                <p v-if="wt.workTypeDescription" class="text-gray-500 text-sm mt-1">{{ wt.workTypeDescription }}</p>
              </button>
            </div>
          </div>

          <!-- ==================== Step 2: Package ==================== -->
          <div v-show="currentStep === 2" class="p-6 sm:p-8">
            <h2 class="text-xl font-bold text-gray-800 mb-1">เลือกแพ็กเกจ</h2>
            <p class="text-gray-500 text-sm mb-6">เลือกแพ็กเกจที่เหมาะกับความต้องการของคุณ</p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <button
                v-for="pkg in packages"
                :key="pkg.packageId"
                @click="selectedPackageId = pkg.packageId"
                class="relative p-6 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-lg group flex flex-col"
                :class="
                  selectedPackageId === pkg.packageId
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                    : 'border-gray-200 hover:border-indigo-300 bg-white'
                "
              >
                <!-- Check -->
                <div
                  v-if="selectedPackageId === pkg.packageId"
                  class="absolute top-3 right-3 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center"
                >
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </div>

                <!-- Package name -->
                <h3 class="font-bold text-lg text-gray-800 mb-3">{{ pkg.packageName }}</h3>

                <!-- Price -->
                <div class="mb-4">
                  <span class="text-3xl font-extrabold text-indigo-600">฿{{ formatPrice(pkg.packagePrice) }}</span>
                </div>

                <!-- Details -->
                <ul class="space-y-2 text-sm text-gray-600 flex-1">
                  <li class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    {{ pkg.packageImageCount }} ภาพ
                  </li>
                  <li class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    ความละเอียด {{ pkg.packageResolution }}
                  </li>
                  <li class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
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

                <p v-if="pkg.packageDescription" class="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">{{ pkg.packageDescription }}</p>
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
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 transition"
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
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 transition"
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
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 transition resize-none"
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
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 transition resize-none"
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
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 transition"
                />
              </div>

              <!-- Spacer on desktop -->
              <div class="hidden md:block" />

              <!-- Toggle: เร่งด่วน -->
              <div class="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div>
                  <p class="font-medium text-gray-800 text-sm">⚡ บริการเร่งด่วน</p>
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
              <div class="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div>
                  <p class="font-medium text-gray-800 text-sm">🖼 อนุญาตโชว์ใน Gallery</p>
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
            <div v-if="selectedPackage" class="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
              <h3 class="font-semibold text-gray-800 text-sm mb-3">💰 สรุปราคาเบื้องต้น</h3>
              <div class="space-y-1.5 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">ราคาแพ็กเกจ ({{ selectedPackage.packageName }})</span>
                  <span class="font-medium">฿{{ formatPrice(pricePreview.base) }}</span>
                </div>
                <div v-if="pricePreview.urgent > 0" class="flex justify-between text-orange-600">
                  <span>ค่าเร่งด่วน</span>
                  <span class="font-medium">+฿{{ formatPrice(pricePreview.urgent) }}</span>
                </div>
                <div v-if="pricePreview.discount > 0" class="flex justify-between text-green-600">
                  <span>ส่วนลด Gallery</span>
                  <span class="font-medium">-฿{{ formatPrice(pricePreview.discount) }}</span>
                </div>
                <hr class="border-indigo-200" />
                <div class="flex justify-between text-base font-bold text-indigo-700">
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
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ประเภทงาน</p>
                <p class="font-semibold text-gray-800 text-lg">🎨 {{ selectedWorkType?.workTypeName }}</p>
              </div>

              <!-- Package -->
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">แพ็กเกจ</p>
                <p class="font-semibold text-gray-800 text-lg">📦 {{ selectedPackage?.packageName }}</p>
                <div class="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  <span class="bg-white px-3 py-1 rounded-lg border">{{ selectedPackage?.packageImageCount }} ภาพ</span>
                  <span class="bg-white px-3 py-1 rounded-lg border">{{ selectedPackage?.packageResolution }}</span>
                  <span class="bg-white px-3 py-1 rounded-lg border">{{ selectedPackage?.packageDeliveryDays }} วัน</span>
                </div>
              </div>

              <!-- Details -->
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">รายละเอียดงาน</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div v-if="form.orderStyle">
                    <span class="text-gray-500">สไตล์:</span>
                    <span class="ml-1 font-medium text-gray-800">{{ form.orderStyle }}</span>
                  </div>
                  <div v-if="form.orderColorTone">
                    <span class="text-gray-500">โทนสี:</span>
                    <span class="ml-1 font-medium text-gray-800">{{ form.orderColorTone }}</span>
                  </div>
                  <div class="sm:col-span-2" v-if="form.orderComposition">
                    <span class="text-gray-500">องค์ประกอบฉาก:</span>
                    <span class="ml-1 font-medium text-gray-800">{{ form.orderComposition }}</span>
                  </div>
                  <div class="sm:col-span-2" v-if="form.orderNote">
                    <span class="text-gray-500">หมายเหตุ:</span>
                    <span class="ml-1 font-medium text-gray-800">{{ form.orderNote }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">วันรับงาน:</span>
                    <span class="ml-1 font-medium text-gray-800">{{ form.orderRequiredDate }}</span>
                  </div>
                  <div v-if="form.orderIsUrgent">
                    <span class="inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md text-xs font-medium">⚡ เร่งด่วน</span>
                  </div>
                  <div v-if="form.orderIsGalleryAllowed">
                    <span class="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-medium">🖼 โชว์ Gallery</span>
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
              <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">สรุปราคา</p>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">ราคาแพ็กเกจ ({{ selectedPackage?.packageName }})</span>
                    <span class="font-medium">฿{{ formatPrice(pricePreview.base) }}</span>
                  </div>
                  <div v-if="pricePreview.urgent > 0" class="flex justify-between text-orange-600">
                    <span>ค่าเร่งด่วน</span>
                    <span class="font-medium">+฿{{ formatPrice(pricePreview.urgent) }}</span>
                  </div>
                  <div v-if="pricePreview.discount > 0" class="flex justify-between text-green-600">
                    <span>ส่วนลด Gallery ({{ selectedPackage?.packageGalleryDiscount }}%)</span>
                    <span class="font-medium">-฿{{ formatPrice(pricePreview.discount) }}</span>
                  </div>
                  <hr class="border-indigo-200" />
                  <div class="flex justify-between text-lg font-bold text-indigo-700">
                    <span>รวมทั้งหมด</span>
                    <span>฿{{ formatPrice(pricePreview.total) }}</span>
                  </div>
                </div>
                <p class="text-xs text-gray-400 mt-2">* ราคาสุทธิจะถูกคำนวณอีกครั้งโดยระบบเมื่อยืนยัน</p>
              </div>

              <!-- Submit Error -->
              <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-xl p-4">
                <p class="text-red-600 text-sm font-medium">❌ {{ submitError }}</p>
              </div>
            </div>
          </div>

          <!-- ==================== Navigation Buttons ==================== -->
          <div class="px-6 sm:px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              class="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 font-medium transition text-sm"
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
              class="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm"
            >
              ถัดไป
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>

            <button
              v-else
              @click="submitOrder"
              :disabled="submitting"
              class="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold px-8 py-2.5 rounded-xl transition text-sm"
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
