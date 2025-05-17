import express from 'express'
import { authenticator } from '../middlewares/auth.js';
import { addToCart, clearCart, getMyCart, removeCartItemById } from '../controllers/cart.controllers.js';

const cartRouter = express.Router();

cartRouter.post('/addToCart', authenticator, addToCart);

cartRouter.get('/getMyCart', authenticator, getMyCart);

cartRouter.delete('/removeCartItemById/:productId', authenticator, removeCartItemById);

cartRouter.delete('/clearCart', authenticator, clearCart);

export default cartRouter;