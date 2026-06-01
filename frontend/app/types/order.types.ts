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
