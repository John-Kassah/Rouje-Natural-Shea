import express from 'express'
import { addProduct } from '../controllers/product.controllers.js';
import { parser } from '../utils/singleImageUploader.js';


const productRouter = express.Router();

productRouter.post('/addProduct', parser.array('images', 4), addProduct);

export default productRouter;