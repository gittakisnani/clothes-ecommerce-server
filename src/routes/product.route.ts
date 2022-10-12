import { Router } from "express";
import multer from "multer";
import { createProductHandler, deleteAllProductsHandler, deleteProductHandler, getAllProductsHandler, getProductHandler, updateProductHandler } from "../controller/product.controller";
import validate from "../middleware/validateResource";
import { createProductSchema, deleteProductSchema, deleteProductsSchema, getAllProductsSchema, getProductSchema, updateProductSchema } from "../schema/product.schema";

export const upload = multer({ dest: 'src/assets/images' })
const router = Router();
router.post('/product/new', validate(createProductSchema), createProductHandler)
router.route('/product/:productId')
    .get(validate(getProductSchema), getProductHandler)
    .put(validate(updateProductSchema), updateProductHandler)
    .delete(validate(deleteProductSchema), deleteProductHandler)


router.delete('/products/:user', validate(deleteProductsSchema), deleteAllProductsHandler)
router.get('/products',validate(getAllProductsSchema), getAllProductsHandler)

export default router;