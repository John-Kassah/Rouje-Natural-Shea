import express from 'express';
import userRouter from './Routers/user.router.js';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cors from 'cors';
import productRouter from './Routers/product.router.js';
import cartRouter from './Routers/cart.routers.js';


dotenv.config();

// Create an express server app and save it in a variable
const app = express();

// Enable your app to process http body requests and store them in req.body
app.use(express.json());

// Eneble cross-origin resource sharing (CORS) in your app. This will allow your app to accept requests from other domains and ports
// and allow your app to send requests to other domains and ports. This is important for security reasons.
app.use(cors({
    origin: 'https://rouje-naturel.vercel.app', // Your frontend's URL
    credentials: true
}));

// Defininf a port number
const port = process.env.PORT || 7000;

// Listening from the server app on a specified port
app.listen(port, ( ) => { 
    connectDB()
    console.log(`The Server is listening on port http://localhost:${port}`)
});

// Enable yout server to use the *useRouter* middleware by mounting the router on the */users* endpoint
app.use('/', userRouter); 
app.use('/', productRouter);
app.use('/', cartRouter);

