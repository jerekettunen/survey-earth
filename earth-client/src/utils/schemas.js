import { z } from 'zod'

export const projectTypes = ['Research', 'Monitoring', 'Historical', 'Other']
export const userRoles = ['Viewer', 'Editor', 'Admin']

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
  type: z
    .enum(projectTypes, {
      errorMap: () => ({ message: 'Invalid project type' }),
    })
    .optional(),
  startDate: z
    .date()
    .refine((date) => date <= new Date(), {
      message: 'Start date must be in the past',
    })
    .optional(),
  endDate: z
    .date()
    .refine((date) => date >= new Date(), {
      message: 'End date must be in the future',
    })
    .optional(),
})

export const projectUpdateSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Project name is required' })
    .max(50, { message: 'Project name must be 50 characters or less' }),
  description: z
    .string()
    .min(1, { message: 'Project description is required' })
    .max(200, { message: 'Project description must be 200 characters or less' })
    .optional(),
  type: z
    .enum(projectTypes, {
      errorMap: () => ({ message: 'Invalid project type' }),
    })
    .optional(),
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

export const registerSchema = z
  .object({
    username: z
      .string()
      .email({ message: 'Invalid email address' })
      .min(1, { message: 'Username is required' })
      .max(50, { message: 'Username must be 50 characters or less' }),
    password: z
      .string()
      .max(50, { message: 'Password must be 50 characters or less' })
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/,
        {
          message: 'Invalid password',
        }
      ),
    confirmPassword: z
      .string()
      .min(1, { message: 'You need to confirm the password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const collaboratorSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  role: z.enum(userRoles, {
    required_error: 'Please select a role',
    invalid_type_error: 'Role must be one of the predefined types',
  }),
})
