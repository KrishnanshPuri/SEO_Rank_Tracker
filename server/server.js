import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import rankRouter from './routes/rankRoutes.js';
const app = express();

connectDB()

app.use(cors({
    origin: 'http://localhost:5173', // Replace with your exact React frontend URL!
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true 
}));
app.use(express.json());

app.get('/',(req,res)=>{
   res.send('Server is Alive')
})

app.use('/api/auth',authRouter)

app.use('/api/rank',rankRouter);


const PORT = process.env.PORT || 4000 

app.listen(PORT,()=>{console.log(`Server is running on port ${PORT}`)});


