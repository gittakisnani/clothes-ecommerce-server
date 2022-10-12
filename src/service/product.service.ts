import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import Product, { ProductDocument, ProductInput } from "../model/product.model";

export async function createProduct(input: ProductInput) {
    return Product.create(input);
}

export async function findProduct(query: FilterQuery<ProductDocument>) {
    return Product.findOne(query).exec()
}

export async function findProducts(query: FilterQuery<ProductDocument>) {
    return Product.find(query)
}

export async function findProductAndUpdate(query: FilterQuery<ProductDocument>, update: UpdateQuery<ProductDocument>, options?: QueryOptions) {
    return Product.findOneAndUpdate(
        query, 
        update,
        (options && options)
        ).exec()
}


export async function findProductAndDelete(query: FilterQuery<ProductDocument>) {
    return Product.findOneAndDelete(query).exec()
}

export async function deleteProducts(query: FilterQuery<ProductDocument>) {
    return Product.deleteMany(query).exec()
}