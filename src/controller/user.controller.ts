import { Response, Request } from "express";
import { omit } from "lodash";
import bcrypt from 'bcrypt'
import privateFields from "../config/privateFileds";
import { CreateUserInput, DeleteUserInput, FindUserByEmailInput, FindUserInput, UpdateUserInput } from "../schema/user.schema";
import { createUser, findUser, findUserAndDelete, findUserAndUpdate } from "../service/user.service";
import config from 'config'

export async function createUserHandler(req: Request<{}, {}, CreateUserInput>, res: Response) {
    try {
        const { email, password } = req.body;
        const user = await createUser({ email, password })
        if(!user) throw Error('Cannot register new user')
        res.status(201).json(omit(user.toJSON(), privateFields))
    } catch(err) {
        throw err
    }
}



export async function findUserHandler(req: Request<FindUserInput>, res: Response) {
    const { userId: _id } = req.params
    const user = await findUser({ _id });
    if(!user) return res.status(400).json({ message: 'Cannot find user'})

    res.json({ user: omit(user.toJSON(), privateFields)})
} 

export async function findUserByEmail(req: Request<FindUserByEmailInput>, res: Response) {
    const { email } = req.params;

    const user = await findUser({ email });
    if(!user) return res.status(400).json({ message: 'Cannot find user'})

    return res.json({ user: omit(user.toJSON(), privateFields)})
}

export async function updateUserHandler(req: Request<UpdateUserInput['params'], {}, UpdateUserInput['body']>, res: Response) {
    const { userId: _id } = req.params

    if(req.body.password) {
        const salt = await bcrypt.genSalt(config.get<number>('salt'));
        const hash = bcrypt.hashSync(req.body.password, salt)
        req.body.password = hash
    }

    const user = await findUserAndUpdate({ _id }, req.body, { new: true })
    if(!user) return res.status(400).json({ message: 'Cannot update user'})

    res.json({ user: omit(user, privateFields)})
}

export async function deleteUserHandler(req: Request<DeleteUserInput>, res: Response) {
    const { userId: _id } = req.params
    const user = await findUserAndDelete({ _id });
    if(!user) return res.status(400).json({ message: 'Cannot delete user'})

    return res.status(204).json({ message: 'User deleted'})
}