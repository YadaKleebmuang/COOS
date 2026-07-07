import { useApi } from "~/composables/useApi"
import type {
  WorkType,
  Package,
  OrderFormPayload,
  OrderCreateResponse,
  OrderSummary,
  OrderDetail,
  OrderStatus,
} from "~/types/order.types"

export const orderService = {
  /**
   * ดึงประเภทงาน
   * @param all - ถ้าเป็น true จะดึงทั้งหมดรวมที่ปิดใช้งานด้วย (เฉพาะ admin)
   */
  async getWorkTypes(all: boolean = false): Promise<WorkType[]> {
    const { apiFetch } = useApi()
    const url = all ? "/work-types?all=true" : "/work-types"
    return await apiFetch<WorkType[]>(url)
  },

  /**
   * ดึงแพ็กเกจทั้งหมดที่เปิดใช้งาน
   */
  async getPackages(): Promise<Package[]> {
    const { apiFetch } = useApi()
    return await apiFetch<Package[]>("/packages")
  },

  /**
   * สร้างคำสั่งงานใหม่
   */
  async createOrder(payload: OrderFormPayload): Promise<OrderCreateResponse> {
    const { apiFetch } = useApi()
    return await apiFetch<OrderCreateResponse>("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  },

  /**
   * ดึงรายการออเดอร์ของตนเอง
   */
  async getMyOrders(): Promise<OrderSummary[]> {
    const { apiFetch } = useApi()
    return await apiFetch<OrderSummary[]>("/orders")
  },

  /**
   * ดึงรายละเอียดออเดอร์ตาม ID
   */
  async getOrderById(id: string | number): Promise<OrderDetail> {
    const { apiFetch } = useApi()
    return await apiFetch<OrderDetail>(`/orders/${id}`)
  },

  /**
   * อัปโหลดรูปภาพต้นฉบับ/รูปอ้างอิงหลายรูปพร้อมกัน
   */
  async uploadSourceImages(files: File[]): Promise<string[]> {
    const { apiFetch } = useApi()
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("images", file)
    })
    const res = await apiFetch<{ files: { url: string }[] }>("/upload/source/multiple", {
      method: "POST",
      body: formData,
    })
    return res.files.map((f) => f.url)
  },

  /**
   * อัปโหลดไฟล์สลิปชำระเงินเดี่ยว
   */
  async uploadSlip(file: File): Promise<string> {
    const { apiFetch } = useApi()
    const formData = new FormData()
    formData.append("image", file)
    const res = await apiFetch<{ url: string }>("/upload/slip", {
      method: "POST",
      body: formData,
    })
    return res.url
  },

  /**
   * ส่งหลักฐานการชำระเงิน (มัดจำ หรือ ส่วนที่เหลือ)
   */
  async submitPaymentSlip(
    orderId: number,
    paymentType: "deposit" | "final",
    paymentAmount: number,
    paymentSlipUrl: string
  ): Promise<any> {
    const { apiFetch } = useApi()
    return await apiFetch(`/orders/${orderId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentType, paymentAmount, paymentSlipUrl }),
    })
  },

  /**
   * อัปเดตสถานะออเดอร์ (เช่น ยกเลิกออเดอร์)
   */
  async updateOrderStatus(
    orderId: number,
    orderStatus: OrderStatus,
    logNote?: string
  ): Promise<any> {
    const { apiFetch } = useApi()
    return await apiFetch(`/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus, logNote }),
    })
  },

  /**
   * อัปโหลดรูปภาพเดี่ยวโดยใช้ช่องทางแกลเลอรี (สำหรับ Editor อัปโหลดรูปที่แต่งเสร็จแล้ว)
   */
  async uploadGeneratedImageFile(file: File): Promise<string> {
    const { apiFetch } = useApi()
    const formData = new FormData()
    formData.append("image", file)
    const res = await apiFetch<{ url: string }>("/upload/gallery", {
      method: "POST",
      body: formData,
    })
    return res.url
  },

  /**
   * แนบรูปภาพที่สร้างขึ้นหรือรูปภาพสุดท้ายเข้ากับออเดอร์ พร้อมระบุ AI Parameters
   */
  async addOrderImage(
    orderId: number,
    payload: {
      imageType: "ai_generated" | "selected_final" | "source";
      imageUrl: string;
      imageThumbnailUrl?: string;
      aiEngine?: string;
      positivePrompt?: string;
      negativePrompt?: string;
      cfgScale?: number;
      steps?: number;
      seed?: number;
    }
  ): Promise<any> {
    const { apiFetch } = useApi()
    return await apiFetch(`/orders/${orderId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  }
}

