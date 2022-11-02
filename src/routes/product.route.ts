import { Request, Response, Router } from "express";
import multer from "multer";
import { createProductHandler, deleteAllProductsHandler, deleteProductHandler, getAllProductsHandler, getProductHandler, updateProductHandler } from "../controller/product.controller";
import validate from "../middleware/validateResource";
import { createProductSchema, deleteProductSchema, deleteProductsSchema, getAllProductsSchema, getProductSchema, updateProductSchema } from "../schema/product.schema";

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, 'src/assets/images')
    },

    filename(req, file, callback) {
        callback(null, Date.now() + file.originalname)
    },
})

const upload = multer({ 
    storage,
    // limits: {
    //     fieldSize: 1024 * 1024 * 3
    // }
})


const router = Router();
router.post('/product/new', validate(createProductSchema), upload.single('product'), createProductHandler)
router.route('/product/:productId')
    .get(validate(getProductSchema), getProductHandler)
    .put(validate(updateProductSchema), upload.array('product'),updateProductHandler)
    .delete(validate(deleteProductSchema), deleteProductHandler)


router.delete('/products/:user', validate(deleteProductsSchema), deleteAllProductsHandler)
router.get('/products',validate(getAllProductsSchema), getAllProductsHandler)


export default router;