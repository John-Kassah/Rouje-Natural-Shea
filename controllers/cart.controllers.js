import { productModel } from "../models/product.model.js";
import { getOrCreateCart } from "../utils/getOrCreateCartHelper.js";

export const addToCart = async (req, res) => {
    try {   
        // For our backend, get the productID and quantity from the frontEnd
            const userId = req.user.id;
            const {productId, quantity} = req.body;

            if (!productId || quantity < 1) {
                return res.status(400).json({ message: 'Kindly ensure that the productID and the quantity added to the cart are provided in the request body'})
            }

            //We need to check if the product is available. For instance, nother buyer could have bought the last one while this user was still in the buying process
            const product = await productModel.findById(productId)
            if (!product) {
                return res.status(400).json({ message: 'This product is no longer in stock'})
            }

            //User our Helper function to create a new cart for new users or provide a old users with their unique cart if they have one
            const cart = await getOrCreateCart(userId)
            console.log(cart)
            
            //Now that we have the cart, we want to check if the cart already contains the product that the user is trying to add or if it the first instance of the product on the cart - This will help us know what to do with the product quantity for that product on the cart  - wheather to insert a new quantity or add to an existing one.

            //We first need to find the product Items location on this cart. so that we can perform operations on it. so we look for it. Like so -
            const productItemIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId
            );//This will return an index(user has an instance of the product in the cart) or null(user does not have the product on the cart)

            if (productItemIndex > -1) {
                cart.items[productItemIndex].quantity += Number(quantity);
            }else{
                cart.items.push({ product: productId, quantity: quantity})
            }

            await cart.save();
            await cart.populate('items.product');

            return res.status(200).json({ message: `${product.name} has been added to the cart`, data: cart });
    } catch (error) {
        return res.status(500).json({ message: `This error was thrown in an attempt to add user info: ${error.message}` });
    }
}