<template>
  <div class="coos-page flex min-h-screen flex-col">
    <LayoutNavbarPublic />
    <main class="flex-grow">
      <slot />
    </main>
    <LayoutFooterPublic />
  </div>
</template>
