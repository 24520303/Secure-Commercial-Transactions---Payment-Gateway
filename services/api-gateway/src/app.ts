import express, { Response, NextFunction } from 'express';
import proxy from 'express-http-proxy';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'PhuongThanhDo_BiThuat_2026';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth:8081';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order:8082';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-orchestrator:8083';

// Middleware xác thực JWT tập trung tại Gateway
const validateAuth = (req: any, res: Response, next: NextFunction): any => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Không tìm thấy token xác thực. Truy cập bị từ chối!' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.headers['x-user-id'] = decoded.id; // Đính kèm userId giải mã được vào header nội bộ
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};

// 1. Tuyến public (Auth): Chuyển tiếp thẳng không cần check token
app.use('/api/auth', proxy(AUTH_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/api/auth${req.url}`
}));

// 2. Tuyến bảo mật (Order): Kiểm tra token trước khi chuyển tiếp kèm header x-user-id
app.use('/api/orders', validateAuth, proxy(ORDER_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/api/orders${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id'] = srcReq.headers['x-user-id'];
    return proxyReqOpts;
  }
}));

// 3. Tuyến bảo mật (Payment): Kiểm tra token tương tự
app.use('/api/payment', validateAuth, proxy(PAYMENT_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/api/payment${req.url}`,
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers['x-user-id'] = srcReq.headers['x-user-id'];
    return proxyReqOpts;
  }
}));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`=== API GATEWAY đang chạy trên cổng ${PORT} ===`);
});