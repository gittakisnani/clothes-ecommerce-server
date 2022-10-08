import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import User, { UserDocument, UserInput } from "../model/user.model";
import config from 'config'
import qs from 'qs'

import axios from 'axios'
async function createUser(input: UserInput) {
    return User.create(input)
}

async function findUser(query: FilterQuery<UserDocument>) {
    return User.findOne(query).exec()
}

async function findUserAndUpdate(query: FilterQuery<UserDocument>, update: UpdateQuery<UserDocument>, options: QueryOptions = { lean: true }) {
    return User.findOneAndUpdate(query, update, options).lean().exec()
}

async function findUserAndDelete(query: FilterQuery<UserDocument>) {
    return User.findOneAndDelete(query).exec()
}


interface GoogleTokensResult {
    access_token: string;
    expires_in: Number;
    refresh_token: string;
    scope: string;
    id_token: string;
  }
  
  export async function getGoogleOAuthTokens({
    code,
  }: {
    code: string;
  }): Promise<GoogleTokensResult> {
    const url = "https://oauth2.googleapis.com/token";
  
    const values = {
      code,
      client_id: config.get("clientId"),
      client_secret: config.get("clientSecret"),
      redirect_uri: config.get("url"),
      grant_type: "authorization_code",
    };
  
    try {
      const res = await axios.post<GoogleTokensResult>(
        url,
        qs.stringify(values),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      return res.data;
    } catch (error: any) {
      console.error(error.response.data.error);
      throw new Error(error.message);
    }
  }
  
  interface GoogleUserResult {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
  }
  
  export async function getGoogleUser({
    id_token,
    access_token,
  } : { id_token: string, access_token: string }): Promise<GoogleUserResult> {
    try {
      const res = await axios.get<GoogleUserResult>(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
        {
          headers: {
            Authorization: `Bearer ${id_token}`,
          },
        }
      );
      return res.data;
    } catch (error: any) {
      console.log(error)
      throw new Error(error.message);
    }
  }



export {
    createUser,
    findUser,
    findUserAndDelete,
    findUserAndUpdate
}