import express from 'express'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRouter.js'
import adminRoutes from './routes/adminRouter.js'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDb from './utils/mongoDB.js'

dotenv.config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(cors({
  origin: 'https://clg-img.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.options('*', cors())

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`)
  next()
})

app.get('/check', (req, res) => {
  res.json({ message: 'Backend woke up! Ready to rock!' })
})

app.use('/api/v1', userRoutes)
app.use('/api/v1/admin', adminRoutes)

const PORT = process.env.PORT || 8000

const startServer = async () => {
  try {
    await connectDb()
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()