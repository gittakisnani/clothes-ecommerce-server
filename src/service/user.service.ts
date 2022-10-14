import { FilterQuery, FlattenMaps, LeanDocument, QueryOptions, UpdateQuery } from "mongoose";
import User, { UserDocument, UserInput } from "../model/user.model";
import config from 'config'
import qs from 'qs'

import axios from 'axios'
import { CreateSessionInput } from "../schema/session.schema";
import { omit } from "lodash";
import privateFileds, { PrivateFields } from "../config/privateFileds";
async function createUser(input: UserInput) {
    return User.create(input)
}

async function findUser(query: FilterQuery<UserDocument>) {
    return User.findOne(query).exec()
}


async function validatePassword({email, password}: CreateSessionInput) {
  const user = await User.findOne({ email }).exec();
  if(!user) return { error: true, message: 'User not found'};

  const pwdCorrect = await user.comparePassword(password);
  if(!pwdCorrect) return { error: true, message: 'Invalid credentials'};


  return omit(user.toJSON(), privateFileds) as Omit<UserDocument, PrivateFields>
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
      throw new Error(error.message);
    }
}

export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: null;
  blog: string;
  location: string;
  email: null;
  hireable: null;
  bio: null;
  twitter_username: null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}


export async function getGithubUser({ code } : { code: string}): Promise<GitHubUser> {
  const githubToken = await axios.post(
    `https://github.com/login/oauth/access_token?client_id=${config.get<string>('githubClientID')}&client_secret=${config.get<string>('githubClientSecret')}&code=${code}`
  ).then(res => res.data).catch(err => {
    throw err
  })

  const decoded = qs.parse(githubToken);
  const accessToken = decoded.access_token;

  return axios
    .get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Error getting user from GitHub`);
      throw error;
    });
}



export {
    createUser,
    findUser,
    findUserAndDelete,
    findUserAndUpdate,
    validatePassword
}