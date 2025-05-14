import express from 'express'
import { authenticator } from '../middlewares/auth.js';
import { addToCart } from '../controllers/cart.controllers.js';

const cartRouter = express.Router();

cartRouter.post('/addToCart', authenticator, addToCart);

export default cartRouter;