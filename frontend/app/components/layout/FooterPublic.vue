<template>
  <footer class="bg-white border-t border-gray-100 py-8 mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
      <div class="flex items-center gap-2">
        <span class="font-bold text-gray-900 tracking-tight">COOS STUDIO</span>
        <span>© 2026. All rights reserved.</span>
      </div>
      <div class="flex items-center gap-4">
        <NuxtLink to="/policy?tab=terms" class="hover:text-gray-900 transition">เงื่อนไขการใช้บริการ</NuxtLink>
        <NuxtLink to="/policy?tab=privacy" class="hover:text-gray-900 transition">นโยบายความเป็นส่วนตัว</NuxtLink>
      </div>
    </div>
  </footer>
</template>
