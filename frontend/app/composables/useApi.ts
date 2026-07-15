/**
 * ApiError — Custom error class ที่มี HTTP status code
 * ใช้แทน Error ธรรมดาเพื่อให้หน้าต่างๆ แยกประเภท error ได้
 *
 * ตัวอย่าง:
 *   if (err instanceof ApiError && err.statusCode === 401) { navigateTo('/login') }
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

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

    // [Fix] Catch network-level errors (เซิร์ฟเวอร์ down, CORS, DNS fail)
    let response: Response;
    try {
      response = await fetch(`${baseUrl}${url}`, {
        ...options,
        headers,
      });
    } catch {
      throw new ApiError(0, "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ");
    }

    if (!response.ok) {
      // [Fix] HTTP/2 มักส่ง statusText เป็น "" — ใช้ fallback ที่ชัดเจนกว่า
      let errorMessage = response.statusText || `เกิดข้อผิดพลาด (HTTP ${response.status})`;
      try {
        const errorBody = await response.json();
        // รองรับทั้ง { message } และ { error } ที่ backend อาจส่งมา
        errorMessage = errorBody?.message || errorBody?.error || errorMessage;
      } catch {
        // Response ไม่ใช่ JSON — ใช้ fallback message
      }
      // [Fix] throw ApiError แทน Error เพื่อให้ caller รู้ statusCode
      throw new ApiError(response.status, errorMessage);
    }

    // [Fix] Handle 204 No Content (response.json() จะ throw ถ้า body ว่าง)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  };

  return { apiFetch };
}

// how to use in page

// const { apiFetch } = useApi();
// const data = await apiFetch<MyType>("/api/users");

// how to catch errors with status code:
// try {
//   await apiFetch(...)
// } catch (err) {
//   if (err instanceof ApiError) {
//     if (err.statusCode === 401) navigateTo('/login')
//     if (err.statusCode === 403) showError('ไม่มีสิทธิ์เข้าถึง')
//     if (err.statusCode === 404) showError('ไม่พบข้อมูล')
//   }
// }
