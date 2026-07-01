export function useApi() {
  const apiFetch = async <T = any>(
    url: string,
    option: RequestInit = {},
  ): Promise<T> => {
    const config = useRuntimeConfig();
    const options = { ...option };
    const headers = new Headers(option.headers || {});

    // ใช้ useCookie แทน document.cookie เพื่อรองรับ SSR (Nuxt 3)
    const tokenCookie = useCookie<string | null>("token");
    const token = tokenCookie.value;

    if (token) {
      headers.set("Authorization", "Bearer " + token);
    }

    // ต่อ baseURL backend: ใช้ internal URL สำหรับ SSR (server→server), public URL สำหรับ browser
    const baseUrl = import.meta.server
      ? (process.env.NUXT_INTERNAL_API_BASE || config.public.apiBase)
      : config.public.apiBase;

    const response = await fetch(`${baseUrl}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody?.message || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  };

  return { apiFetch };
}

// how to use in page

// const { apiFetch } = useApi();

// const data = await apiFetch("/api/users");
// console.log(data);
