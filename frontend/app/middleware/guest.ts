export default defineNuxtRouteMiddleware(() => {
  const token = useCookie("token");
  const userRole = useCookie("userRole");

  if (token.value) {
    if (userRole.value === "admin") {
      return navigateTo("/admin/dashboard");
    }
    if (userRole.value === "editor") {
      return navigateTo("/editor/dashboard");
    }
    return navigateTo("/customer/dashboard");
  }
});
