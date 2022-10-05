import { Router } from "express";
import { createProductHandler, deleteProductHandler, getProductHandler, updateProductHandler } from "../controller/product.controller";
import validate from "../middleware/validateResource";
import { createProductSchema, deleteProductSchema, getProductSchema, updateProductSchema } from "../schema/product.schema";


const router = Router();

router.post('/product/new', validate(createProductSchema), createProductHandler)
router.route('/product/:productId')
    .get(validate(getProductSchema), getProductHandler)
    .put(validate(updateProductSchema), updateProductHandler)
    .delete(validate(deleteProductSchema), deleteProductHandler)

export default router;