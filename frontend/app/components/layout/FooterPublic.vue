<template>
  <footer class="bg-[#102330] px-4 py-10 sm:px-5 lg:px-8">
    <div class="mx-auto grid max-w-[1280px] gap-8 px-3 py-5 text-sm text-[#bdcbd3] md:grid-cols-[1.3fr_1fr_1fr] md:px-9">
      <div>
        <NuxtLink
          to="/"
          class="inline-flex flex-col leading-none text-[#f5f0e7]"
        >
          <span class="text-2xl font-black tracking-[0.24em]">COOS</span>
          <span class="mt-1 text-[8px] font-bold tracking-[0.48em]">STUDIO</span>
        </NuxtLink>
        <p class="mt-4 max-w-xs leading-relaxed">
          สตูดิโอรับสร้างสรรค์และออกแบบคุณภาพสูง ตอบโจทย์ทุกความต้องการ
        </p>
      </div>
      <div>
        <h3 class="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#f5f0e7]">
          เมนู
        </h3>
        <div class="grid gap-2">
          <NuxtLink
            to="/"
            class="hover:text-[#ff955e] transition"
          >หน้าแรก</NuxtLink>
          <NuxtLink
            to="/gallery"
            class="hover:text-[#ff955e] transition"
          >ผลงาน</NuxtLink>
          <NuxtLink
            to="/#packages"
            class="hover:text-[#ff955e] transition"
          >แพ็กเกจ</NuxtLink>
          <NuxtLink
            to="/#how-it-works"
            class="hover:text-[#ff955e] transition"
          >ขั้นตอนการสั่งงาน</NuxtLink>
        </div>
      </div>
      <div>
        <h3 class="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#f5f0e7]">
          ช่วยเหลือ
        </h3>
        <div class="grid gap-2">
          <NuxtLink
            to="/policy?tab=terms"
            class="hover:text-[#ff955e] transition"
          >เงื่อนไขการใช้บริการ</NuxtLink>
          <NuxtLink
            to="/policy?tab=privacy"
            class="hover:text-[#ff955e] transition"
          >นโยบายความเป็นส่วนตัว</NuxtLink>
          <span class="pt-4 text-xs">© 2026 COOS STUDIO. All rights reserved.</span>
        </div>
      </div>
    </div>
  </footer>
</template>
