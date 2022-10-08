import { object, number, string, TypeOf } from 'zod';

const payload = {
    body: object({
        title: string({
            required_error: 'Product title is required'
        }),
        desc: string({
            required_error: 'Description is required'
        }).min(20, 'Description too short, should be 20 characters or more.'),
        images: string({
            required_error: 'Image src required'
        }).array().length(1, 'One or more images needed to accept your product'),
        types: string({ required_error: 'Types are required'}).array().nonempty('At least one type.'),
        sizes: string({ required_error: 'Sizes are required'}).array().nonempty('At least one size'),
        cats: string({ required_error: 'Categories are required' }).array().nonempty('At least one category'),
        colors: string({ required_error: 'Colors are required'}).array().nonempty('At least one color'),
        price: number({ required_error: 'Price is required'}),
        gender: string({ required_error: 'Gender is required' })
    })
}

const params = {
    params: object({
        productId: string({
            required_error: 'productId is required'
        })
    })
}

export const createProductSchema = object({
    ...payload
})


export const getProductSchema = object({
    ...params
})

export const updateProductSchema = object({
    ...params,
    ...payload
})

export const deleteProductSchema = object({
    ...params
})

export const getAllProductsSchema = object({
    params: object({
        user: string().optional(),
        price: number().optional(),
        gender: string().optional(),
        sizes: string().array().optional(),
        types: string().array().optional(),
        cats: string().array().optional(),
        colors: string().array().optional()
    })
})


export const deleteProductsSchema = object({
    params: object({
        user: string().optional()
    })
})


export type CreateProductInput = TypeOf<typeof createProductSchema>['body'];
export type GetProductInput = TypeOf<typeof getProductSchema>['params']
export type UpdateProductInput = TypeOf<typeof updateProductSchema>
export type DeleteProductInput = TypeOf<typeof deleteProductSchema>['params']
export type GetAllProductsInput = TypeOf<typeof getAllProductsSchema>['params']
export type DeleteProductsInput = TypeOf<typeof deleteProductsSchema>['params']