import { jwtDecode } from 'jwt-decode'

const loginRedirect = (fullPath: string) => {
  return {
    path: '/login',
    query: { redirect: fullPath }
  }
}

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('token')

  if (!token.value) {
    return navigateTo(loginRedirect(to.fullPath))
  }

  try {
    const decoded = jwtDecode<{ exp: number }>(token.value as string)
    const currentTime = Date.now() / 1000

    if (decoded.exp < currentTime) {
      // Token is expired
      token.value = null // Clear the cookie
      return navigateTo(loginRedirect(to.fullPath))
    }
  } catch {
    // Invalid token
    token.value = null
    return navigateTo(loginRedirect(to.fullPath))
  }
})
