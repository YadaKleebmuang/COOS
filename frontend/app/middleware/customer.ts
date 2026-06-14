export default defineNuxtRouteMiddleware(() => {
  const userRole = useCookie("userRole");

  if (userRole.value !== "customer") {
    return navigateTo("/");
  }
});
