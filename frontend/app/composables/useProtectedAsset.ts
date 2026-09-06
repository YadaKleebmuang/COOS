import { onBeforeUnmount, reactive } from 'vue'
import { ApiError } from '~/composables/useApi'

export const useProtectedAsset = () => {
  const config = useRuntimeConfig()
  const tokenCookie = useCookie<string | null>('token')
  const objectUrls = reactive(new Map<string, string>())
  const loadingEndpoints = reactive(new Set<string>())
  const endpointErrors = reactive(new Map<string, string>())
  const pendingRequests = new Map<string, Promise<string>>()
  const requestVersions = new Map<string, number>()
  const transientUrls = new Set<string>()

  const publicApiBase = String(config.public.apiBase).replace(/\/$/, '')
  const mediaUrl = (path: string) => `${publicApiBase}${path.startsWith('/') ? path : `/${path}`}`
  const publicGalleryUrl = (imageId: number | string) => mediaUrl(`/media/gallery/${imageId}`)

  const fetchProtectedBlob = async (endpoint: string) => {
    const token = tokenCookie.value
    if (!token) throw new ApiError(401, 'Unauthorized')

    let response: Response
    try {
      response = await fetch(mediaUrl(endpoint), {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {
      throw new ApiError(0, 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้')
    }

    if (!response.ok) {
      throw new ApiError(response.status, 'ไม่สามารถโหลดไฟล์ได้')
    }
    return response.blob()
  }

  const revokeEndpoint = (endpoint: string) => {
    const objectUrl = objectUrls.get(endpoint)
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    objectUrls.delete(endpoint)
    endpointErrors.delete(endpoint)
    requestVersions.set(endpoint, (requestVersions.get(endpoint) || 0) + 1)
  }

  const loadProtectedAsset = async (endpoint: string, force = false) => {
    if (!import.meta.client) return ''
    if (!force && objectUrls.has(endpoint)) return objectUrls.get(endpoint) || ''
    if (!force && pendingRequests.has(endpoint)) return pendingRequests.get(endpoint) as Promise<string>

    const version = (requestVersions.get(endpoint) || 0) + 1
    requestVersions.set(endpoint, version)
    loadingEndpoints.add(endpoint)
    endpointErrors.delete(endpoint)

    const request = fetchProtectedBlob(endpoint)
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob)
        if (requestVersions.get(endpoint) !== version) {
          URL.revokeObjectURL(objectUrl)
          return ''
        }

        const previousUrl = objectUrls.get(endpoint)
        if (previousUrl) URL.revokeObjectURL(previousUrl)
        objectUrls.set(endpoint, objectUrl)
        return objectUrl
      })
      .catch((error: unknown) => {
        if (requestVersions.get(endpoint) === version) {
          endpointErrors.set(endpoint, error instanceof Error ? error.message : 'ไม่สามารถโหลดไฟล์ได้')
        }
        return ''
      })
      .finally(() => {
        if (requestVersions.get(endpoint) === version) loadingEndpoints.delete(endpoint)
        if (pendingRequests.get(endpoint) === request) pendingRequests.delete(endpoint)
      })

    pendingRequests.set(endpoint, request)
    return request
  }

  const syncProtectedAssets = async (endpoints: string[]) => {
    if (!import.meta.client) return
    const expected = new Set(endpoints)
    for (const endpoint of objectUrls.keys()) {
      if (!expected.has(endpoint)) revokeEndpoint(endpoint)
    }
    await Promise.all([...expected].map(endpoint => loadProtectedAsset(endpoint)))
  }

  const refreshProtectedAsset = async (endpoint: string) => loadProtectedAsset(endpoint, true)
  const protectedAssetUrl = (endpoint: string) => objectUrls.get(endpoint) || ''
  const isProtectedAssetLoading = (endpoint: string) => loadingEndpoints.has(endpoint)

  const downloadProtectedAsset = async (endpoint: string, filename: string) => {
    const blob = await fetchProtectedBlob(endpoint)
    const objectUrl = URL.createObjectURL(blob)
    transientUrls.add(objectUrl)
    try {
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
    } finally {
      URL.revokeObjectURL(objectUrl)
      transientUrls.delete(objectUrl)
    }
    return blob.type
  }

  const openProtectedAsset = async (endpoint: string) => {
    const previewWindow = window.open('', '_blank')
    try {
      const blob = await fetchProtectedBlob(endpoint)
      const objectUrl = URL.createObjectURL(blob)
      transientUrls.add(objectUrl)
      if (previewWindow) previewWindow.location.href = objectUrl
      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl)
        transientUrls.delete(objectUrl)
      }, 60_000)
    } catch (error) {
      previewWindow?.close()
      throw error
    }
  }

  onBeforeUnmount(() => {
    for (const endpoint of [...objectUrls.keys()]) revokeEndpoint(endpoint)
    for (const objectUrl of transientUrls) URL.revokeObjectURL(objectUrl)
    transientUrls.clear()
  })

  return {
    publicGalleryUrl,
    fetchProtectedBlob,
    loadProtectedAsset,
    syncProtectedAssets,
    refreshProtectedAsset,
    protectedAssetUrl,
    isProtectedAssetLoading,
    endpointErrors,
    downloadProtectedAsset,
    openProtectedAsset
  }
}
