import { Response, Request } from "express";
import { omit } from "lodash";
import bcrypt from 'bcrypt'
import privateFields from "../config/privateFileds";
import { CreateUserInput, DeleteUserInput, FindUserByEmailInput, FindUserInput, UpdateUserInput } from "../schema/user.schema";
import { createUser, findUser, findUserAndDelete, findUserAndUpdate, getGoogleOAuthTokens, getGoogleUser } from "../service/user.service";
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


export function getCurrentUserHandler(req: Request, res: Response) {
  const { user } = res.locals;
  if(!user) return res.status(400).json({message: 'User not logged in'})

  res.json(user)
}

export async function googleOauthHandler(req: Request, res: Response) {
    // get the code from qs
    const code = req.query.code as string;

  
    try {
      // get the id and access token with the code
      const { id_token, access_token } = await getGoogleOAuthTokens({ code });
  
      // get user with tokens
      const googleUser = await getGoogleUser({ id_token, access_token });
  
  
      if (!googleUser.verified_email || !googleUser) {
        return res.status(403).send("Google account is not verified");
      }
  
      // upsert the user
      const user = await findUserAndUpdate(
        {
          email: googleUser.email,
        },
        {
          email: googleUser.email,
        //   name: googleUser.name,
        //   picture: googleUser.picture,
        },
        {
          upsert: true,
          new: true,
        }
      );
      
      res.locals.user = omit(user, privateFields)
      // redirect back to client
      res.redirect("http://localhost:3000/");
    } catch (error) {
      console.log(error)
      return res.redirect(`http://localhost:3000/404`);
    }
  }