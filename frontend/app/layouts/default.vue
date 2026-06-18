<template>
  <div class="flex flex-col min-h-screen bg-slate-50">
    <LayoutNavbarPublic />
    <main class="flex-grow">
      <slot />
    </main>
    <LayoutFooterPublic />
  </div>
</template>
