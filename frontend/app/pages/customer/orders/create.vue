<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue"
import { orderService } from "~/services/order.service"
import type {
  WorkType,
  Package,
  OrderFormPayload,
  OrderCreateResponse,
} from "~/types/order.types"
import StepWorkType from "~/components/order/StepWorkType.vue"
import StepPackage from "~/components/order/StepPackage.vue"
import StepDetails from "~/components/order/StepDetails.vue"
import StepConfirm from "~/components/order/StepConfirm.vue"
import StepSuccess from "~/components/order/StepSuccess.vue"

definePageMeta({
  layout: "customer",
  middleware: ["auth", "customer"],
})

const token = useCookie<string | null>("token")
const router = useRouter()
const route = useRoute()

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
const sourceImageUrls = ref<string[]>([])
const acceptedDisclaimer = ref(false)

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

    if (form.orderStyle.trim()) payload.orderStyle = form.orderStyle.trim()
    if (form.orderColorTone.trim()) payload.orderColorTone = form.orderColorTone.trim()
    if (form.orderComposition.trim()) payload.orderComposition = form.orderComposition.trim()
    if (form.orderNote.trim()) payload.orderNote = form.orderNote.trim()
    if (sourceImageUrls.value.length > 0) payload.sourceImageUrls = sourceImageUrls.value

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

    // Prefill from query params
    if (route.query.workTypeId) selectedWorkTypeId.value = Number(route.query.workTypeId)
    if (route.query.packageId) selectedPackageId.value = Number(route.query.packageId)
    if (route.query.style) form.orderStyle = String(route.query.style)
    if (route.query.colorTone) form.orderColorTone = String(route.query.colorTone)
    if (route.query.composition) form.orderComposition = String(route.query.composition)

    if (selectedWorkTypeId.value && selectedPackageId.value) {
      currentStep.value = 3
    } else if (selectedWorkTypeId.value) {
      currentStep.value = 2
    }
  } catch (err: any) {
    dataError.value = err?.message || "ไม่สามารถโหลดข้อมูลได้"
  } finally {
    loadingData.value = false
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
    <!-- Header -->
    <div class="mb-8 text-center">

      <h1 class="text-2xl font-bold text-gray-900">สั่งทำภาพ</h1>
      <p class="text-gray-500 text-sm mt-1">กรอกข้อมูลเพื่อสร้างคำสั่งงานภาพดิจิทัล</p>
    </div>

    <!-- Success State -->
    <StepSuccess v-if="submitSuccess && createdOrder" :createdOrder="createdOrder" />

    <!-- Loading State -->
    <div v-else-if="loadingData" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
      <div class="animate-spin w-8 h-8 border-2 border-slate-200 border-t-gray-900 rounded-full mx-auto mb-4"></div>
      <p class="text-gray-500 font-medium text-sm">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="dataError" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
      <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      </div>
      <p class="text-red-600 font-medium mb-1">เกิดข้อผิดพลาด</p>
      <p class="text-gray-500 text-sm">{{ dataError }}</p>
    </div>

    <!-- Form Wizard -->
    <div v-else>
      <!-- Stepper Navbar -->
      <div class="flex items-center justify-center mb-8">
        <template v-for="(label, idx) in stepLabels" :key="idx">
          <button
            @click="goToStep(idx + 1)"
            class="flex items-center gap-2 transition-all duration-200"
            :class="idx + 1 <= currentStep ? 'cursor-pointer' : 'cursor-default'"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
              :class="
                idx + 1 < currentStep
                  ? 'bg-gray-900 text-white'
                  : idx + 1 === currentStep
                    ? 'bg-gray-900 text-white'
                    : 'bg-slate-100 text-gray-400'
              "
            >
              <svg v-if="idx + 1 < currentStep" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <span
              class="text-sm font-medium hidden sm:inline transition-colors duration-200"
              :class="idx + 1 <= currentStep ? 'text-gray-900' : 'text-gray-400'"
            >{{ label }}</span>
          </button>

          <!-- Connector line -->
          <div
            v-if="idx < stepLabels.length - 1"
            class="w-8 sm:w-16 h-px mx-2 transition-all duration-300"
            :class="idx + 1 < currentStep ? 'bg-gray-900' : 'bg-slate-200'"
          />
        </template>
      </div>

      <!-- Card container -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        
        <StepWorkType
          v-show="currentStep === 1"
          :workTypes="workTypes"
          v-model="selectedWorkTypeId"
        />

        <StepPackage
          v-show="currentStep === 2"
          :packages="packages"
          v-model="selectedPackageId"
        />

        <StepDetails
          v-show="currentStep === 3"
          v-model="form"
          v-model:images="sourceImageUrls"
          :selectedPackage="selectedPackage || null"
          :pricePreview="pricePreview"
        />

        <StepConfirm
          v-show="currentStep === 4"
          :form="form"
          :selectedWorkType="selectedWorkType"
          :selectedPackage="selectedPackage"
          :pricePreview="pricePreview"
          v-model="acceptedDisclaimer"
          :submitError="submitError"
        />

        <!-- Navigation Buttons -->
        <div class="px-6 sm:px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            v-if="currentStep > 1"
            @click="prevStep"
            class="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-medium transition text-sm py-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            ย้อนกลับ
          </button>
          <div v-else class="w-10"></div> <!-- Placeholder to keep Next button on the right -->

          <button
            v-if="currentStep < totalSteps"
            @click="nextStep"
            :disabled="!canGoNext"
            class="flex items-center gap-1.5 font-medium transition text-sm px-5 py-2 rounded-lg"
            :class="
              canGoNext
                ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            "
          >
            ถัดไป
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>

          <button
            v-else
            @click="submitOrder"
            :disabled="submitting || !acceptedDisclaimer"
            class="flex items-center gap-2 font-medium transition text-sm px-6 py-2.5 rounded-lg"
            :class="
              submitting || !acceptedDisclaimer
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
            "
          >
            <span v-if="submitting" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
            <span v-else>ยืนยันการสั่งทำภาพ</span>
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
