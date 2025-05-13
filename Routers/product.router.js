import express from 'express'
import { addProduct, deleteProduct, getProducts, updateProductInfo } from '../controllers/product.controllers.js';
import { parser } from '../utils/singleImageUploader.js';
import { authenticator, authorizationOfRole } from '../middlewares/auth.js';


const productRouter = express.Router();

productRouter.post('/addProduct', authenticator, authorizationOfRole('admin'), parser.array('images', 4), addProduct);

productRouter.get('/getProducts', getProducts)

productRouter.patch('/updateProductInfo/:productId', authenticator, authorizationOfRole('admin'), updateProductInfo)

productRouter.delete('/deleteProduct/:productId', authenticator, authorizationOfRole('admin'), deleteProduct)

export default productRouter;