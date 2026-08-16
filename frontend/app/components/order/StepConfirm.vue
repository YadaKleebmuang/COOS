<script setup lang="ts">
import type { WorkType, Package } from '~/types/order.types'

defineProps<{
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
  sourceImages: string[]
  pricePreview: { base: number, urgent: number, discount: number, total: number }
  modelValue: boolean // acceptedDisclaimer
  submitError: string
}>()

defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const formatPrice = (n: number) =>
  Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="p-6 sm:p-8">
    <div class="mb-6">
      <h2 class="text-xl font-semibold leading-[1.4] text-[#171717]">
        ตรวจสอบ & ยืนยัน
      </h2>
      <p class="mt-1 text-sm leading-[1.6] text-[#666666]">
        กรุณาตรวจสอบข้อมูลก่อนกดยืนยัน
      </p>
    </div>

    <div class="space-y-4">
      <!-- Work Type -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p class="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-[#929292]">
            ประเภทงาน
          </p>
          <p class="text-base font-semibold leading-[1.45] text-[#171717]">
            {{ selectedWorkType?.workTypeName }}
          </p>
        </div>

        <!-- Package -->
        <div class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <p class="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-[#929292]">
            แพ็กเกจ
          </p>
          <p class="text-base font-semibold leading-[1.45] text-[#171717]">
            {{ selectedPackage?.packageName }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2 text-sm text-[#666666]">
            <span class="rounded-full border border-black/[0.06] bg-[#F3F3F1] px-3 py-1 font-medium">{{ selectedPackage?.packageImageCount }} ภาพ</span>
            <span class="rounded-full border border-black/[0.06] bg-[#F3F3F1] px-3 py-1 font-medium">{{ selectedPackage?.packageResolution }}</span>
            <span class="rounded-full border border-black/[0.06] bg-[#F3F3F1] px-3 py-1 font-medium">ส่งงานภายใน {{ selectedPackage?.packageDeliveryDays }} วัน</span>
          </div>
        </div>
      </div>

      <!-- Details -->
      <div class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <p class="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[#929292]">
          รายละเอียดงาน
        </p>
        <div class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div
            v-if="form.orderStyle"
            class="rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] p-4"
          >
            <span class="block text-xs text-[#666666]">สไตล์</span>
            <span class="mt-1 block font-semibold text-[#171717]">{{ form.orderStyle }}</span>
          </div>
          <div
            v-if="form.orderColorTone"
            class="rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] p-4"
          >
            <span class="block text-xs text-[#666666]">โทนสี</span>
            <span class="mt-1 block font-semibold text-[#171717]">{{ form.orderColorTone }}</span>
          </div>
          <div
            v-if="form.orderComposition"
            class="rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] p-4 sm:col-span-2"
          >
            <span class="block text-xs text-[#666666]">องค์ประกอบฉาก</span>
            <span class="mt-1 block whitespace-pre-line font-semibold leading-[1.6] text-[#171717]">{{ form.orderComposition }}</span>
          </div>
          <div
            v-if="form.orderNote"
            class="rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] p-4 sm:col-span-2"
          >
            <span class="block text-xs text-[#666666]">หมายเหตุ</span>
            <span class="mt-1 block whitespace-pre-line font-semibold leading-[1.6] text-[#171717]">{{ form.orderNote }}</span>
          </div>
          <div class="rounded-[16px] border border-black/[0.06] bg-[#F3F3F1] p-4">
            <span class="block text-xs text-[#666666]">วันรับงาน</span>
            <span class="mt-1 block font-semibold text-[#171717]">{{ formatDate(form.orderRequiredDate) }}</span>
          </div>
          <div
            v-if="form.orderIsUrgent"
            class="flex items-center rounded-[16px] border border-[#FFF7E6] bg-[#FFF7E6] p-4"
          >
            <span class="text-sm font-semibold text-[#9A6812]">เร่งด่วน</span>
          </div>
          <div
            v-if="form.orderIsGalleryAllowed"
            class="flex items-center rounded-[16px] border border-[#EDF8F1] bg-[#EDF8F1] p-4"
          >
            <span class="text-sm font-semibold text-[#267A48]">อนุญาตโชว์ Gallery</span>
          </div>
          <div
            v-if="!form.orderStyle && !form.orderColorTone && !form.orderComposition && !form.orderNote && !form.orderIsUrgent && !form.orderIsGalleryAllowed"
            class="rounded-[16px] border border-dashed border-black/[0.10] bg-[#F3F3F1] p-4 text-sm text-[#666666] sm:col-span-2"
          >
            ไม่ได้ระบุรายละเอียดเพิ่มเติม
          </div>
        </div>
      </div>

      <div class="rounded-[20px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div class="mb-4 flex items-center justify-between gap-4">
          <p class="text-xs font-medium uppercase tracking-[0.18em] text-[#929292]">
            รูปต้นฉบับ
          </p>
          <span class="text-xs text-[#666666]">{{ sourceImages.length }} รูป</span>
        </div>
        <div
          v-if="sourceImages.length > 0"
          class="grid gap-3"
          :class="sourceImages.length === 1 ? 'max-w-[220px] grid-cols-1' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6'"
        >
          <a
            v-for="(url, idx) in sourceImages"
            :key="url"
            :href="url"
            target="_blank"
            class="overflow-hidden rounded-[16px] border border-black/[0.06] bg-[#F3F3F1]"
            :class="sourceImages.length === 1 ? 'aspect-[4/3]' : 'aspect-square'"
          >
            <img
              :src="url"
              :alt="`รูปต้นฉบับหรือรูปอ้างอิง ${idx + 1}`"
              class="h-full w-full object-contain p-1"
            >
          </a>
        </div>
        <p
          v-else
          class="rounded-[16px] border border-dashed border-black/[0.10] bg-[#F3F3F1] p-4 text-sm text-[#666666]"
        >
          ไม่มีรูปต้นฉบับหรือรูปอ้างอิงแนบมากับคำสั่งงานนี้
        </p>
      </div>

      <!-- Pricing -->
      <div class="rounded-[20px] border border-black/[0.06] bg-[#F3F3F1] p-5">
        <p class="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[#929292]">
          สรุปราคา
        </p>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between gap-4">
            <span class="text-[#666666]">ราคาแพ็กเกจ ({{ selectedPackage?.packageName }})</span>
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
            <span>ส่วนลด Gallery ({{ selectedPackage?.packageGalleryDiscount }}%)</span>
            <span class="font-medium">-฿{{ formatPrice(pricePreview.discount) }}</span>
          </div>
          <hr class="my-2 border-black/[0.06]">
          <div class="flex justify-between gap-4 text-lg font-semibold text-[#171717]">
            <span>รวมทั้งหมด</span>
            <span>฿{{ formatPrice(pricePreview.total) }}</span>
          </div>
        </div>
        <p class="mt-2 text-xs text-[#666666]">
          * ราคาสุทธิจะถูกคำนวณอีกครั้งโดยระบบเมื่อยืนยัน
        </p>
      </div>

      <!-- Privacy Policy & AI Disclaimer -->
      <div class="space-y-4 border-t border-black/[0.06] pt-6">
        <h3 class="text-sm font-semibold text-[#171717]">
          ข้อตกลงและเงื่อนไขการใช้บริการ
        </h3>

        <!-- Privacy Card -->
        <div class="rounded-[16px] border border-black/[0.06] bg-white p-4 text-left text-xs leading-[1.6] text-[#666666]">
          <div class="max-w-[760px]">
            <p class="mb-1 font-semibold text-[#171717]">
              นโยบายความเป็นส่วนตัว (Privacy Policy)
            </p>
            <p>รูปภาพต้นฉบับที่ท่านอัปโหลดเข้าระบบ จะถูกนำไปใช้เพื่อการประมวลผลและการตกแต่งภาพตามสั่งเท่านั้น ทางเราจะเก็บรักษาไฟล์ของท่านไว้เป็นความลับ และลบออกจากฐานข้อมูลภายใน 30 วันหลังจากออเดอร์เสร็จสิ้น</p>
          </div>
        </div>

        <!-- AI Disclaimer Card -->
        <div class="rounded-[16px] border border-black/[0.06] bg-white p-4 text-left text-xs leading-[1.6] text-[#666666]">
          <div class="max-w-[760px]">
            <p class="mb-1 font-semibold text-[#171717]">
              ข้อจำกัดความรับผิดชอบและลิขสิทธิ์ AI (AI Disclaimer)
            </p>
            <p>ผลงานภาพชิ้นนี้มีการใช้เทคโนโลยีปัญญาประดิษฐ์ (AI) ในกระบวนการสร้างสรรค์ร่วมกับงานฝีมือของศิลปิน ลิขสิทธิ์ของภาพผลงานขั้นสุดท้ายจะถูกโอนย้ายให้เป็นของท่าน แต่ทางระบบขอสงวนสิทธิ์การนำผลงานไปโชว์ใน Portfolio/Gallery หากท่านได้เลือกรับส่วนลด</p>
          </div>
        </div>

        <!-- Disclaimer Checkbox -->
        <label class="mt-2 flex cursor-pointer items-start gap-2.5 text-left">
          <input
            type="checkbox"
            :checked="modelValue"
            class="mt-0.5 h-4 w-4 cursor-pointer rounded border-black/[0.10] text-[#171717] transition focus:ring-[#756CE8]/25"
            @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
          >
          <span class="select-none text-xs font-medium leading-[1.6] text-[#666666]">
            ข้าพเจ้าได้อ่าน เข้าใจ และยอมรับนโยบายความเป็นส่วนตัวและข้อตกลงเกี่ยวกับผลงาน AI เรียบร้อยแล้ว
          </span>
        </label>
      </div>

      <!-- Submit Error -->
      <div
        v-if="submitError"
        class="rounded-xl border border-[#FDEEEE] bg-[#FDEEEE] p-4"
      >
        <p class="text-sm font-medium text-[#B93B3B]">
          {{ submitError }}
        </p>
      </div>
    </div>
  </div>
</template>
