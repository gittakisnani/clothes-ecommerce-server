import { Response, Request, NextFunction } from "express";
import { get, omit } from "lodash";
import bcrypt from 'bcrypt'
import privateFields from "../config/privateFileds";
import { CreateUserInput, DeleteUserInput, FindUserByEmailInput, FindUserInput, UpdateUserInput } from "../schema/user.schema";
import { createUser, findUser, findUserAndDelete, findUserAndUpdate, getGithubUser, getGoogleOAuthTokens, getGoogleUser } from "../service/user.service";
import config from 'config'
import asyncHandler from "express-async-handler";
import { signJWT } from "../utils/jwt.utils";
import { cookiesOptions } from "./session.controller";

//@ts-ignore
export const createUserHandler = asyncHandler(async (req: Request<{}, {}, CreateUserInput>, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const duplicate = await findUser({ email });
    if(duplicate) return res.status(409).json({ message: 'Cannot register with this email.'})
    const user = await createUser({ email, password });
    if(!user) return res.status(400).json({ message: 'Cannot register new user.'});
    next()
})


export async function findUserHandler(req: Request<FindUserInput>, res: Response) {
    const { userId: _id } = req.params
    const user = await findUser({ _id });
    if(!user) return res.status(400).json({ message: 'Cannot find user'})

    res.json(omit(user.toJSON(), privateFields))
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



    res.clearCookie('accessToken');
    res.clearCookie('refreshToken')

    return res.status(204).json({ message: 'User deleted'})
}


export async function getCurrentUserHandler(req: Request, res: Response) {
  const { user } = res.locals;
  if(!user) return res.status(400).json({message: 'User not logged in'})

  const me = await findUser({ _id: user._id })


  res.json(omit(me?.toJSON(), ['__v', 'password']))
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
          firstName: googleUser.name,
          lastName: googleUser.name
        },
        {
          upsert: true,
          new: true,
        }
      );
      
      res.locals.user = omit(user, privateFields);


      const accessToken = signJWT(
        {...omit(user, privateFields)},
        { expiresIn: config.get<string>('accessTokenTtl')}
      )

      const refreshToken = signJWT(
        {...omit(user, privateFields)},
        { expiresIn: config.get<string>('refreshTokenTtl')}
      )

      res.cookie('accessToken', accessToken, cookiesOptions);
      res.cookie('refreshToken', refreshToken, {...cookiesOptions,  maxAge: 3.154e10 })
      // redirect back to client
      res.redirect(config.get<string>('clientUrl'));
    } catch (error) {
      return res.redirect(`${config.get<string>('clientUrl')}404`);
    }
}

export async function githubOauthHandler(req: Request, res: Response) {
  const code = get(req, 'query.code');

  if(!code) {
    throw new Error('No code')
  }

  const githubUser = await getGithubUser({ code });
  if(!githubUser) return res.status(400).json({ message: 'Error authenticating with github'});
  
  
  //Make sure the email is not private (null)
  if(!githubUser.email) return res.redirect(`${config.get<string>('clientUrl')}login`)
  
  const user = await findUserAndUpdate({
    email: githubUser.email
  }, 
  {
    email: githubUser.email || '',
    about: githubUser.bio || '',
    firstName: githubUser.name || '',
    url: githubUser.blog || ''
  },
  {
    new: true,
    upsert: true
  }
  )

  const accessToken = signJWT(
    {...omit(user, privateFields)},
    { expiresIn: config.get<string>('accessTokenTtl')}
  )

  const refreshToken = signJWT(
    {...omit(user, privateFields)},
    { expiresIn: config.get<string>('refreshTokenTtl')}
  )


  res.cookie('accessToken', accessToken, cookiesOptions);
  res.cookie('refreshToken', refreshToken, {...cookiesOptions, maxAge: 3.154e10 })

  res.redirect(config.get<string>('clientUrl'))
}