import mongoose from "mongoose";
import { productModel } from "../models/product.model.js";
import { addProductValidator } from "../validators/product.validator.js";


export const addProduct = async (req, res) => {
    console.log('We got here');
    try {
        console.log('Then We got here');
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
        console.log(`This error was thrown in an attempt to add a product: ${error.message}`)
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
    const filteredProducts = await productModel.find(filters)
    .sort({ createdAt: -1 }) //sort by newest first

    // 7. Send a JSON response back to the client
    res.status(200).json({ message: "Products were retrieved successfully", data: filteredProducts });
  } catch (error) {
        res.send(`This error was thrown in an attempt to add a product: ${error.message}`);
    }
}

export const getSingleProductById = async (req, res) => {
    const productId = req.params.productId
    try {
        const singleProduct = await productModel.findById(productId)
            .select('-__v -_id') // Exclude these fields from the product;

        if (!singleProduct) {
            return res.status(404).json({ message: `This product was not found` });
        }

        return res.status(200).json({ message: "The clicked product was retrieved successfully", data: singleProduct });

    } catch (error) {
        return res.status(500).json({ message: `This error was thrown in an attempt to retrieve all users: ${error.message}` });
    }
}

export const updateProductInfo = async (req, res) => {
    try {
    const id = req.params.productId; // this is the id of the user that was extracted from the token and saved in the req.user object in the authenticator middleware
    // const { id } = req.params; is no longer needed... can be deleted for this project
    const newProductUpdates = req.body;

    if (!req.files) {
            return res.status(400).json({ error: 'Image upload failed' });
        }
        newProductUpdates.productImageUrls = req.files.map(file => file.path);// Get the image URL's from the request body and add it to the user info object that will be saved to the database.

      // Check if the id is not a valid mongoose id that fits a valid ObjectId
    //   Do this before querying the database to save on resources and avoid an error called "CastError" which means that the id is not a valid ObjectId or is not in the correct format ot type
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(`This is not a valid user ID: ${id}`);     
    }
    //  Now this will not throw a CastError because the id is a valid ObjectId
    const currentProductData = await productModel.findById(id);

    // Check if the user with the specified id does not exist
    if (!(currentProductData)) {
        return res.status(404).send(`There is no product with this ID: ${id}`);   
    }

    // check to make sure that the changes being requested are not already present in the document in the DB
    if (Object.keys(newProductUpdates)
        .every( updateKeys => String(newProductUpdates[updateKeys]) === String(currentProductData[updateKeys]))) {
        return res.status(200).send(`The user info you are trying to update is already present in the database`);
    }

    // If the control flow reaches this point, it means that the user info is not already present in the database
    // and the id specified is valid and the user exists in the database
    // and the user info can be updated
         const updatedProduct = await productModel
        .findByIdAndUpdate(id, newProductUpdates, { new: true });
        res.status(201).json({message: `The update was a success. This is the updated product: `, data: updatedProduct});
    } catch (error) {
        res.status(500).json({message: `This error was thrown in an attempt to update user info: ${error.message}`});
    }
};

export const deleteProduct = async (req, res) => {
    const id = req.params.productId; // get the ID of the document to be deleted from the id parameter sent in the request url
    try {

        // Check if a user with the specified id does not exist
        const product = await productModel.findById(id);
        if (!product) {
            return res.send(`Product with ID: ${id} does not exist`);
        }

        const deletedProduct = await productModel.findByIdAndDelete(id);
        res.status(200).json({ message: `Product with ID: ${id} was deleted successfully`, data: deletedProduct });
        
    } catch (error) {
        console.log(`This error was thrown in an attempt to delete product info: ${error.message}`);
        res.status(500).json({ message: `This error was thrown in an attempt to delete product info: ${error.message}` });
    }
};