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

export const getSpiritualPlaceSchema = (isEdit) => z.object({
  placeName: z.string().min(3, 'Place name must be at least 3 characters').max(200, 'Place name cannot exceed 200 characters').regex(/^[A-Za-z\s]+$/, 'Place name must contain only letters and spaces'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  displayOrder: z.coerce.number().int().min(0, 'Display order must be a non-negative integer'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  image: isEdit
    ? z.any().optional()
        .refine(validateImageSize, 'Image size must be less than 10MB')
        .refine(validateImageType, 'Only JPG, PNG and WebP images are allowed')
    : z.any()
        .refine(files => files && files.length > 0, 'Place photo is required')
        .refine(validateImageSize, 'Image size must be less than 10MB')
        .refine(validateImageType, 'Only JPG, PNG and WebP images are allowed')
});

export const getHeritageHistorySchema = (isEdit) => z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  heading: z.string().min(1, 'Section heading is required'),
  videoUrl: z.string().optional().or(z.literal(''))
    .refine(val => !val || /^(https?:\/\/.*)?$/.test(val), 'Invalid URL format'),
  paragraph1: z.string().min(10, 'Paragraph 1 must be at least 10 characters').max(5000, 'Paragraph 1 cannot exceed 5000 characters'),
  paragraph2: z.string().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  backgroundImage: isEdit
    ? z.any().optional()
        .refine(validateImageSize, 'Image size must be less than 10MB')
        .refine(validateImageType, 'Only JPG, PNG and WebP images are allowed')
    : z.any()
        .refine(files => files && files.length > 0, 'Background image is required')
        .refine(validateImageSize, 'Image size must be less than 10MB')
        .refine(validateImageType, 'Only JPG, PNG and WebP images are allowed')
});

export const getKumbhHighlightSchema = (isEdit) => z.object({
  year: z.string().min(1, 'Year / Duration is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description cannot exceed 2000 characters'),
  videoUrl: z.string().optional().or(z.literal(''))
    .refine(val => !val || /^(https?:\/\/.*)?$/.test(val), 'Invalid URL format'),
  displayOrder: z.coerce.number().int().min(0, 'Display order must be a non-negative integer'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  thumbnailImage: isEdit
    ? z.any().optional()
        .refine(validateImageSize, 'Image size must be less than 10MB')
        .refine(validateImageType, 'Only JPG, PNG and WebP images are allowed')
    : z.any()
        .refine(files => files && files.length > 0, 'Thumbnail image is required')
        .refine(validateImageSize, 'Image size must be less than 10MB')
        .refine(validateImageType, 'Only JPG, PNG and WebP images are allowed')
});

export const getSaintDirectorySchema = (isEdit) => z.object({
  name: z.string()
    .min(2, 'Saint name must be at least 2 characters')
    .max(100, 'Saint name cannot exceed 100 characters')
    .regex(/^[A-Za-z\s]+$/, 'Saint name must contain only letters and spaces'),
  akhada: z.string().min(1, 'Akhada is required'),
  role: z.string().min(1, 'Role is required'),
  description: z.string().min(10, 'Biography must be at least 10 characters').max(2000, 'Biography cannot exceed 2000 characters'),
  displayOrder: z.coerce.number().int().min(0, 'Display order must be a non-negative integer'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  image: isEdit
    ? z.any().optional()
        .refine(validateImageSize, 'Image size must be less than 10MB')
        .refine(validateImageType, 'Only JPG, PNG and WebP images are allowed')
    : z.any()
        .refine(files => files && files.length > 0, 'Saint photo is required')
        .refine(validateImageSize, 'Image size must be less than 10MB')
        .refine(validateImageType, 'Only JPG, PNG and WebP images are allowed')
});
