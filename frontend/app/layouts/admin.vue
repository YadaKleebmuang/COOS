<template>
  <div class="flex min-h-screen bg-slate-50">
    <LayoutSidebarDashboard role="admin" />
    <div class="flex-grow flex flex-col min-w-0">
      <LayoutNavbarDashboard />
      <main class="flex-grow p-8 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
