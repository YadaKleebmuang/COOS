export interface User {
  userId: number;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userPhone?: string | null;
  userRole: "admin" | "editor" | "customer";
  userCreatedAt?: string;
  userUpdatedAt?: string;
}
