import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoute from './routers/authRoute';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Định tuyến đến tầng router
app.use('/api/auth', authRoute);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'Auth Service: UP', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Service Auth đang chạy trên cổng ${PORT}`);
});