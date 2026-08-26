<template>
  <div class="coos-page flex min-h-screen flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
      <NuxtLink
        to="/"
        class="mb-7 flex flex-col items-center leading-none"
      >
        <span class="text-3xl font-black tracking-[0.28em] text-black">COOS</span>
        <span class="mt-1 text-[9px] font-bold tracking-[0.48em] text-black">STUDIO</span>
      </NuxtLink>
    </div>

    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <slot />
    </div>
  </div>
</template>
