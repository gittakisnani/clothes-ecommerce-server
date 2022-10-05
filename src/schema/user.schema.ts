import { string, object, TypeOf } from 'zod'

export const createUserSchema = object({
    body: object({
        email: string({
            required_error: 'Email is required'
        }).email('Email is not valid'),
        password: string({
            required_error: 'Password is required'
        }).min(8, 'Passwords should be 8 chars minimum')
    })
})


const payload = {
    firstName: string().optional(),
    lastName: string().optional(),
    username: string().optional(),
    about: string().optional(),
    url: string().min(6, 'Should be at least 6 characters').optional(),
    phone: string().optional(),
    country: string().optional(),
    lang: string().optional(),
    email: string().email('Email is not valid').optional(),
    password: string().min(8, 'Passwords should be at least 8 characters').optional()
}


const params = {
    userId: string({
        required_error: 'userID is required'
    })
}

export const findUserSchema = object({
    params: object({
        ...params
    })
})

export const findUserByEmail = object({
    params: object({
        email: string({
            required_error: 'email param is required'
        }).email('Email not valid')
    })
})

export const updateUserSchema = object({
    body: object({
        ...payload
    }),
    params: object({
        ...params
    })
})

export const verifyOrForgotUserSchema = object({
    body: object({
        email: string({
            required_error: 'Email is required'
        }).email('Email is not valid')
    })
})

export const deleteUserSchema = object({
    params: object({
        ...params
    })
})

export type CreateUserInput = TypeOf<typeof createUserSchema>['body']
export type UpdateUserInput = TypeOf<typeof updateUserSchema>
export type DeleteUserInput = TypeOf<typeof deleteUserSchema>['params']
export type FindUserInput = TypeOf<typeof findUserSchema>['params']
export type FindUserByEmailInput = TypeOf<typeof findUserByEmail>['params']
