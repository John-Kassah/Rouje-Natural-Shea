import { cartModel } from "../models/carts.model.js";
import { productModel } from "../models/product.model.js";
import { getOrCreateCart } from "../utils/getOrCreateCartHelper.js";

export const addToCart = async (req, res) => {
    let outerCartVariable = {};
    let cartItems = req.body;

    //We sue this if-else logic here to ensure that when the click is made to add to cart, that happens and when the checkout is clicked, that also correctly updates the cart. we rely on how the body is sent for each instance... As an object for add to cart and as an array of objects for the checkout button
    if (!Array.isArray(cartItems)) {
        cartItems = [cartItems];
    } else if (Array.isArray(cartItems)) {
        await cartModel.findOneAndReplace({ user: req.user.id }, { user: req.user.id, items: [] }, { new: true })
    }

    try {
        for (const item of cartItems) {
            // For our backend, get the productID and quantity from the frontEnd
            const userId = req.user.id;
            const { productId, quantity } = item;

            if (!productId || quantity < 1) {

                // Ensure productId and quantity are provided
                throw new Error('Kindly ensure that the productID and the quantity added to the cart are provided in the request body');
            }

            // We need to check if the product is available. For instance, another buyer could have bought the last one while this user was still in the buying process
            const product = await productModel.findById(productId);
            if (!product) {
                throw new Error('This product is no longer in stock');
            }

            // Use our Helper function to create a new cart for new users or provide old users with their unique cart if they have one
            const cart = await getOrCreateCart(userId);

            // Now that we have the cart, we want to check if the cart already contains the product that the user is trying to add or if it is the first instance of the product on the cart.
            // This will help us know what to do with the product quantity for that product on the cart - whether to insert a new quantity or add to an existing one.

            // We first need to find the product item's location on this cart so that we can perform operations on it. So we look for it like so:
            const productItemIndex = cart.items.findIndex(
                (cartItem) => cartItem.product.toString() === productId
            ); // This will return an index (user has an instance of the product in the cart) or -1 (user does not have the product on the cart)

            if (productItemIndex > -1) {
                // If the product already exists in the cart, update the quantity
                cart.items[productItemIndex].quantity += Number(quantity);
            } else {
                // If the product does not exist in the cart, add it as a new item
                cart.items.push({ 
                    product: productId, 
                    quantity: quantity,
                    price: product.price
                });
            }

            // Save the updated cart
            await cart.save();
            // Populate the product details in the cart items
            await cart.populate('items.product');

            // Store the latest cart in the outer variable to return after all operations
            outerCartVariable = cart;
        }

        // Send a single response after all items have been processed
        return res.status(200).json({ message: 'The products have been added to the cart', data: outerCartVariable });
    } catch (error) {
        // Handle any errors that occur during the process
        return res.status(400).json({ message: `This error was thrown in an attempt to add user info: ${error.message}` });
    }
};

export const getMyCart = async (req, res) => {
    const userId = req.user.id;

    try {
        const cart = await cartModel.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name price productImageUrls');

        return res.status(200).json({ Message: `The users cart was retrieved sucessfully`, Cart: cart });
    } catch (error) {
        console.error('Error fetching user cart:', error);
        return res.send(`This error was thrown in an attempt to get the users cart: ${error.message}`);
    }
};

export const removeCartItemById = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user is authenticated and attached to req
        const productId = req.params.productId;

        // Find the cart of the logged-in user
        const cart = await cartModel.findOne({ user: userId });
        await cart.populate('items.product')

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found.' });
        }

        // We first need to find the product item's location on this cart so that we can perform operations on it. So we look for it like so:
        const productItemIndex = cart.items.findIndex(
            (cartItem) => cartItem.product.id.toString() === productId
        ); // This will return an index (user has an instance of the product in the cart) or -1 (user does not have the product on the cart)

        if (productItemIndex === -1) {
            // If the product does not exist in the cart. send response
            return res.status(200).json({
                message: 'Item is not on cart to begin with.',
                data: cart
            });
        }

        // Filter out the item to be removed
        const newCartItems = cart.items.filter(
            (item) => item.product.id.toString() !== productId
        );

        // Update the cart
        cart.items = newCartItems;
        await cart.save();
        await cart.populate('items.product')

        return res.status(200).json({
            message: 'Item has been successfully removed from cart.',
            data: cart
        });
    } catch (error) {
        return res.status(500).json({ message: `This error was thrown in an attempt to add user info: ${error.message}` });
    }
}

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await cartModel.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart was not found.' });
    }

    // Empty the items array
    cart.items = [];
    await cart.save();

    return res.status(200).json({
      message: 'Cart cleared successfully.',
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({ message: `This error was thrown in an attempt to add user info: ${error.message}` });
  }
};
