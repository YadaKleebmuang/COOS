<script setup lang="ts">
import type { WorkType, Package } from "~/types/order.types"

const props = defineProps<{
  form: {
    orderStyle: string
    orderColorTone: string
    orderComposition: string
    orderNote: string
    orderRequiredDate: string
    orderIsUrgent: boolean
    orderIsGalleryAllowed: boolean
  }
  selectedWorkType: WorkType | undefined
  selectedPackage: Package | undefined
  pricePreview: { base: number; urgent: number; discount: number; total: number }
  modelValue: boolean // acceptedDisclaimer
  submitError: string
}>()

const emit = defineEmits<{
  (e: "update:modelValue", val: boolean): void
}>()

const formatPrice = (n: number) =>
  Number(n).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
</script>

<template>
  <div class="p-6 sm:p-8">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-1">ตรวจสอบ & ยืนยัน</h2>
      <p class="text-gray-500 text-sm">กรุณาตรวจสอบข้อมูลก่อนกดยืนยัน</p>
    </div>

    <div class="space-y-4">
      <!-- Work Type -->
      <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ประเภทงาน</p>
        <p class="font-bold text-gray-900 text-lg">{{ selectedWorkType?.workTypeName }}</p>
      </div>

      <!-- Package -->
      <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">แพ็กเกจ</p>
        <p class="font-bold text-gray-900 text-lg">{{ selectedPackage?.packageName }}</p>
        <div class="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
          <span class="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 font-medium">{{ selectedPackage?.packageImageCount }} ภาพ</span>
          <span class="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 font-medium">{{ selectedPackage?.packageResolution }}</span>
          <span class="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 font-medium">{{ selectedPackage?.packageDeliveryDays }} วัน</span>
        </div>
      </div>

      <!-- Details -->
      <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">รายละเอียดงาน</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-sm">
          <div v-if="form.orderStyle">
            <span class="text-gray-500">สไตล์:</span>
            <span class="ml-1 font-medium text-gray-900">{{ form.orderStyle }}</span>
          </div>
          <div v-if="form.orderColorTone">
            <span class="text-gray-500">โทนสี:</span>
            <span class="ml-1 font-medium text-gray-900">{{ form.orderColorTone }}</span>
          </div>
          <div class="sm:col-span-2" v-if="form.orderComposition">
            <span class="text-gray-500">องค์ประกอบฉาก:</span>
            <span class="ml-1 font-medium text-gray-900">{{ form.orderComposition }}</span>
          </div>
          <div class="sm:col-span-2" v-if="form.orderNote">
            <span class="text-gray-500">หมายเหตุ:</span>
            <span class="ml-1 font-medium text-gray-900">{{ form.orderNote }}</span>
          </div>
          <div>
            <span class="text-gray-500">วันรับงาน:</span>
            <span class="ml-1 font-medium text-gray-900">{{ form.orderRequiredDate }}</span>
          </div>
          <div v-if="form.orderIsUrgent" class="sm:col-span-2">
            <span class="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md text-xs font-semibold">เร่งด่วน</span>
          </div>
          <div v-if="form.orderIsGalleryAllowed" class="sm:col-span-2">
            <span class="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold">อนุญาตโชว์ Gallery</span>
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
      <div class="bg-slate-50 rounded-2xl p-5 border border-slate-100">
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">สรุปราคา</p>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">ราคาแพ็กเกจ ({{ selectedPackage?.packageName }})</span>
            <span class="font-medium text-gray-900">฿{{ formatPrice(pricePreview.base) }}</span>
          </div>
          <div v-if="pricePreview.urgent > 0" class="flex justify-between text-orange-600">
            <span>ค่าเร่งด่วน</span>
            <span class="font-medium">+฿{{ formatPrice(pricePreview.urgent) }}</span>
          </div>
          <div v-if="pricePreview.discount > 0" class="flex justify-between text-green-600">
            <span>ส่วนลด Gallery ({{ selectedPackage?.packageGalleryDiscount }}%)</span>
            <span class="font-medium">-฿{{ formatPrice(pricePreview.discount) }}</span>
          </div>
          <hr class="border-gray-200 my-2" />
          <div class="flex justify-between text-lg font-bold text-gray-900">
            <span>รวมทั้งหมด</span>
            <span>฿{{ formatPrice(pricePreview.total) }}</span>
          </div>
        </div>
        <p class="text-xs text-gray-400 mt-2">* ราคาสุทธิจะถูกคำนวณอีกครั้งโดยระบบเมื่อยืนยัน</p>
      </div>

      <!-- Privacy Policy & AI Disclaimer -->
      <div class="space-y-4 border-t border-slate-100 pt-6">
        <h3 class="font-bold text-gray-900 text-sm">ข้อตกลงและเงื่อนไขการใช้บริการ</h3>
        
        <!-- Privacy Card -->
        <div class="bg-white border border-slate-100 rounded-xl p-4 text-xs text-gray-600 leading-relaxed text-left shadow-sm">
          <p class="font-bold text-gray-900 mb-1">นโยบายความเป็นส่วนตัว (Privacy Policy)</p>
          <p>รูปภาพต้นฉบับที่ท่านอัปโหลดเข้าระบบ จะถูกนำไปใช้เพื่อการประมวลผลและการตกแต่งภาพตามสั่งเท่านั้น ทางเราจะเก็บรักษาไฟล์ของท่านไว้เป็นความลับ และลบออกจากฐานข้อมูลภายใน 30 วันหลังจากออเดอร์เสร็จสิ้น</p>
        </div>

        <!-- AI Disclaimer Card -->
        <div class="bg-white border border-slate-100 rounded-xl p-4 text-xs text-gray-600 leading-relaxed text-left shadow-sm">
          <p class="font-bold text-gray-900 mb-1">ข้อจำกัดความรับผิดชอบและลิขสิทธิ์ AI (AI Disclaimer)</p>
          <p>ผลงานภาพชิ้นนี้มีการใช้เทคโนโลยีปัญญาประดิษฐ์ (AI) ในกระบวนการสร้างสรรค์ร่วมกับงานฝีมือของศิลปิน ลิขสิทธิ์ของภาพผลงานขั้นสุดท้ายจะถูกโอนย้ายให้เป็นของท่าน แต่ทางระบบขอสงวนสิทธิ์การนำผลงานไปโชว์ใน Portfolio/Gallery หากท่านได้เลือกรับส่วนลด</p>
        </div>

        <!-- Disclaimer Checkbox -->
        <label class="flex items-start gap-2.5 cursor-pointer mt-2 text-left">
          <input
            type="checkbox"
            :checked="modelValue"
            @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
            class="w-4 h-4 rounded text-gray-900 border-gray-300 focus:ring-gray-900 mt-0.5 cursor-pointer transition"
          />
          <span class="text-xs font-medium text-gray-700 select-none">
            ข้าพเจ้าได้อ่าน เข้าใจ และยอมรับนโยบายความเป็นส่วนตัวและข้อตกลงเกี่ยวกับผลงาน AI เรียบร้อยแล้ว
          </span>
        </label>
      </div>

      <!-- Submit Error -->
      <div v-if="submitError" class="bg-red-50 border border-red-100 rounded-xl p-4">
        <p class="text-red-600 text-sm font-medium">{{ submitError }}</p>
      </div>
    </div>
  </div>
</template>
