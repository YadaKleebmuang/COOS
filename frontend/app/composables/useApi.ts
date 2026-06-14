export function useApi() {
  const apiFetch = async <T = any>(
    url: string,
    option: RequestInit = {},
  ): Promise<T> => {
    const config = useRuntimeConfig();
    const options = { ...option };
    const headers = new Headers(option.headers || {});

    // get token from cookie
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (token) {
      headers.set("Authorization", "Bearer " + token);
    }

    // ✅ ต่อ baseURL backend ให้ถูก
    const response = await fetch(`${config.public.apiBase}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json() as Promise<T>;
  };

  return { apiFetch };
}

// how to use in page

// const { apiFetch } = useApi();

// const data = await apiFetch("/api/users");
// console.log(data);
