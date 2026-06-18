<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
      <!-- Back to Home Button -->
      <NuxtLink to="/" class="flex items-center gap-2 mb-6 group">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span class="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">COOS STUDIO</span>
      </NuxtLink>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <slot />
    </div>
  </div>
</template>
