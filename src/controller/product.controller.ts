import { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { omit } from "lodash";
import { CreateProductInput, DeleteProductInput, GetProductInput, UpdateProductInput } from "../schema/product.schema";
import { createProduct, findProduct, findProductAndDelete, findProductAndUpdate } from "../service/product.service";

export const productPrivateFields = ['user', '_id', "__v"]


//@ts-ignore
export const createProductHandler = asyncHandler(async (req: Request<{}, {}, CreateProductInput>, res) => {
    //TODO:Add current user to the create input  => 6339cba43ef8fedaf21fed20
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