"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
// Định nghĩa cấu hình phân quyền (Role-Based Access Control cho Service)
const SERVICE_POLICIES = {
    'payment-orchestrator-service': ['kms:sign', 'kms:verify'],
};
const authorize = (requiredPermission) => {
    return (req, res, next) => {
        // 1. Lấy thông tin chứng chỉ khách hàng (Client Certificate) từ mTLS
        const socket = req.socket;
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
exports.authorize = authorize;
