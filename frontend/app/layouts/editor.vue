<template>
  <div class="flex min-h-screen bg-slate-50">
    <LayoutSidebarDashboard role="editor" />
    <div class="flex-grow flex flex-col min-w-0">
      <LayoutNavbarStaff role="editor" />
      <main class="flex-grow p-8 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
