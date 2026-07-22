// ===== WorkType : ข้อมูลประเภทงาน =====
export interface WorkType {
  workTypeId: number
  workTypeName: string
  workTypeDescription: string | null
  workTypeIsActive: number
  workTypeCreatedAt: Date
  workTypeUpdatedAt: Date
}

// ===== Package : ข้อมูลแพ็กเกจ =====
export interface Package {
  packageId: number
  packageName: string
  packageDescription: string | null
  packageImageCount: number
  packageResolution: "FullHD" | "4K"
  packageDeliveryDays: number
  packagePrice: number
  packageUrgentPrice: number | null
  packageGalleryDiscount: number
  packageIsActive: number
  packageCreatedAt: Date
  packageUpdatedAt: Date
}

// ===== Order Form : ข้อมูลที่ส่งไป POST /orders (ส่งไป API) =====
export interface OrderFormPayload {
  packageId: number
  workTypeId: number
  orderStyle?: string
  orderColorTone?: string
  orderComposition?: string
  orderNote?: string
  orderRequiredDate: string // YYYY-MM-DD
  orderIsUrgent: boolean
  orderIsGalleryAllowed: boolean
  sourceImageUrls?: string[]
}

// ===== API Response จาก POST /orders : ข้อมูลที่ได้กลับจาก API =====
export interface OrderCreateResponse {
  message: string
  orderId: number
  orderBasePrice: number
  orderUrgentPrice: number
  orderDiscount: number
  orderTotalPrice: number
  orderStatus: string
}

// ===== OrderStatus : สถานะทั้งหมดในระบบ =====
export type OrderStatus =
  | "waiting_deposit"
  | "waiting_assignment"
  | "waiting_to_start"
  | "in_progress"
  | "waiting_selection"
  | "waiting_final_payment"
  | "delivered"
  | "completed"
  | "cancelled";

// ===== OrderImage : รูปภาพในออเดอร์ =====
export interface OrderImage {
  orderImageId: number
  orderId: number
  imageType: "source" | "ai_generated" | "selected_final"
  imageUrl: string
  imageThumbnailUrl: string | null
  aiEngine?: string | null
  positivePrompt?: string | null
  negativePrompt?: string | null
  cfgScale?: number | null
  steps?: number | null
  seed?: string | null
  imageCreatedAt?: string
}

// ===== Payment : ข้อมูลหลักฐานการชำระเงิน =====
export interface Payment {
  paymentId: number
  orderId: number
  paymentType: "deposit" | "final"
  paymentAmount: number
  paymentSlipUrl: string
  paymentStatus: "pending" | "approved" | "rejected"
  paymentCreatedAt: string
  paymentVerifiedAt: string | null
  verifiedByAdminId: number | null
  userFirstName?: string | null
  userLastName?: string | null
}

// ===== WorkflowLog : ประวัติการปรับเปลี่ยนสถานะ (Timeline) =====
export interface WorkflowLog {
  logId: number
  orderId: number
  fromStatus: string
  toStatus: string
  changedById: number | null
  changedAt: string
  logNote: string | null
  userFirstName?: string | null
  userLastName?: string | null
  userRole?: string | null
}

// ===== OrderSummary : ข้อมูลสรุปของออเดอร์ (สำหรับหน้า List) =====
export interface OrderSummary {
  orderId: number
  customerId: number
  editorId: number | null
  packageId: number
  packageName: string
  workTypeId: number
  workTypeName: string
  orderStatus: OrderStatus
  orderTotalPrice: number
  orderRequiredDate: string
  orderIsUrgent: number
  orderCreatedAt: string
}

// ===== OrderDetail : ข้อมูลเต็มของออเดอร์ (รวมรูป, ประวัติชำระเงิน, Timeline) =====
export interface OrderDetail extends OrderSummary {
  orderStyle: string | null
  orderColorTone: string | null
  orderComposition: string | null
  orderNote: string | null
  orderBasePrice: number
  orderUrgentPrice: number
  orderDiscount: number
  orderIsGalleryAllowed: number
  orderUpdatedAt: string
  packageResolution: "FullHD" | "4K"
  packageImageCount: number
  images: OrderImage[]
  payments: Payment[]
  workflowLogs: WorkflowLog[]
}

// ===== UploadResponse : ผลลัพธ์จากการอัปโหลดไฟล์ =====
export interface UploadResponse {
  message: string
  url: string
  filename: string
  originalname: string
  size: number
  mimetype: string
}
