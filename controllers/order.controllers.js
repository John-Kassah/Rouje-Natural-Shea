import mongoose from "mongoose"
import { cartModel } from "../models/carts.model";
import { orderModel } from "../models/order.model";


export const createOrder = async (userId) => {

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
            (sum, productItem) => sum + (productItem.quantity * productItem.price), 0
        );

        //Now we create the order - remember we need this action to be atomic so we use a session
        const newOrder = await orderModel.create(
            {
                user: userId,
                items: orderItems,
                priceAtPurchase: totalCharge
            }, { session }
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
        return res.send(`This error was thrown in an attempt to add a product: ${error.message}`);
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
