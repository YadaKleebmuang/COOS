<template>
  <footer class="bg-white border-t border-slate-100 py-8 mt-20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
      <div class="flex items-center gap-2">
        <span class="font-bold text-slate-600 tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">COOS STUDIO</span>
        <span>© 2026. All rights reserved.</span>
      </div>
      <div class="flex items-center gap-4">
        <NuxtLink to="/policy?tab=terms" class="hover:text-indigo-600 transition">เงื่อนไขการใช้บริการ</NuxtLink>
        <NuxtLink to="/policy?tab=privacy" class="hover:text-indigo-600 transition">นโยบายความเป็นส่วนตัว</NuxtLink>
      </div>
    </div>
  </footer>
</template>
