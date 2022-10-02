import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import User, { UserDocument, UserInput } from "../model/user.model";

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
    return User.findOneAndDelete(query)
}

export {
    createUser,
    findUser,
    findUserAndDelete,
    findUserAndUpdate
}