<template>
  <div class="coos-page relative min-h-screen overflow-x-hidden bg-[#F7F7F5] text-[#171717]">
    <div class="pointer-events-none fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(255,255,255,0.98),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(255,255,255,0.85),transparent_28%)]" />
      <div class="absolute left-[-10%] top-[-14%] h-[28rem] w-[28rem] rounded-full bg-[#EDF3FF]/70 blur-[72px]" />
      <div class="absolute right-[-8%] top-16 h-[28rem] w-[28rem] rounded-full bg-[#F0EEFF]/65 blur-[78px]" />
      <div class="absolute bottom-[-16%] left-[30%] h-[26rem] w-[32rem] rounded-full bg-white/80 blur-[82px]" />
    </div>

    <div class="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
      <LayoutNavbarCustomer />
      <main class="flex-grow">
        <slot />
      </main>
    </div>
  </div>
</template>
