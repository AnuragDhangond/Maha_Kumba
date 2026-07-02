import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const validateImageSize = (files) => {
  if (!files || files.length === 0) return true;
  return files[0].size <= MAX_FILE_SIZE;
};

const validateImageType = (files) => {
  if (!files || files.length === 0) return true;
  return ACCEPTED_IMAGE_TYPES.includes(files[0].type);
};

export const getArtisanSchema = (isEdit) => z.object({
  artisanName: z.string().min(3, 'Artisan name must be at least 3 characters').max(100, 'Artisan name cannot exceed 100 characters'),
  craft: z.string().min(1, 'Craft type is required'),
  region: z.string().min(1, 'Region is required'),
  description: z.string().optional().or(z.literal(''))
    .refine(val => !val || val.length <= 2000, 'Biography cannot exceed 2000 characters'),
  isActive: z.coerce.boolean(),
  image: isEdit
    ? z.any().optional()
        .refine(validateImageSize, 'Image size must be less than 10MB')
        .refine(validateImageType, 'Only JPG, PNG and WebP images are allowed')
    : z.any()
        .refine(files => files && files.length > 0, 'Artisan photo is required')
        .refine(validateImageSize, 'Image size must be less than 10MB')
        .refine(validateImageType, 'Only JPG, PNG and WebP images are allowed')
});

export const getProductSchema = (isEdit) => z.object({
  productName: z.string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name cannot exceed 100 characters')
    .regex(/^[A-Za-z0-9\s\-\.\']+$/, 'Product name contains invalid characters'),
  category: z.string().min(1, 'Category is required'),
  description: z.string()
    .min(20, 'Description should be at least 20 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  tags: z.string().optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  discountedPrice: z.coerce.number().optional().refine(val => !val || val >= 0, 'Discounted price must be positive'),
  stockQuantity: z.coerce.number().int().min(1, 'Stock must be at least 1'),
  sellerName: z.string()
    .min(1, 'Name is required')
    .regex(/^[A-Za-z\s]+$/, 'Full Name should only contain letters and spaces'),
  sellerEmail: z.string().email('Invalid email address'),
  sellerPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian phone number'),
  whatsappNumber: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian phone number').optional().or(z.literal('')),
  pickupLocation: z.string().min(3, 'Landmark is required'),
  sellerCity: z.string().min(1, 'City is required'),
  sellerAddress: z.string().min(10, 'Full address is required'),
  deliveryAvailable: z.boolean().default(true),
  weight: z.coerce.number().optional(),
  dimensions: z.string().optional()
}).refine(data => !data.discountedPrice || data.discountedPrice < data.price, {
    message: "Discounted price must be less than original price",
    path: ["discountedPrice"]
});

export const getDeliveryTrackingSchema = () => z.object({
  currentStatus: z.enum(['Ordered', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'], {
    errorMap: () => ({ message: 'Current status is required' })
  }),
  currentLocation: z.string().min(3, 'Current location must be at least 3 characters').max(200, 'Current location cannot exceed 200 characters'),
  courierPartner: z.string().optional().or(z.literal('')),
  trackingNumber: z.string().optional().or(z.literal('')),
  expectedDeliveryDate: z.string().min(1, 'Expected delivery date is required').refine(val => {
    if (!val) return false;
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, 'Expected delivery date cannot be in the past'),
  latestUpdate: z.string().optional().or(z.literal(''))
});

export const userAddressSchema = z.object({
  name: z.string()
    .min(2, 'Full Name must be at least 2 characters')
    .max(100, 'Full Name cannot exceed 100 characters')
    .regex(/^[A-Za-z\s]+$/, 'Full Name should only contain letters and spaces'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[6-9]\d{9}$/, 'Invalid 10-digit Indian phone number'),
  pincode: z.string()
    .min(1, 'Pincode is required')
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  state: z.string().min(1, 'State name is required'),
  stateCode: z.string().min(1, 'State code is required'),
  city: z.string().min(1, 'City is required'),
  cityVillage: z.string().min(1, 'City/Village is required'),
  houseNo: z.string().min(1, 'House No / Building is required'),
  area: z.string().min(1, 'Street / Colony / Area is required'),
  landmark: z.string().optional().or(z.literal('')),
  addressType: z.enum(['Home', 'Work']).default('Home')
});
