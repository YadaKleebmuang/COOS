<template>
  <footer class="px-4 pb-6 pt-10 sm:px-6 lg:px-8">
    <div class="coos-panel mx-auto grid max-w-7xl gap-8 p-7 text-sm text-neutral-500 md:grid-cols-[1.3fr_1fr_1fr] md:p-9">
      <div>
        <NuxtLink
          to="/"
          class="inline-flex flex-col leading-none text-black"
        >
          <span class="text-2xl font-black tracking-[0.24em]">COOS</span>
          <span class="mt-1 text-[8px] font-bold tracking-[0.48em]">STUDIO</span>
        </NuxtLink>
        <p class="mt-4 max-w-xs leading-relaxed">
          สตูดิโอรับสร้างสรรค์และออกแบบคุณภาพสูง ตอบโจทย์ทุกความต้องการ
        </p>
      </div>
      <div>
        <h3 class="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-neutral-950">
          เมนู
        </h3>
        <div class="grid gap-2">
          <NuxtLink
            to="/"
            class="hover:text-black transition"
          >หน้าแรก</NuxtLink>
          <NuxtLink
            to="/gallery"
            class="hover:text-black transition"
          >ผลงาน</NuxtLink>
          <NuxtLink
            to="/#packages"
            class="hover:text-black transition"
          >บริการ</NuxtLink>
          <NuxtLink
            to="/#how-it-works"
            class="hover:text-black transition"
          >ขั้นตอนการสั่งงาน</NuxtLink>
        </div>
      </div>
      <div>
        <h3 class="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-neutral-950">
          ช่วยเหลือ
        </h3>
        <div class="grid gap-2">
          <NuxtLink
            to="/policy?tab=terms"
            class="hover:text-black transition"
          >เงื่อนไขการใช้บริการ</NuxtLink>
          <NuxtLink
            to="/policy?tab=privacy"
            class="hover:text-black transition"
          >นโยบายความเป็นส่วนตัว</NuxtLink>
          <span class="pt-4 text-xs">© 2026 COOS STUDIO. All rights reserved.</span>
        </div>
      </div>
    </div>
  </footer>
</template>
