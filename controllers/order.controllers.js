import mongoose from "mongoose"
import { cartModel } from "../models/carts.model.js";
import { orderModel } from "../models/order.model.js";
import { orderValidator } from "../validators/order.validator.js";
import { addPaymentMethod } from "./paymentMethod.controllers.js";


export const createOrder = async (req, res) => {
    const userId = req.user.id;

    // Validate the request body using the orderValidator and create the paymentMethod
    
    const { error, value } = orderValidator.validate(req.body)
    if (error) {
        return res.status(400).json(`Kindly check the request body for the following errors: ${error.details.map(err => err.message).join(', ')}`);
    } 

        const paymentMethod = await addPaymentMethod(req);

    //Since this is a compound operation, and it needs to be atomic - all succed or none(rollback), then we will use a MongoDB session to ensure this
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //To create the order, we want to fetch the users cart info - since this operation has to be a success for the order creation be possible, we want the to be in an atomic operation so we do it with a session.
        const cart = await cartModel.findOne({ user: userId }).session(session);//now this operation is identified as part of the session
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty.' });
        }//this ensures that there is something in the cart to place in an order

        //If we find a cart thats not empty, then we go ahead to build the order items
        const orderItems = cart.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            priceAtPurchase: item.price
        }));

        //Finding the total cost of all products in the cart
        const totalCharge = orderItems.reduce(
            (sum, productItem) => sum + (productItem.quantity * productItem.priceAtPurchase), 0
        ); 

        //Now we create the order - remember we need this action to be atomic so we use a session 
        console.log('we got here ', userId, totalCharge)
        const newOrder = await orderModel(
            {
                user: userId,
                items: orderItems,
                total: totalCharge
            }, {session}
        ); 
        

        //Finally, we need to clear the cart to ensure that we dont get duplicate orders and good UX
        cart.items = [];
        await cart.save({ session });//remember this action needs to be atomic with cart finding and order creation, so we apply the session

        await session.commitTransaction();//to commit all the actions taken in the session.
        session.endSession();//This is telling the MongoDb to stop monitering this session and clean up resources

        return res.status(201).json({
            message: 'Order created successfully.',
            order: newOrder
        });
    } catch (error) {
        // 🔄 Rollback on error
        await session.abortTransaction();//Incase of any error in any of our atomic actions, we abort the whole process. This prevents inconsistencies.
        session.endSession();
        console.error('Error creating order:', error);
        return res.status(500).json(`This error was thrown in an attempt to make an order: ${error.message}`);
    }
}

export const getOrderById = async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    try {
        const order = await orderModel.findById(orderId)
            .populate('items.product', 'name price productImageUrls')
            .populate('user', 'fullName email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        // Ensure users only see their own orders (unless admin)
        if (order.user.toString() !== userId.toString() && !req.user.role.toString() === 'admin') {
            return res.status(403).json({ message: 'This user is not authorized to view the requested order.' });
        }

        return res.status(200).json({ order });
    } catch (error) {

        return res.send(`This error was thrown in an attempt to add a product: ${error.message}`);
    }
};

export const getAllMyOrders = async (req, res) => {
    const userId = req.user.id;

    try {
        const orders = await orderModel.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name price');

        return res.status(200).json({ MIDIOutputMapessage: `The users orders were retrieved sucessfully`, Orders: orders });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return res.send(`This error was thrown in an attempt to add a product: ${error.message}`);
    }
};
