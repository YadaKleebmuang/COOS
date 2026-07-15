export default defineNuxtRouteMiddleware(async () => {
  const userRole = useCookie("userRole");

  // Basic UI-level check first
  if (userRole.value !== "admin") {
    return navigateTo("/");
  }

  // Double check with backend API to prevent UI bypass via cookie manipulation
  try {
    const { apiFetch } = useApi();
    const user = await apiFetch("/users/me");
    
    if (user.userRole !== "admin") {
      userRole.value = null; // Clear invalid cookie
      return navigateTo("/");
    }
  } catch (err) {
    // API failed, token expired, or unauthorized
    userRole.value = null;
    return navigateTo("/");
  }
});
