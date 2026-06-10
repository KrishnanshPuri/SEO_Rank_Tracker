import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
const app = express();

connectDB()

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
   res.send('Server is Alive')
})

app.use('/api/auth',authRouter)



const PORT = process.env.PORT || 4000 

app.listen(PORT,()=>{console.log(`Server is running on port ${PORT}`)});


