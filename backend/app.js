import express from 'express'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRouter.js'
import adminRoutes from './routes/adminRouter.js'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDb from './utils/mongoDB.js'
dotenv.config({})
connectDb()

const app = express()



app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(cookieParser())


// CORS
app.use(cors({
  origin: 'https://clg-img.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Handle preflight for ALL routes
app.options('*', cors())  // ← THIS IS THE MISSING PIECE

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

app.get('/check', (req, res) => {
  console.log('TEST API HIT! 🚀');
  res.json({ message: 'Backend woke up! Ready to rock!' });
});


app.use('/api/v1', userRoutes)
app.use("/api/v1/admin", adminRoutes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0',()=>{
    console.log(`server is running on http://localhost:${PORT}`);
    
})
