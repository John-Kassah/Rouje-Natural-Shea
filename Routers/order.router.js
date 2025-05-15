import express from 'express'
import { getAllMyOrders, getOrderById } from '../controllers/order.controllers.js';
import { authenticator } from '../middlewares/auth.js';

const orderRouter = express.Router();

orderRouter.post('/getOrderById/:orderId', authenticator, getOrderById);

orderRouter.post('/getAllMyOrders', authenticator, getAllMyOrders );