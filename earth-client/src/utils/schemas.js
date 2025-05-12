import { z } from 'zod'

export const projectSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Project name is required' })
    .max(50, { message: 'Project name must be 50 characters or less' }),
  description: z
    .string()
    .min(1, { message: 'Project description is required' })
    .max(200, { message: 'Project description must be 200 characters or less' })
    .optional(),
  latitude: z
    .number()
    .min(-90, { message: 'Latitude must be between -90 and 90' })
    .max(90, { message: 'Latitude must be between -90 and 90' }),
  longitude: z
    .number()
    .min(-180, { message: 'Longitude must be between -180 and 180' })
    .max(180, { message: 'Longitude must be between -180 and 180' }),
})

export const loginSchema = z.object({
  username: z
    .string()
    .email({ message: 'Invalid email address' })
    .min(1, { message: 'Username is required' })
    .max(50, { message: 'Username must be 50 characters or less' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .max(50, { message: 'Password must be 50 characters or less' }),
})
