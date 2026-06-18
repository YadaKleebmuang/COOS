export default defineNuxtRouteMiddleware(() => {
  const userRole = useCookie("userRole");

  if (userRole.value !== "admin") {
    return navigateTo("/");
  }
});
