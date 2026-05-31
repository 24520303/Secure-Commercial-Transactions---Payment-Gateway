import { Request, Response } from 'express';
import { authSchema } from '../schemas/authSchema';
import * as authService from '../services/authService';

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedData = authSchema.parse(req.body);
    const userId = await authService.registerUser(validatedData);

    return res.status(201).json({
      message: 'Đăng ký thành công!',
      userId
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Dữ liệu đầu vào không hợp lệ.',
        errors: error.errors
      });
    }
    return res.status(400).json({
      message: error.message || 'Lỗi hệ thống.'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedData = authSchema.parse(req.body);
    const token = await authService.loginUser(validatedData);

    return res.status(200).json({
      message: 'Đăng nhập thành công!',
      token
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        message: 'Dữ liệu đầu vào không hợp lệ.',
        errors: error.errors
      });
    }
    return res.status(400).json({
      message: error.message || 'Lỗi hệ thống.'
    });
  }
};