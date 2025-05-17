import express from 'express'
import { createOrder, getAllMyOrders, getOrderById } from '../controllers/order.controllers.js';
import { authenticator } from '../middlewares/auth.js';

const orderRouter = express.Router();

orderRouter.post('/createOrder', authenticator, createOrder );

orderRouter.get('/getAllMyOrders', authenticator, getAllMyOrders );

orderRouter.get('/getOrderById/:orderId', authenticator, getOrderById);

export default orderRouter;