import { string, object, TypeOf } from 'zod';

export const createSessionSchema = object({
    body: object({
        email: string({ 
            required_error: 'Email is required'
        }).email('email is not valid'),
        password: string({
            required_error: 'password is required'
        }).min(8, 'Password should be at least 8 characters minimum')
    })
})


export type CreateSessionInput = TypeOf<typeof createSessionSchema> ['body']