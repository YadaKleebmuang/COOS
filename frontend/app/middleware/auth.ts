import { jwtDecode } from "jwt-decode";

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie("token");
  
  if (!token.value) {
    return navigateTo(`/login?redirect=${to.fullPath}`);
  }

  try {
    const decoded = jwtDecode<{ exp: number }>(token.value as string);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      // Token is expired
      token.value = null; // Clear the cookie
      return navigateTo(`/login?redirect=${to.fullPath}`);
    }
  } catch (err) {
    // Invalid token
    token.value = null;
    return navigateTo(`/login?redirect=${to.fullPath}`);
  }
});
