import type { RegisterForm, AuthResponse } from "../types/auth.types";


export const useAuth = () => {
  const { apiFetch } = useApi();
  
  const tokenCookie = useCookie<string | null>("token", {
    sameSite: "lax",
    secure: process.env.NODE_ENV === 'production',
  });
  const userRoleCookie = useCookie<string | null>("userRole", {
    sameSite: "lax",
    secure: process.env.NODE_ENV === 'production',
  });

  // register
  const register = async (form: RegisterForm) => {
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
  };

  // login
  const login = async (email: string, password: string) => {
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
      tokenCookie.value = data.token;
      userRoleCookie.value = data.user?.userRole || "customer";
    }

    return data;
  };

  // logout
  const logout = async () => {
    tokenCookie.value = null;
    userRoleCookie.value = null;
  };

  // forgot password
  const forgotPassword = async (email: string) => {
    return await apiFetch<{ message: string; resetToken: string; expiresAt: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ userEmail: email }),
      headers: { "Content-Type": "application/json" },
    });
  };

  // reset password
  const resetPassword = async (token: string, newPassword: string) => {
    return await apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
      headers: { "Content-Type": "application/json" },
    });
  };

  return {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword
  };
};
