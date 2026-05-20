import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()



const app = express();
app.use(express.json());

app.use(cors())







app.get('/', (req, res) => {
  res.status(200).json({ status: 'Order: UP', timestamp: new Date().toISOString() });
});

const PORT = 8082;
app.listen(PORT, () => {
  console.log(`Service Payment-orchestrator đang chạy trên cổng ${PORT}`)
})