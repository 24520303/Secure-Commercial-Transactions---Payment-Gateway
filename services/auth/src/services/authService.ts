import { prisma } from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthSchemaType } from '../schemas/authSchema';

const JWT_SECRET = process.env.JWT_SECRET || 'PhuongThanhDo_BiThuat_2026';

export const registerUser = async (data: AuthSchemaType) => {
  // Kiểm tra email trùng lặp
  const existedUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existedUser) {
    throw new Error('Email đã tồn tại!');
  }

  // Mã hóa mật khẩu bảo mật
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Lưu vào database
  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      hashedPassword: hashedPassword
    },
    select: {
      id: true
    }
  });

  return newUser.id;
};

export const loginUser = async (data: AuthSchemaType) => {
  // Tìm user theo email
  const user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user) {
    throw new Error('Email hoặc mật khẩu không chính xác!');
  }

  // Khớp password
  const isMatch = await bcrypt.compare(data.password, user.hashedPassword);
  if (!isMatch) {
    throw new Error('Email hoặc mật khẩu không chính xác!');
  }

  // Ký sinh JWT token hợp lệ trong 1 ngày
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return token;
};