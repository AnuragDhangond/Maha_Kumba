import { z } from 'zod';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const validateImageSize = (files) => {
if (!files || files.length === 0) return true;
// If files is a FileList or array
const file = files instanceof FileList ? files[0] : (Array.isArray(files) ? files[0] : files);
if (!file) return true;
return file.size <= MAX_FILE_SIZE;
};

const validateImageType = (files) => {
if (!files || files.length === 0) return true;
const file = files instanceof FileList ? files[0] : (Array.isArray(files) ? files[0] : files);
if (!file) return true;
return ACCEPTED_IMAGE_TYPES.includes(file.type);
};

export const helplineSchema = z.object({
name: z.string()
.min(2, 'Name must be at least 2 characters')
.max(100, 'Name cannot exceed 100 characters'),
number: z.string()
.min(1, 'Contact number is required')
.regex(/^[+0-9-]{3,15}$/, 'Invalid helpline number format (3-15 digits, +, - allowed)')
});

export const hospitalSchema = z.object({
  name: z.string()
    .min(3, 'Hospital name must be at least 3 characters')
    .max(150, 'Hospital name cannot exceed 150 characters')
    .regex(/^(?!\d+$)/, 'Hospital name cannot be only numbers')
    .regex(/^[a-zA-Z0-9\s.'-]+$/, 'Hospital name contains invalid characters'),
  address: z.string()
    .min(3, 'Address must be at least 3 characters')
    .max(255, 'Address cannot exceed 255 characters')
    .regex(/[a-zA-Z]/, 'Address must contain at least one letter')
    .regex(/^[a-zA-Z0-9\s.,\-/#&()]+$/, 'Address contains invalid characters'),
  latitude: z.coerce.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  contact: z.string()
    .min(3, 'Contact number must be at least 3 digits')
    .max(15, 'Contact number cannot exceed 15 digits')
    .regex(/^[0-9+]+$/, 'Invalid contact number. Only digits and + allowed'),
  beds: z.coerce.number()
    .int()
    .min(0, 'Beds count must be a non-negative integer'),
  status: z.enum(['Active', 'Full', 'Closed', 'INACTIVE'])
});

export const healthTipSchema = z.object({
category: z.string()
.min(2, 'Category must be at least 2 characters')
.max(50, 'Category cannot exceed 50 characters'),
tipText: z.string()
.min(5, 'Advisory text must be at least 5 characters')
.max(1000, 'Advisory text cannot exceed 1000 characters'),
image: z.any().optional()
.refine(validateImageSize, 'Image size must be less than 10MB')
.refine(validateImageType, 'Only JPG, PNG and WebP images are allowed')
});

export const safetyResourceSchema = z.object({
  name: z.string()
    .min(3, 'Resource name must be at least 3 characters')
    .max(150, 'Resource name cannot exceed 150 characters'),
  type: z.enum(['POLICE', 'FIRE', 'CAMP', 'CONTROL_ROOM']),
  address: z.string()
    .min(1, 'Address is required'),
  contact: z.string()
    .min(3, 'Contact number must be at least 3 digits')
    .max(15, 'Contact number cannot exceed 15 digits')
    .regex(/^[0-9+]+$/, 'Invalid contact number. Only digits and + allowed'),
  latitude: z.coerce.number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce.number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  status: z.enum(['Active', 'Inactive', 'Full'])
});
