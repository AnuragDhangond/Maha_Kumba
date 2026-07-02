import { z } from 'zod';

export const donationConfigSchema = z.object({
  upiId: z.string()
    .min(5, 'UPI ID must be at least 5 characters')
    .max(50, 'UPI ID cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9.-]+@[a-zA-Z0-9.-]+$/, 'Invalid UPI ID format (e.g., example@upi)'),
  merchantName: z.string()
    .min(2, 'Merchant name must be at least 2 characters')
    .max(100, 'Merchant name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Merchant name cannot contain numbers or special characters'),
  isActive: z.coerce.boolean(),
  minAmount: z.coerce.number()
    .min(1, 'Minimum donation amount must be at least 1')
});