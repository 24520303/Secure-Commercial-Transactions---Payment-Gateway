import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()

import healRoute from './routes/health.routes'
import keyRoute from './routes/keys.route'
import signingRoute from './routes/signing.route'
import cryptoRoute from './routes/crypto.route'
import { initPkcs11 } from './services/pkcs11/pkcs11.service'

const app = express();

app.use(cors())

app.use(express.json())

app.use('/health', healRoute)
app.use('/keys', keyRoute)
app.use('/sign', signingRoute)
app.use('/crypto', cryptoRoute)

const PORT = 8084
async function start() {
    try {
        console.log("🔄 Đang khởi tạo kết nối tới SoftHSM...");
    
        // Gọi hàm initPkcs11 tại đây và đợi nó hoàn thành
        await initPkcs11();
        console.log("✅ Cấu hình SoftHSM sẵn sàng.");

        app.listen(PORT, () => {
            console.log(`🚀 KMS Server đang chạy an toàn tại cổng ${PORT}`);
        });
        
    } catch (error) {
        console.error(error)
    }
}

start()