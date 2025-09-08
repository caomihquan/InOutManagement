import { z } from 'zod'

export const userSchema = z.object({
  userName: z.string().min(3, "Tối thiểu 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Tối thiểu 6 ký tự"),
  isActive: z.boolean().optional()
})
export type UserFormType = z.infer<typeof userSchema>

export const areaSchema = z.object({
  name: z.string().min(1, "Tên bắt buộc"),
  type: z.enum(['Building','Floor','Room']).optional().default('Room'),
  parentId: z.string().nullable().optional()
})
export type AreaFormType = z.infer<typeof areaSchema>

export const deviceSchema = z.object({
  name: z.string().min(1, "Tên thiết bị bắt buộc"),
  type: z.enum(['Door','Barrier','RFIDReader','Camera']).optional().default('Door'),
  areaId: z.string().uuid("Phải chọn 1 Area")
})
export type DeviceFormType = z.infer<typeof deviceSchema>
