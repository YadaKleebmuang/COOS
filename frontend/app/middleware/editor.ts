export default defineNuxtRouteMiddleware(() => {
  const userRole = useCookie("userRole");

  if (userRole.value !== "editor") {
    return navigateTo("/");
  }
});
