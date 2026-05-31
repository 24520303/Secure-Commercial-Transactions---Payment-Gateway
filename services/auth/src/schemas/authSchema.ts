import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email({ message: "Email không đúng định dạng" }),
  password: z.string().min(6, { message: "Mật khẩu phải từ 6 ký tự trở lên" }),
});

export type AuthSchemaType = z.infer<typeof authSchema>;