import { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { omit } from "lodash";
import { CreateProductInput, DeleteProductInput, DeleteProductsInput, GetAllProductsInput, GetProductInput, UpdateProductInput } from "../schema/product.schema";
import { createProduct, deleteProducts, findProduct, findProductAndDelete, findProductAndUpdate, findProducts } from "../service/product.service";

export const productPrivateFields = ['user', '_id', "__v"]


//@ts-ignore
export const createProductHandler = asyncHandler(async (req: Request<{}, {}, CreateProductInput>, res) => {
    const product = await createProduct({...req.body, user: '6339cba43ef8fedaf21fed20'})
    if(!product) return res.status(400).json({ message: 'Cannot create product'});


    res.json(omit(product.toJSON(), productPrivateFields))
})


//@ts-ignore 
export const getProductHandler = asyncHandler(async (req: Request<GetProductInput>, res: Response) => {
    const { productId } = req.params;

    const product = await findProduct({ productId });
    if(!product) return res.status(404).json({ message: 'Cannot find product'});

    res.json(omit(product.toJSON(), productPrivateFields))
})

//@ts-ignore
export const getAllProductsHandler = asyncHandler(async (req: Request<{}, {}, GetAllProductsInput>, res: Response) => {
    const products = await findProducts({...req.body});
    if(!products) res.status(400).json({ message: 'Cannot find products'})
    res.json(products)
})

//@ts-ignore
export const deleteAllProductsHandler = asyncHandler(async (req: Request<DeleteProductsInput>, res: Response) =>{
    const products = await deleteProducts({...req.params});
    if(!products) return res.status(400).json({ message: 'Cannot delete products'})

    res.json(products)

})

//@ts-ignore
export const updateProductHandler = asyncHandler(async (req: Request<UpdateProductInput['params'], {}, UpdateProductInput['body']>, res: Response) => {
    const { productId } = req.params;
    const product = await findProductAndUpdate({ productId }, req.body, { new: true });
    if(!product) return res.status(400).json({ message: 'Cannot update product'})


    res.status(201).json(omit(product.toJSON(), productPrivateFields))
})

//@ts-ignore
export const deleteProductHandler = asyncHandler(async (req: Request<DeleteProductInput>, res: Response) => {
    const { productId } = req.params;

    const product = await findProductAndDelete({ productId });
    if(!product) return res.status(400).json({ message: 'Cannot delete product'});

    res.status(204).json({ message: 'Product deleted'})
})