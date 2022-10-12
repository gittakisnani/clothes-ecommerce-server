import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

export interface ProductInput {
    title: string
    desc: string
    colors: string[]
    types: string[]
    cats: string[]
    sizes: string[]
    gender: string
    price: number
    images: string[]
    user: string
}


export interface ProductDocument extends ProductInput, mongoose.Document {
    productId: string
    createdAt: Date
    updatedAt: Date
    canUpdateOrDelete: (userId: string) => boolean
}



const productSchema = new mongoose.Schema({
    user: {
        ref: 'User',
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    productId: {
        type: String,
        required: true,
        default: () => uuid()
    },
    title: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    colors: [{
        type: String,
        required: true
    }],
    types: [{
        type: String,
        required: true
    }],
    cats: {},
    gender: { type: String, required: true },
    sizes: [{
        type: String,
        required: true
    }],
    price: { type: Number, required: true },
    images: [{
        data: Buffer,
        contentType: String
    }]
}, {
    timestamps: true 
})


productSchema.methods.canUpdateOrDelete = function(userId: string) : boolean {
    const product = this as ProductDocument;
    return product.user.toString() === String(userId)
}


const Product = mongoose.model<ProductDocument>('Product', productSchema);

export default Product;


