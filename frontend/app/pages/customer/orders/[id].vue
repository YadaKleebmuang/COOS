<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useAlert } from "~/composables/useAlert"
import { orderService } from "~/services/order.service"
import type { OrderDetail, OrderStatus, Payment } from "~/types/order.types"

// ── Auth & Route ──
const token = useCookie<string | null>("token")
const route = useRoute()
const router = useRouter()
const orderId = route.params.id as string
const { alert, confirm } = useAlert()

definePageMeta({
  layout: "customer",
  middleware: ["auth", "customer"],
})

// ── State ──
const order = ref<OrderDetail | null>(null)
const loading = ref(true)
const error = ref("")

// ── Payment Form State ──
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)
const uploadingSlip = ref(false)
const uploadError = ref("")
const uploadedSlipUrl = ref("")
const submittingPayment = ref(false)
const submitPaymentError = ref("")

// ── Fetch details ──
const fetchOrderDetails = async () => {
  loading.value = true
  error.value = ""
  try {
    const res = await orderService.getOrderById(orderId)
    order.value = res
  } catch (err: any) {
    error.value = err?.message || "ไม่สามารถดึงข้อมูลรายละเอียดออเดอร์ได้"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!token.value) {
    router.push("/login")
    return
  }
  fetchOrderDetails()
})

// ── Order Steps (Total 8 steps timeline) ──
const stepsList: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "waiting_deposit", label: "รอชำระมัดจำ", desc: "ลูกค้าแนบสลิปชำระเงินมัดจำ 30%" },
  { status: "waiting_assignment", label: "รอจัดหาคนรับงาน", desc: "ผู้ดูแลระบบกำลังมอบหมายงานให้ Editor" },
  { status: "waiting_to_start", label: "รอเริ่มงาน", desc: "Editor ได้รับมอบหมายงานแล้ว เตรียมเริ่มดำเนินการ" },
  { status: "in_progress", label: "กำลังดำเนินการ", desc: "Editor กำลังสร้างสรรค์ผลงานภาพตามความต้องการ" },
  { status: "waiting_selection", label: "รอคัดเลือกภาพ", desc: "ลูกค้าพิจารณาภาพตัวอย่างเพื่อเลือกรูปไฟนอล" },
  { status: "waiting_final_payment", label: "รอชำระส่วนที่เหลือ", desc: "ชำระเงินส่วนที่เหลือ 70% เพื่อรับรูปขนาดจริง" },
  { status: "delivered", label: "ส่งมอบงาน", desc: "ระบบส่งภาพผลงานขนาดจริงเรียบร้อยแล้ว" },
  { status: "completed", label: "เสร็จสมบูรณ์", desc: "คำสั่งงานสิ้นสุดอย่างเป็นทางการ ขอบคุณที่ใช้บริการ" }
]

// ค้นหาตำแหน่ง step ปัจจุบัน (ถ้าเป็น cancelled จะถือว่าสิ้นสุดแต่ไม่ผ่านขั้นตอนปกติ)
const currentStepIndex = computed(() => {
  if (!order.value) return -1
  if (order.value.orderStatus === "cancelled") return -1
  return stepsList.findIndex((s) => s.status === order.value?.orderStatus)
})

// ── Payment Calculations ──
const paymentInfo = computed(() => {
  if (!order.value) return { type: "deposit" as const, amount: 0, percentage: 30 }
  const total = Number(order.value.orderTotalPrice)
  if (order.value.orderStatus === "waiting_deposit") {
    return { type: "deposit" as const, amount: total * 0.3, percentage: 30 }
  }
  return { type: "final" as const, amount: total * 0.7, percentage: 70 }
})

// ── Image Categorization ──
const sourceImages = computed(() => {
  if (!order.value?.images) return []
  return order.value.images.filter((img) => img.imageType === "source")
})

const aiGeneratedImages = computed(() => {
  if (!order.value?.images) return []
  return order.value.images.filter((img) => img.imageType === "ai_generated")
})

const finalImages = computed(() => {
  if (!order.value?.images) return []
  // ดึงภาพที่เป็น selected_final (ดึงแค่ที่เลือกแล้ว)
  return order.value.images.filter((img) => img.imageType === "selected_final")
})

// ── Photo Selection State ──
const selectedFinalImageIds = ref<number[]>([])
const submittingSelection = ref(false)
const submitSelectionError = ref("")

const toggleImageSelection = (imageId: number) => {
  if (!order.value) return
  const limit = order.value.packageImageCount
  
  const index = selectedFinalImageIds.value.indexOf(imageId)
  if (index > -1) {
    selectedFinalImageIds.value.splice(index, 1)
  } else {
    if (selectedFinalImageIds.value.length < limit) {
      selectedFinalImageIds.value.push(imageId)
    } else {
      alert("ข้อจำกัดจำนวนภาพ", `คุณสามารถเลือกรูปภาพได้สูงสุด ${limit} ภาพตามแพ็กเกจ`, "warning")
    }
  }
}

const submitPhotoSelection = async () => {
  if (!order.value || submittingSelection.value) return
  
  if (selectedFinalImageIds.value.length === 0) {
    submitSelectionError.value = "กรุณาเลือกรูปภาพอย่างน้อย 1 ภาพ"
    return
  }
  
  const confirmed = await confirm("ยืนยันการเลือกรูปภาพ", `ยืนยันการเลือกรูปภาพจำนวน ${selectedFinalImageIds.value.length} ภาพ ใช่หรือไม่? (เมื่อยืนยันแล้วจะไม่สามารถแก้ไขได้)`)
  if (!confirmed) {
    return
  }

  submittingSelection.value = true
  submitSelectionError.value = ""

  try {
    await orderService.selectFinalImages(order.value.orderId, selectedFinalImageIds.value)
    selectedFinalImageIds.value = []
    await fetchOrderDetails()
  } catch (err: any) {
    submitSelectionError.value = err?.message || "บันทึกการเลือกรูปภาพไม่สำเร็จ"
  } finally {
    submittingSelection.value = false
  }
}

// ── Status Badges Color Map ──
const getStatusBadgeClass = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    waiting_deposit: "bg-amber-100 text-amber-800 border-amber-200",
    waiting_assignment: "bg-blue-100 text-blue-800 border-blue-200",
    waiting_to_start: "bg-indigo-100 text-indigo-800 border-indigo-200",
    in_progress: "bg-purple-100 text-purple-800 border-purple-200",
    waiting_selection: "bg-pink-100 text-pink-800 border-pink-200",
    waiting_final_payment: "bg-orange-100 text-orange-800 border-orange-200",
    delivered: "bg-teal-100 text-teal-800 border-teal-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200"
  }
  return map[status] || "bg-gray-100 text-gray-800 border-gray-200"
}

const getStatusLabel = (status: OrderStatus) => {
  const map: Record<OrderStatus, string> = {
    waiting_deposit: "รอชำระมัดจำ (30%)",
    waiting_assignment: "รอจัดหาคนรับงาน",
    waiting_to_start: "รอเริ่มงาน",
    in_progress: "กำลังดำเนินการ",
    waiting_selection: "รอคัดเลือกภาพ",
    waiting_final_payment: "รอชำระส่วนที่เหลือ (70%)",
    delivered: "ส่งมอบงานแล้ว",
    completed: "เสร็จสมบูรณ์",
    cancelled: "ยกเลิกออเดอร์"
  }
  return map[status] || status
}

// ── Payment Status Badge ──
const getPaymentStatusBadgeClass = (status: Payment["paymentStatus"]) => {
  const map: Record<Payment["paymentStatus"], string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200"
  }
  return map[status] || "bg-gray-50 text-gray-700 border-gray-200"
}

const getPaymentStatusLabel = (status: Payment["paymentStatus"]) => {
  const map: Record<Payment["paymentStatus"], string> = {
    pending: "รอตรวจสอบ",
    approved: "อนุมัติแล้ว",
    rejected: "ไม่ผ่านอนุมัติ/ปฏิเสธ"
  }
  return map[status] || status
}

// ── File Upload Handlers ──
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    uploadSlipFile(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  dragOver.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    uploadSlipFile(event.dataTransfer.files[0])
  }
}

const uploadSlipFile = async (file: File) => {
  if (!file.type.startsWith("image/")) {
    uploadError.value = "กรุณาอัปโหลดสลิปที่เป็นไฟล์รูปภาพเท่านั้น"
    return
  }
  
  uploadError.value = ""
  uploadedSlipUrl.value = ""
  uploadingSlip.value = true

  try {
    const url = await orderService.uploadSlip(file)
    uploadedSlipUrl.value = url
  } catch (err: any) {
    uploadError.value = err?.message || "ไม่สามารถอัปโหลดไฟล์สลิปได้"
  } finally {
    uploadingSlip.value = false
    if (fileInput.value) fileInput.value.value = ""
  }
}

// ── Submit Slip ──
const submitSlip = async () => {
  if (!uploadedSlipUrl.value || submittingPayment.value || !order.value) return
  
  submittingPayment.value = true
  submitPaymentError.value = ""

  try {
    await orderService.submitPaymentSlip(
      order.value.orderId,
      paymentInfo.value.type,
      paymentInfo.value.amount,
      uploadedSlipUrl.value
    )
    // Clear and reload
    uploadedSlipUrl.value = ""
    await fetchOrderDetails()
  } catch (err: any) {
    submitPaymentError.value = err?.message || "ส่งหลักฐานชำระเงินไม่สำเร็จ"
  } finally {
    submittingPayment.value = false
  }
}

// ── Cancel Order (Customer can cancel when waiting_deposit) ──
const cancelOrder = async () => {
  if (!order.value) return
  const confirmed = await confirm("ยืนยันการยกเลิก", "คุณแน่ใจหรือไม่ที่จะยกเลิกออเดอร์นี้?")
  if (!confirmed) return

  try {
    await orderService.updateOrderStatus(order.value.orderId, "cancelled", "ลูกค้ายกเลิกคำสั่งงานด้วยตนเอง")
    await fetchOrderDetails()
  } catch (err: any) {
    alert("เกิดข้อผิดพลาด", err?.message || "ยกเลิกคำสั่งงานไม่สำเร็จ", "error")
  }
}

// ── Format helpers ──
const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-"
  const d = new Date(dateStr)
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
      
      <!-- Nav Header -->
      <div class="mb-8 flex items-center justify-between">
        <NuxtLink to="/customer/orders" class="inline-flex items-center justify-center bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl shadow-sm transition text-sm">
          <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/>
          </svg>
          ย้อนกลับไปรายการออเดอร์
        </NuxtLink>
        <button
          v-if="order && order.orderStatus === 'waiting_deposit'"
          @click="cancelOrder"
          class="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 border border-red-200 px-3.5 py-1.5 rounded-lg transition"
        >
          ยกเลิกออเดอร์นี้
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100">
        <div class="animate-spin w-12 h-12 border-4 border-slate-200 border-t-gray-900 rounded-full mx-auto mb-4"></div>
        <p class="text-gray-500 font-bold">กำลังดึงข้อมูลออเดอร์...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error || !order" class="bg-white rounded-2xl shadow-xl p-12 text-center border border-red-100">
        <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-red-600 mb-1">ไม่สามารถเปิดหน้านี้ได้</h3>
        <p class="text-gray-500 text-sm mb-6">{{ error || 'ไม่พบข้อมูลออเดอร์นี้' }}</p>
        <NuxtLink to="/customer/orders" class="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-xl transition text-sm">
          กลับไปหน้าประวัติออเดอร์
        </NuxtLink>
      </div>

      <div v-else class="space-y-8">
        
        <!-- ==================== ส่วนที่ 1: Order Summary Card ==================== -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 sm:px-8 py-5 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider block">หมายเลขออเดอร์</span>
              <h2 class="text-xl font-bold text-gray-800">ออเดอร์ #{{ order.orderId }}</h2>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400 font-semibold uppercase tracking-wider hidden sm:inline">สถานะปัจจุบัน:</span>
              <span class="px-4 py-1.5 rounded-full text-xs font-extrabold border shadow-sm" :class="getStatusBadgeClass(order.orderStatus)">
                {{ getStatusLabel(order.orderStatus) }}
              </span>
            </div>
          </div>

          <div class="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <span class="text-xs text-gray-400 font-bold block mb-1">ประเภทงาน</span>
              <span class="font-bold text-gray-800 text-base">{{ order.workTypeName }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-400 font-bold block mb-1">แพ็กเกจ</span>
              <span class="font-bold text-gray-800 text-base">{{ order.packageName }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-400 font-bold block mb-1">วันส่งมอบเป้าหมาย</span>
              <span class="font-bold text-gray-800 text-base">{{ formatDate(order.orderRequiredDate).split("เวลา")[0] }}</span>
            </div>
            <div>
              <span class="text-xs text-gray-400 font-bold block mb-1">ยอดเงินรวมทั้งสิ้น</span>
              <span class="font-black text-gray-900 text-xl">฿{{ formatPrice(order.orderTotalPrice) }}</span>
            </div>
          </div>

          <!-- Additional details expander -->
          <div v-if="order.orderStyle || order.orderColorTone || order.orderComposition || order.orderNote" class="px-6 sm:px-8 pb-6 pt-2 border-t border-gray-50">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">รายละเอียดความต้องการเพิ่มเติม</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50/50 rounded-2xl p-4">
              <div v-if="order.orderStyle">
                <span class="text-gray-500 font-semibold">สไตล์ภาพ:</span>
                <span class="ml-1 text-gray-800 font-medium">{{ order.orderStyle }}</span>
              </div>
              <div v-if="order.orderColorTone">
                <span class="text-gray-500 font-semibold">โทนสี:</span>
                <span class="ml-1 text-gray-800 font-medium">{{ order.orderColorTone }}</span>
              </div>
              <div class="sm:col-span-2" v-if="order.orderComposition">
                <span class="text-gray-500 font-semibold">องค์ประกอบฉาก:</span>
                <p class="mt-1 text-gray-800 leading-relaxed font-medium">{{ order.orderComposition }}</p>
              </div>
              <div class="sm:col-span-2" v-if="order.orderNote">
                <span class="text-gray-500 font-semibold">หมายเหตุเพิ่มเติม:</span>
                <p class="mt-1 text-gray-800 leading-relaxed font-medium">{{ order.orderNote }}</p>
              </div>
            </div>
          </div>

          <!-- Source image previews -->
          <div v-if="sourceImages.length > 0" class="px-6 sm:px-8 pb-8 pt-2">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">รูปต้นฉบับ/รูปอ้างอิงของท่าน ({{ sourceImages.length }})</h4>
            <div class="flex flex-wrap gap-3">
              <a
                v-for="img in sourceImages"
                :key="img.orderImageId"
                :href="img.imageUrl"
                target="_blank"
                class="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:scale-105 transition-transform"
              >
                <img :src="img.imageUrl" class="w-full h-full object-cover" />
              </a>
            </div>
          </div>
        </div>

        <!-- ==================== ส่วนที่ 2: Status Timeline ==================== -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h3 class="text-lg font-bold text-gray-800 mb-6">ลำดับขั้นตอนดำเนินงาน</h3>
          
          <!-- Stepper List -->
          <div class="relative pl-6 border-l-2 border-gray-100 space-y-8">
            <div
              v-for="(step, idx) in stepsList"
              :key="step.status"
              class="relative"
            >
              <!-- Indicator Icon -->
              <div
                class="absolute -left-10 top-0.5 w-8 h-8 rounded-full flex items-center justify-center border-4 text-xs font-extrabold shadow-sm transition-all duration-300"
                :class="
                  (idx < currentStepIndex || (order.orderStatus === 'completed' && idx === currentStepIndex))
                    ? 'bg-emerald-600 border-emerald-100 text-white'
                    : idx === currentStepIndex
                      ? 'bg-gray-900 border-gray-200 text-white animate-pulse'
                      : 'bg-white border-gray-200 text-gray-400'
                "
              >
                <svg v-if="idx < currentStepIndex || (order.orderStatus === 'completed' && idx === currentStepIndex)" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M5 13l4 4L19 7"/>
                </svg>
                <span v-else>{{ idx + 1 }}</span>
              </div>

              <!-- Step Content -->
              <div>
                <h4
                  class="font-bold text-sm sm:text-base transition-colors duration-200"
                  :class="idx <= currentStepIndex ? 'text-gray-800' : 'text-gray-400'"
                >
                  {{ step.label }}
                </h4>
                <p
                  class="text-xs mt-0.5 transition-colors duration-200"
                  :class="idx <= currentStepIndex ? 'text-gray-500' : 'text-gray-400'"
                >
                  {{ step.desc }}
                </p>
              </div>
            </div>
          </div>

          <!-- Detailed Activity Logs -->
          <div v-if="order.workflowLogs && order.workflowLogs.length > 0" class="mt-8 pt-6 border-t border-gray-100">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">📜 บันทึกกิจกรรมและประวัติการทำรายการ</h4>
            <div class="space-y-4">
              <div
                v-for="log in order.workflowLogs"
                :key="log.logId"
                class="flex items-start gap-3 text-xs bg-gray-50 rounded-xl p-3"
              >
                <div class="space-y-1">
                  <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span class="font-bold text-gray-700">อัปเดตสถานะ</span>
                    <span class="text-gray-400">จาก</span>
                    <span class="font-medium text-gray-500">{{ getStatusLabel(log.fromStatus as OrderStatus).split(" (")[0] }}</span>
                    <span class="text-gray-400">➔</span>
                    <span class="font-bold text-gray-900">{{ getStatusLabel(log.toStatus as OrderStatus).split(" (")[0] }}</span>
                  </div>
                  <p v-if="log.logNote" class="text-gray-600 font-medium bg-white px-2 py-1 rounded border border-gray-100 mt-1">{{ log.logNote }}</p>
                  <p class="text-[10px] text-gray-400">
                    โดย {{ log.userFirstName ? `${log.userFirstName} ${log.userLastName}` : 'ระบบอัตโนมัติ' }} 
                    ({{ log.userRole === 'admin' ? 'แอดมิน' : log.userRole === 'editor' ? 'ช่างแต่งภาพ' : 'ลูกค้า' }}) 
                    • เมื่อ {{ formatDate(log.changedAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== ส่วนที่ 2.5: Photo Selection (รอคัดเลือกภาพ) ==================== -->
        <div
          v-if="order.orderStatus === 'waiting_selection' && aiGeneratedImages.length > 0"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
        >
          <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
            <div>
              <h3 class="text-xl font-bold text-gray-900">คัดเลือกรูปภาพที่ชื่นชอบ</h3>
              <p class="text-sm text-gray-500 mt-1">
                คลิกเลือกรูปภาพที่คุณต้องการรับเป็นไฟล์จริง แพ็กเกจของคุณสามารถเลือกได้สูงสุด <strong class="text-gray-900">{{ order.packageImageCount }} ภาพ</strong>
              </p>
            </div>
            <div class="text-right flex flex-col items-end">
              <span class="text-sm text-gray-500 font-semibold mb-1">เลือกแล้ว</span>
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-black" :class="selectedFinalImageIds.length === order.packageImageCount ? 'text-green-600' : 'text-gray-900'">
                  {{ selectedFinalImageIds.length }}
                </span>
                <span class="text-lg text-gray-400 font-bold">/ {{ order.packageImageCount }}</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
            <div
              v-for="img in aiGeneratedImages"
              :key="img.orderImageId"
              @click="toggleImageSelection(img.orderImageId)"
              class="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-4 transition-all duration-200 group"
              :class="selectedFinalImageIds.includes(img.orderImageId) ? 'border-gray-900 shadow-md transform scale-[1.02]' : 'border-transparent hover:border-gray-300'"
            >
              <img :src="img.imageUrl" class="w-full h-full object-cover" />
              
              <!-- Selected Overlay -->
              <div
                v-if="selectedFinalImageIds.includes(img.orderImageId)"
                class="absolute inset-0 bg-black/20 flex items-center justify-center"
              >
                <div class="bg-gray-900 text-white rounded-full p-2 shadow-lg transform scale-110">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>

              <!-- Hover Zoom -->
              <div class="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                <span class="text-[10px] text-white/90 truncate">{{ img.aiEngine || 'AI Gen' }}</span>
                <a :href="img.imageUrl" target="_blank" @click.stop class="text-white bg-black/40 hover:bg-black/70 rounded p-1 backdrop-blur-sm">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                </a>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <p v-if="submitSelectionError" class="text-sm text-red-600 font-bold">⚠️ {{ submitSelectionError }}</p>
            <p v-else class="text-xs text-gray-400">
              *เมื่อกดยืนยันแล้ว จะไม่สามารถเปลี่ยนรูปได้ และระบบจะพาท่านไปยังขั้นตอนชำระเงินส่วนที่เหลือ
            </p>
            
            <button
              @click="submitPhotoSelection"
              :disabled="selectedFinalImageIds.length === 0 || submittingSelection"
              class="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <span v-if="submittingSelection" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              {{ submittingSelection ? "กำลังบันทึก..." : "ยืนยันการเลือกรูปภาพ" }}
            </button>
          </div>
        </div>

        <div
          v-if="order.orderStatus === 'waiting_deposit' || order.orderStatus === 'waiting_final_payment'"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
        >
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 border-b border-gray-50 pb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-800">แนบหลักฐานการชำระเงิน</h3>
              <p class="text-xs text-gray-500 mt-1">
                กรุณาโอนเงินเข้าบัญชีธนาคารของร้านเพื่อแจ้งชำระเงิน
              </p>
            </div>
            <div class="text-right">
              <span class="text-xs text-gray-400 block">ยอดที่ต้องชำระ ({{ paymentInfo.percentage }}%)</span>
              <span class="text-2xl font-black text-gray-900">฿{{ formatPrice(paymentInfo.amount) }}</span>
            </div>
          </div>

          <!-- Bank Account Info -->
          <div class="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div>
                <p class="text-sm font-bold text-gray-800">ธนาคารไทยพาณิชย์ (SCB)</p>
                <p class="text-xs text-gray-500">บจก. คูส สตูดิโอ (COOS Studio Co., Ltd.)</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-base font-black text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl tracking-wider select-all">123-4-56789-0</span>
            </div>
          </div>

          <!-- Upload Slip Area -->
          <div class="space-y-4">
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
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
              
              <div v-if="uploadedSlipUrl" class="flex flex-col items-center justify-center space-y-3">
                <img :src="uploadedSlipUrl" class="max-h-40 rounded-lg shadow-sm border" />
                <p class="text-xs text-green-600 font-bold">✓ อัปโหลดสลิปเรียบร้อย กด "ส่งหลักฐานชำระเงิน" ด้านล่าง</p>
                <p class="text-[10px] text-gray-400 underline">คลิกหรือลากสลิปใหม่มาวางที่นี่เพื่อเปลี่ยนไฟล์</p>
              </div>
              <div v-else class="flex flex-col items-center justify-center space-y-2">
                <p class="text-sm font-semibold text-gray-700 mt-2">ลากรูปภาพสลิปมาวาง หรือคลิกเพื่ออัปโหลด</p>
                <p class="text-xs text-gray-400">รองรับไฟล์สลิปรูปภาพ JPG, PNG (สูงสุด 10MB)</p>
              </div>
            </div>

            <!-- Upload progress/error indicators -->
            <div v-if="uploadingSlip" class="flex items-center justify-center gap-2 text-sm text-gray-900 font-medium">
              <div class="animate-spin w-4 h-4 border-2 border-slate-200 border-t-gray-900 rounded-full"></div>
              กำลังประมวลผลรูปภาพสลิป...
            </div>
            <p v-if="uploadError" class="text-xs text-red-600 font-bold text-center">⚠️ {{ uploadError }}</p>

            <!-- Submit Slip Action -->
            <div class="flex justify-end pt-2">
              <button
                @click="submitSlip"
                :disabled="!uploadedSlipUrl || submittingPayment"
                class="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition text-sm flex items-center gap-2"
              >
                <span v-if="submittingPayment" class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                {{ submittingPayment ? "กำลังส่ง..." : "ส่งหลักฐานชำระเงิน" }}
              </button>
            </div>
            <p v-if="submitPaymentError" class="text-xs text-red-600 font-bold text-right">⚠️ {{ submitPaymentError }}</p>
          </div>
        </div>

        <!-- Previous Payments History -->
        <div v-if="order.payments && order.payments.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h3 class="text-lg font-bold text-gray-800 mb-4">ประวัติการแจ้งชำระเงิน</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr class="border-b border-gray-100 text-gray-400 font-semibold uppercase">
                  <th class="pb-3 pr-4">ประเภท</th>
                  <th class="pb-3 pr-4">จำนวนเงิน</th>
                  <th class="pb-3 pr-4">รูปภาพสลิป</th>
                  <th class="pb-3 pr-4">วันที่แจ้งชำระ</th>
                  <th class="pb-3 text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr v-for="pay in order.payments" :key="pay.paymentId" class="text-gray-700">
                  <td class="py-4 pr-4 font-bold">
                    {{ pay.paymentType === 'deposit' ? 'เงินมัดจำ (30%)' : 'เงินส่วนที่เหลือ (70%)' }}
                  </td>
                  <td class="py-4 pr-4 font-bold text-gray-900">
                    ฿{{ formatPrice(pay.paymentAmount) }}
                  </td>
                  <td class="py-4 pr-4">
                    <a :href="pay.paymentSlipUrl" target="_blank" class="inline-flex items-center gap-1 text-xs text-gray-900 hover:underline font-bold">
                      เปิดดูสลิป
                    </a>
                  </td>
                  <td class="py-4 pr-4 text-gray-500 font-medium">
                    {{ formatDate(pay.paymentCreatedAt) }}
                  </td>
                  <td class="py-4 text-right">
                    <span
                      class="px-2.5 py-1 rounded-full text-xs font-bold border"
                      :class="getPaymentStatusBadgeClass(pay.paymentStatus)"
                    >
                      {{ getPaymentStatusLabel(pay.paymentStatus) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ==================== ส่วนที่ 4: ดาวน์โหลดภาพปลายทาง ==================== -->
        <div
          v-if="order.orderStatus === 'completed' || order.orderStatus === 'delivered'"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8"
        >
          <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-800">ดาวน์โหลดผลงานสุดท้าย</h3>
              <p class="text-xs text-gray-500 mt-1">
                คลิกที่รูปภาพเพื่อดาวน์โหลดผลงานไฟล์ขนาดใหญ่หรือภาพที่เสร็จสิ้นสมบูรณ์แล้ว
              </p>
            </div>
            <span class="text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-lg font-bold">
              ✓ เปิดให้ดาวน์โหลดแล้ว
            </span>
          </div>

          <div v-if="finalImages.length === 0" class="text-center py-8 bg-gray-50 rounded-2xl border border-dashed text-gray-500 text-sm">
            กำลังจัดเตรียมภาพสำหรับส่งมอบ กรุณารอแอดมินหรือช่างแต่งภาพอัปโหลดรูปภาพ
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div
              v-for="img in finalImages"
              :key="img.orderImageId"
              class="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col hover:shadow transition-shadow group"
            >
              <!-- Thumbnail preview -->
              <div class="relative aspect-[4/3] bg-gray-200 overflow-hidden">
                <img :src="img.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span class="absolute top-2 left-2 bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  {{ img.imageType === 'selected_final' ? 'FINAL IMAGE' : 'AI GENERATED' }}
                </span>
              </div>
              <!-- Meta parameters info (AI Prompt etc if exists) -->
              <div class="p-4 flex-1 flex flex-col justify-between">
                <div class="space-y-2 mb-4 text-xs">
                  <div v-if="img.aiEngine">
                    <span class="text-gray-400 font-semibold">Engine:</span>
                    <span class="ml-1 text-gray-700 font-bold">{{ img.aiEngine }}</span>
                  </div>
                  <div v-if="img.positivePrompt">
                    <span class="text-gray-400 font-semibold block">Prompt:</span>
                    <p class="text-gray-600 line-clamp-2 bg-white p-1.5 rounded border border-gray-100 mt-0.5 font-mono select-all">{{ img.positivePrompt }}</p>
                  </div>
                </div>
                <a
                  :href="img.imageUrl"
                  target="_blank"
                  download
                  class="w-full inline-flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  ดาวน์โหลดรูปภาพ
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
</template>
