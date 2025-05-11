import { productModel } from "../models/product.model.js";
import { addProductValidator } from "../validators/product.validator.js";

export const addProduct = async (req, res) => {

    try {
        // Validate the request body using the userRegistrationValidator
        const {error, value} = addProductValidator.validate(req.body);
        if (error) {
            return res.status(400).json(`Kindly check the request body for the following errors: ${error.details.map(err => err.message).join(', ')}`);
        } 
        // If the validation passes, proceed to extract the product info from the request body

        // Extract the product info(name and description and more) from the request body
        const reqProductInfo = req.body;

        // Check if the image was uploaded successfully and is present in the request body
        // If the image was uploaded successfully, it will be present in the request body as req.file or req.files depending on the type of upload you are doing, single or multiple.
        if (!req.files) {
            return res.status(400).json({ error: 'Image upload failed' });
        }
        reqProductInfo.productImageUrls = req.files.map(file => file.path);// Get the image URL's from the request body and add it to the user info object that will be saved to the database.

        // Create a new product that follows the schema model definition

        const modelProduct = new productModel(reqProductInfo);

        // Check if the Product already exists using the interface method *findOne* thats made possible by the productModel interface we created in the product.model.js file
        if (await productModel.findOne({name: value.name })) {
            return res.send(`Product with name: ${value.name} already exists`)
        }

        // Save the user info to the database once the user has been verified to not exist
        await modelProduct.save();

        res.status(201).json({ message: "Product was added successfully", data: modelProduct });

    } catch (error) {
        res.send(`This error was thrown in an attempt to add a product: ${error.message}`);
    }
};

export const getProducts = async(req, res) => {
  try {
    // 1. Extract raw query parameters
    const { category } = req.query;

    // 2. Build the MongoDB filter object. We do this by checking if the target filter field is present after atempting to extract it from req.query. 
    //If it is available, it will have a truthy value else a falsy one
    const filters = {};
    if (category) filters.category = category;

    // 6. Fetch filtered products
    const filteredProducts = await Product.find(filters)
    .sort({ createdAt: -1 })     

    // 7. Send a JSON response back to the client
    res.status(201).json({ message: "Products were retrieved successfully", data: filteredProducts });
  } catch (error) {
        res.send(`This error was thrown in an attempt to add a product: ${error.message}`);
    }
}