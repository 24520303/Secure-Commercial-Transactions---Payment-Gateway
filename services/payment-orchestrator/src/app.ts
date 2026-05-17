import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()

import paymentRoute from './routes/paymentRoute'
import stripeWebhookRoute from './routes/stripeWebhookRoute'

const app = express();

app.use(cors())

app.use('/api/stripe-webhook', stripeWebhookRoute)

app.use(express.json());

app.use('/api/payment/', paymentRoute)

app.get('/', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

const PORT = 8083;
app.listen(PORT, () => {
  console.log(`Service Payment-orchestrator đang chạy trên cổng ${PORT}`)
})