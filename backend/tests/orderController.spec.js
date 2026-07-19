const { isValidTransition, create } = require('../src/controllers/orderController');
const PackageModel = require('../src/models/packageModel');
const OrderModel = require('../src/models/orderModel');

// Mock Models
jest.mock('../src/models/packageModel');
jest.mock('../src/models/orderModel');

describe('Order Controller - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidTransition()', () => {
    it('should allow admin to change status (except from cancelled/completed)', () => {
      expect(isValidTransition('waiting_deposit', 'in_progress', 'admin')).toBe(true);
      expect(isValidTransition('waiting_selection', 'delivered', 'admin')).toBe(true);
      expect(isValidTransition('cancelled', 'waiting_deposit', 'admin')).toBe(false);
      expect(isValidTransition('completed', 'waiting_deposit', 'admin')).toBe(false);
    });

    it('should allow customer to cancel before deposit or pay final', () => {
      expect(isValidTransition('waiting_deposit', 'cancelled', 'customer')).toBe(true);
      expect(isValidTransition('waiting_selection', 'waiting_final_payment', 'customer')).toBe(true);
      expect(isValidTransition('in_progress', 'cancelled', 'customer')).toBe(false); // Customer can't cancel if in progress
    });

    it('should allow editor to progress workflow', () => {
      expect(isValidTransition('waiting_to_start', 'in_progress', 'editor')).toBe(true);
      expect(isValidTransition('in_progress', 'waiting_selection', 'editor')).toBe(true);
      expect(isValidTransition('delivered', 'completed', 'editor')).toBe(true);
      expect(isValidTransition('waiting_deposit', 'in_progress', 'editor')).toBe(false);
    });
  });

  describe('create() - Price Calculation', () => {
    it('should calculate base, urgent, and discount correctly (Not Urgent, No Gallery)', async () => {
      const req = {
        session: { userId: 1, userRole: 'customer' },
        body: {
          packageId: 1,
          workTypeId: 1,
          orderRequiredDate: '2026-12-31',
          orderIsUrgent: false,
          orderIsGalleryAllowed: false
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // Mock DB Return
      PackageModel.findById.mockResolvedValue([
        [
          {
            packageId: 1,
            packageIsActive: 1,
            packagePrice: 1000,
            packageUrgentPrice: 500,
            packageGalleryDiscount: 20
          }
        ]
      ]);
      OrderModel.create.mockResolvedValue(99);

      await create(req, res, next);

      expect(PackageModel.findById).toHaveBeenCalledWith(1);
      expect(OrderModel.create).toHaveBeenCalled();
      
      const responseData = res.json.mock.calls[0][0];
      expect(res.status).toHaveBeenCalledWith(201);
      expect(responseData.orderBasePrice).toBe(1000);
      expect(responseData.orderUrgentPrice).toBe(0);
      expect(responseData.orderDiscount).toBe(0);
      expect(responseData.orderTotalPrice).toBe(1000);
    });

    it('should calculate base, urgent, and discount correctly (Urgent + Gallery Discount)', async () => {
      const req = {
        session: { userId: 1, userRole: 'customer' },
        body: {
          packageId: 2,
          workTypeId: 1,
          orderRequiredDate: '2026-12-31',
          orderIsUrgent: true,
          orderIsGalleryAllowed: true
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      // Mock DB Return
      PackageModel.findById.mockResolvedValue([
        [
          {
            packageId: 2,
            packageIsActive: 1,
            packagePrice: 2000,
            packageUrgentPrice: 1000,
            packageGalleryDiscount: 15 // 15% discount
          }
        ]
      ]);
      OrderModel.create.mockResolvedValue(100);

      await create(req, res, next);

      const responseData = res.json.mock.calls[0][0];
      expect(res.status).toHaveBeenCalledWith(201);
      expect(responseData.orderBasePrice).toBe(2000);
      expect(responseData.orderUrgentPrice).toBe(1000);
      // Discount should be 15% of base price (2000) = 300
      expect(responseData.orderDiscount).toBe(300);
      // Total = 2000 + 1000 - 300 = 2700
      expect(responseData.orderTotalPrice).toBe(2700);
    });

    it('should return 400 if required fields are missing', async () => {
      const req = {
        session: { userId: 1, userRole: 'customer' },
        body: {}
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "กรุณาระบุ packageId, workTypeId และ orderRequiredDate" });
    });

    it('should return 404 if package not found', async () => {
      const req = {
        session: { userId: 1, userRole: 'customer' },
        body: {
          packageId: 999,
          workTypeId: 1,
          orderRequiredDate: '2026-12-31'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      PackageModel.findById.mockResolvedValue([[]]); // Empty result

      await create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "ไม่พบแพ็กเกจที่เลือก" });
    });
  });
});
