import { useApi } from "~/composables/useApi";

import type { RegisterForm, AuthResponse } from "~/types/auth.types";


export const authService = {
  // register
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

  // login
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

      const userRole = useCookie<string | null>("userRole", {
        sameSite: "lax",
      });
      userRole.value = data.user?.userRole || "customer";
    }

    return data;
  },

  // logout
  async logout() {
    // ไม่เรียก backend
    const token = useCookie<string | null>("token");
    token.value = null;
    const userRole = useCookie<string | null>("userRole");
    userRole.value = null;
  },

  // forgot password
  async forgotPassword(email: string) {
    const { apiFetch } = useApi();

    return await apiFetch<{ message: string; resetToken: string; expiresAt: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ userEmail: email }),
      headers: { "Content-Type": "application/json" },
    });
  },

  // reset password
  async resetPassword(token: string, newPassword: string) {
    const { apiFetch } = useApi();

    return await apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
      headers: { "Content-Type": "application/json" },
    });
  },
};
