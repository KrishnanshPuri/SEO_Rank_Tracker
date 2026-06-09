import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js';
const app = express();

connectDB()

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
   res.send('Server is Alive')
})


const PORT = process.env.PORT || 4000 

app.listen(PORT,()=>{console.log(`Server is running on port ${PORT}`)});


