import { useApi } from "~/composables/useApi"
import type {
  WorkType,
  Package,
  OrderFormPayload,
  OrderCreateResponse,
} from "~/app/types/order.types"

export const orderService = {
  /**
   * ดึงประเภทงานทั้งหมดที่เปิดใช้งาน
   */

  // getWorkTypes() → GET /work-types
  async getWorkTypes(): Promise<WorkType[]> {
    const { apiFetch } = useApi()
    return await apiFetch<WorkType[]>("/work-types")
  },

  /**
   * ดึงแพ็กเกจทั้งหมดที่เปิดใช้งาน
   */
  // getPackages() → GET /packages
  async getPackages(): Promise<Package[]> {
    const { apiFetch } = useApi()
    return await apiFetch<Package[]>("/packages")
  },

  /**
   * สร้างคำสั่งงานใหม่
   */
  // createOrder(payload) → POST /orders
  async createOrder(payload: OrderFormPayload): Promise<OrderCreateResponse> {
    const { apiFetch } = useApi()
    return await apiFetch<OrderCreateResponse>("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  },
}
