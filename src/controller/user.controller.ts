import { Response, Request } from "express";
import { omit } from "lodash";
import bcrypt from 'bcrypt'
import privateFields from "../config/privateFileds";
import { CreateUserInput, DeleteUserInput, FindUserByEmailInput, FindUserInput, UpdateUserInput } from "../schema/user.schema";
import { createUser, findUser, findUserAndDelete, findUserAndUpdate } from "../service/user.service";
import config from 'config'
import asyncHandler from "express-async-handler";

//@ts-ignore
export const createUserHandler = asyncHandler(async (req: Request<{}, {}, CreateUserInput>, res: Response) => {
    const { email, password } = req.body;
    const duplicate = await findUser({ email });
    if(duplicate) return res.status(409).json({ message: 'Cannot register with this email.'})
    const user = await createUser({ email, password });
    if(!user) return res.status(400).json({ message: 'Cannot register new user.'});
    res.status(201).json(omit(user.toJSON(), privateFields))
})


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

    return res.json({ user: omit(user.toJSON(), [...privateFields, '_id'])})
}

//@ts-ignore
export const updateUserHandler = asyncHandler(async (req: Request<UpdateUserInput['params'], {}, UpdateUserInput['body']>, res: Response) => {
    const { userId: _id } = req.params;
    const { email } = req.body
    if(req.body.password) {
        const salt = await bcrypt.genSalt(config.get<number>('salt'))
        const hash = bcrypt.hashSync(req.body.password, salt);
        req.body.password = hash
    }

    const duplicate = await findUser({ email });
    if(duplicate && String(duplicate?._id) !== _id.toString()) return res.status(409).json({ message: 'Cannot update email to this one.'}) 

    const user = await findUserAndUpdate({ _id }, req.body, { new: true });
    if(!user) return res.status(400).json({ message: 'cannot update user.'})

    res.json(omit(user, privateFields))
})

export async function deleteUserHandler(req: Request<DeleteUserInput>, res: Response) {
    const { userId: _id } = req.params
    const user = await findUserAndDelete({ _id });
    if(!user) return res.status(400).json({ message: 'Cannot delete user'})

    return res.status(204).json({ message: 'User deleted'})
}