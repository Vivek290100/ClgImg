import express from 'express'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRouter.js'
import adminRoutes from './routes/adminRouter.js'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDb from './utils/mongoDB.js'
dotenv.config({})

const app = express()



app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(cookieParser())
const corsOptions = {
    origin: ['http://localhost:5173','https://img-one-lime.vercel.app/'],
    credentials: true,
}

app.use(cors(corsOptions))

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

app.get('/api/v1/test', (req, res) => {
  console.log('TEST API HIT! 🚀');
  res.json({ message: 'Backend woke up! Ready to rock!' });
});


app.use('/api/v1', userRoutes)
app.use("/api/v1/admin", adminRoutes);


const PORT = process.env.PORT;
app.listen(PORT, ()=>{
    connectDb()
    console.log(`server is running on http://localhost:${PORT}`);
    
})


// backend = 3000 || 8000
// backend = 4000