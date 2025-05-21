import express from 'express'
import { createOrder, getAllMyOrders, getAllOrders, getOrderById, updateOrderStatusById } from '../controllers/order.controllers.js';
import { authenticator, authorizationOfRole } from '../middlewares/auth.js';

const orderRouter = express.Router();

orderRouter.post('/createOrder', authenticator, createOrder );

orderRouter.get('/getAllOrders', authenticator, authorizationOfRole('admin'), getAllOrders );

orderRouter.get('/getAllMyOrders', authenticator, getAllMyOrders );

orderRouter.get('/getOrderById/:orderId', authenticator, getOrderById);

orderRouter.patch('/updateOrderStatusById/:orderId', authenticator, authorizationOfRole('admin'), updateOrderStatusById);

export default orderRouter;