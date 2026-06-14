# COOS Frontend Architecture Guide (Nuxt 3)

This document defines the **Feature-Based & Role-Based Architecture** guidelines for the COOS frontend client. It ensures that as the codebase grows, it remains modular, readable, secure, and easy to maintain by multiple developers.

---

## 1. Core Architecture Decisions

### Why Feature-Based + Role-Based?
1. **Clear Authorization Boundaries (Role-Based)**: By segregating routes under `pages/customer/`, `pages/editor/`, and `pages/admin/`, we can easily apply role-specific middleware at the folder level.
2. **Modular Components (Feature-Based)**: Storing components by feature (e.g. `components/editor/job/`) ensures developers can find everything related to a specific feature in one place, avoiding a massive, unorganized general components folder.
3. **Nuxt 3 Auto-Imports**: Nuxt 3 automatically registers nested components by prefixing directory names. For example, `components/editor/job/OverviewTab.vue` is automatically usable as `<EditorJobOverviewTab />`.

---

## 2. Directory Structure

Below is the directory map representing the architecture:

```text
frontend/
├── app/
│   ├── services/           # API Services (e.g., auth.service.ts, order.service.ts)
│   └── types/              # Type definitions (TypeScript Interfaces)
├── assets/                 # Global styles, fonts, and SVG icons
├── components/             # Reusable UI Components (Feature-Based)
│   ├── common/             # Global generic UI elements (Buttons, Modal, Inputs)
│   ├── layout/             # Header, Sidebar, Footer components for each layout
│   ├── auth/               # Forms and widgets for login, register, reset-password
│   ├── customer/           # Customer-specific features
│   │   └── order/          # e.g., OrderCard, OrderForm, PaymentUpload
│   ├── editor/             # Editor-specific features
│   │   └── job/            # e.g., JobHeader, JobTabs, OverviewTab, GeneratedImagesTab
│   └── admin/              # Admin-specific management features
│       ├── dashboard/      # Admin charts and metrics
│       ├── user/           # User list tables, edit modals
│       └── policy/         # Terms/Policies editors
├── composables/            # Global state and helpers (e.g., useApi.ts, useAuth.ts)
├── layouts/                # Nuxt Layouts
│   ├── default.vue         # Public pages layout (Landing, Gallery, Policies)
│   ├── auth.vue            # Authentication layout (Centered container)
│   ├── customer.vue        # Dashboard layout with Customer navbar/sidebar
│   ├── editor.vue          # Dashboard layout with Editor navbar/sidebar
│   └── admin.vue           # Dashboard layout with Admin sidebar and configuration tabs
├── middleware/             # Route Guards
│   ├── auth.ts             # Assures user is logged in
│   ├── guest.ts            # Assures user is logged out (redirects to home if logged in)
│   ├── customer.ts         # Restricts page access to Customers
│   ├── editor.ts           # Restricts page access to Editors
│   └── admin.ts            # Restricts page access to Admins
├── pages/                  # Nuxt File-System Routing (Role-Based)
│   ├── index.vue           # Public Landing Page / Portfolio Gallery
│   ├── login.vue           # Login Form (Layout: auth, Middleware: guest)
│   ├── register.vue        # Register Form (Layout: auth, Middleware: guest)
│   ├── forgot-password.vue # Forgot Password Form
│   ├── reset-password.vue  # Reset Password Form
│   │
│   ├── customer/           # Customer Namespace (Middleware: auth, customer)
│   │   ├── dashboard.vue   # Customer dashboard overview
│   │   ├── profile.vue     # Profile setting & Contact channels
│   │   └── orders/
│   │       ├── index.vue   # Order list / history
│   │       ├── create.vue  # Order creation form (moved from create-order.vue)
│   │       └── [id].vue    # Order details, status tracking, payment upload
│   │
│   ├── editor/             # Editor Namespace (Middleware: auth, editor)
│   │   ├── dashboard.vue   # List of assigned jobs
│   │   ├── profile.vue     # Profile and settings
│   │   └── jobs/
│   │       ├── index.vue   # Quick view lists
│   │       └── [id].vue    # Job details workspace (6 tabs: Overview, Sources, etc.)
│   │
│   └── admin/              # Admin Namespace (Middleware: auth, admin)
│       ├── dashboard.vue   # User & Sales metrics
│       ├── users/          # Manage users (Customers & Editors)
│       ├── orders/         # Monitor all orders, assign editors
│       ├── packages/       # Manage price packages
│       ├── work-types/     # Manage work types
│       ├── gallery/        # Manage public portfolio images
│       └── policies/       # Edit terms & conditions
├── stores/                 # State management (if needed, e.g. using Pinia)
└── utils/                  # Helper utilities (date formatters, validators)
```

---

## 3. Layouts & Layout State Flow

### Layout Routing & Page Meta
To assign layouts and middleware, use `definePageMeta` in pages:

```vue
<!-- pages/editor/jobs/[id].vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'editor',
  middleware: ['auth', 'editor']
})
</script>
```

### Layout Definitions:
- **`default.vue`**: Clean header and footer navigation with standard container spacing.
- **`auth.vue`**: Minimalist layout with background gradients, optimized to show card-based auth forms in the viewport center.
- **`customer.vue` / `editor.vue` / `admin.vue`**: Master-detail structure. A sidebar for navigation, a top navigation bar (for profile settings, notifications, logout), and a content canvas area for page elements.

---

## 4. Middleware Implementation Patterns

Nuxt 3 routes will check authorization by run-order defined in the page metadata array.

### 1. `auth.ts` (Core Auth Guard)
Verifies that the user has a valid access token. If not, redirect to `/login` with a redirect parameter.
```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie('token')
  if (!token.value) {
    return navigateTo(`/login?redirect=${to.fullPath}`)
  }
})
```

### 2. `guest.ts` (Guest Only Guard)
Prevents logged-in users from accessing login/register pages.
```typescript
// middleware/guest.ts
export default defineNuxtRouteMiddleware(() => {
  const token = useCookie('token')
  const userRole = useCookie('userRole') // e.g. stored on login
  
  if (token.value) {
    if (userRole.value === 'admin') return navigateTo('/admin/dashboard')
    if (userRole.value === 'editor') return navigateTo('/editor/dashboard')
    return navigateTo('/customer/dashboard')
  }
})
```

### 3. Role Guards (`customer.ts`, `editor.ts`, `admin.ts`)
Validates that the logged-in user matches the namespace role.
```typescript
// middleware/editor.ts
export default defineNuxtRouteMiddleware(() => {
  const userRole = useCookie('userRole')
  
  if (userRole.value !== 'editor') {
    return navigateTo('/') // Redirect unauthorized users to home
  }
})
```

---

## 5. Editor Job Detail Workspace Pattern

The page `pages/editor/jobs/[id].vue` serves as a core workspace with 6 tabs.

### State & URL Integration
For tabs, it is recommended to bind the active tab to the **URL Query Params** (e.g., `?tab=overview`). This allows editors to refresh the page or share links without losing their current tab context.

### Implementation Blueprint:
```vue
<!-- pages/editor/jobs/[id].vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

definePageMeta({
  layout: 'editor',
  middleware: ['auth', 'editor']
})

const route = useRoute()
const router = useRouter()
const jobId = route.params.id as string

// 1. Defined tab keys
const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'sources', label: 'Source Images' },
  { key: 'generated', label: 'Generated Images' },
  { key: 'selected', label: 'Selected Images' },
  { key: 'prompts', label: 'Prompt Logs' },
  { key: 'history', label: 'History' }
]

// 2. Compute active tab from query params, defaulting to 'overview'
const activeTab = computed({
  get: () => (route.query.tab as string) || 'overview',
  set: (val) => {
    router.replace({ query: { ...route.query, tab: val } })
  }
})
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- 1. Header Component -->
    <EditorJobHeader :job-id="jobId" />

    <!-- 2. Tabs Switcher -->
    <EditorJobTabs 
      :tabs="tabs" 
      v-model:active="activeTab" 
    />

    <!-- 3. Dynamic Tab Component Rendering -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <EditorJobOverviewTab v-if="activeTab === 'overview'" :job-id="jobId" />
      <EditorJobSourceImagesTab v-else-if="activeTab === 'sources'" :job-id="jobId" />
      <EditorJobGeneratedImagesTab v-else-if="activeTab === 'generated'" :job-id="jobId" />
      <EditorJobSelectedImagesTab v-else-if="activeTab === 'selected'" :job-id="jobId" />
      <EditorJobPromptLogsTab v-else-if="activeTab === 'prompts'" :job-id="jobId" />
      <EditorJobHistoryTab v-else-if="activeTab === 'history'" :job-id="jobId" />
    </div>
  </div>
</template>
```

---

## 6. Components Auto-Resolving Rules

To keep the naming patterns predictable:

| File Path | Nuxt Component Tag |
| :--- | :--- |
| `components/editor/job/JobHeader.vue` | `<EditorJobHeader />` |
| `components/editor/job/JobTabs.vue` | `<EditorJobTabs />` |
| `components/editor/job/OverviewTab.vue` | `<EditorJobOverviewTab />` |
| `components/customer/order/OrderCard.vue` | `<CustomerOrderCard />` |
| `components/common/AppButton.vue` | `<CommonAppButton />` or `<AppButton />` (if registered globally) |

---

## 7. Migration Next Steps

When we begin Phase 2 & 3 of the implementation plan, we will restructure pages step-by-step:
1. **Create directories**:
   - Create directories for `/layouts`, `/middleware`, `/pages/customer/`, `/pages/editor/`, `/pages/admin/` and components.
2. **Move current files**:
   - Move `pages/create-order.vue` to `pages/customer/orders/create.vue`.
3. **Implement layout and middleware base code**:
   - Create route-guards files in `/middleware`.
   - Setup layout templates in `/layouts`.
4. **Develop Editor workspace tab components** inside `/components/editor/job/`.
