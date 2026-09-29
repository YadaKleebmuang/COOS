<template>
  <div class="coos-page relative min-h-screen overflow-x-hidden bg-[#F7F7F5] text-[#171717]">
    <!-- Progressive Top Blur Layer -->
    <Teleport to="body">
      <div class="fixed left-0 right-0 top-0 z-[90] h-[100px] pointer-events-none progressive-blur-layer sm:h-[120px] lg:h-[140px]" />
    </Teleport>

    <div class="pointer-events-none fixed inset-0 -z-10">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(255,255,255,0.98),transparent_34%),radial-gradient(circle_at_88%_22%,rgba(255,255,255,0.85),transparent_28%)]" />
      <div class="absolute left-[-10%] top-[-14%] h-[28rem] w-[28rem] rounded-full bg-[#EDF3FF]/70 blur-[72px]" />
      <div class="absolute right-[-8%] top-16 h-[28rem] w-[28rem] rounded-full bg-[#F0EEFF]/65 blur-[78px]" />
      <div class="absolute bottom-[-16%] left-[30%] h-[26rem] w-[32rem] rounded-full bg-white/80 blur-[82px]" />
    </div>

    <div class="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
      <LayoutNavbarCustomer />
      <main class="flex-grow py-6 sm:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ========================================================
   PROGRESSIVE TOP BLUR
   ======================================================== */
.progressive-blur-layer {
  backdrop-filter: blur(22px) saturate(1.08);
  -webkit-backdrop-filter: blur(22px) saturate(1.08);
  background: rgba(250, 249, 247, 0.12);
  mask-image: linear-gradient(
    to bottom,
    #000 0%,
    rgba(0,0,0,0.98) 18%,
    rgba(0,0,0,0.78) 45%,
    rgba(0,0,0,0.38) 72%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0%,
    rgba(0,0,0,0.98) 18%,
    rgba(0,0,0,0.78) 45%,
    rgba(0,0,0,0.38) 72%,
    transparent 100%
  );
}

.progressive-blur-layer::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(250, 249, 247, 0.22), rgba(250, 249, 247, 0.06) 55%, transparent);
  pointer-events: none;
}
</style>
