import { useApi } from "~/composables/useApi";

interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  token?: string;
  user?: any;
}

export const authService = {
  async register(form: RegisterForm) {
    const { apiFetch } = useApi();

    return await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        userEmail: form.email,
        userPassword: form.password,
        userFirstName: form.firstName,
        userLastName: form.lastName,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },

  async login(email: string, password: string) {
    const { apiFetch } = useApi();

    const data = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        userEmail: email,
        userPassword: password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (data?.token) {
      const token = useCookie<string | null>("token", {
        sameSite: "lax",
      });
      token.value = data.token;
    }

    return data;
  },

  async logout() {
    // ไม่เรียก backend
    const token = useCookie<string | null>("token");
    token.value = null;
  },
};
