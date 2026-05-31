import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'
import https from 'https';
import fs from 'fs';
import tls from 'tls';

// Định nghĩa cấu hình phân quyền (Role-Based Access Control cho Service)
const SERVICE_POLICIES: Record<string, string[]> = {
  'payment-orchestrator-service': ['kms:sign', 'kms:verify'],
};

interface AuthenticatedRequest extends Request {
  serviceName?: string;
}

export const authorize = (requiredPermission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // 1. Lấy thông tin chứng chỉ khách hàng (Client Certificate) từ mTLS
    const socket = req.socket as tls.TLSSocket;
    const clientCert = socket.getPeerCertificate();

    if (!clientCert || !socket.authorized) {
      res.status(401).json({ error: 'Xác thực mTLS thất bại. Yêu cầu chứng chỉ hợp lệ.' });
      return;
    }

    // 2. Trích xuất Tên dịch vụ (Common Name - CN) từ chứng chỉ
    const serviceName = clientCert.subject.CN; 
    req.serviceName = String(serviceName);

    // 3. Kiểm tra xem dịch vụ này có quyền thực hiện hành động này không
    const permissions = SERVICE_POLICIES[String(serviceName)];
    if (!permissions || !permissions.includes(requiredPermission)) {
       res.status(403).json({ error: `Dịch vụ ${serviceName} không có quyền: ${requiredPermission}` });
       return;
    }

    next();
  };
};