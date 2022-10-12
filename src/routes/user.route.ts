import { Router } from "express";
import { createUserHandler, deleteUserHandler, findUserHandler, getCurrentUserHandler, updateUserHandler } from "../controller/user.controller";
import { createUserSchema, deleteUserSchema, findUserSchema, updateUserSchema } from "../schema/user.schema";
import validate from "../middleware/validateResource";
import { requireUser } from "../middleware/requireUser";
import { deserializeUser } from "../middleware/deserializeUser";
import { createSessionHandler } from "../controller/session.controller";
const router = Router();


router.route('/register')
    .post(validate(createUserSchema), createUserHandler, createSessionHandler)

router.route('/users/:userId')
    .get(validate(findUserSchema), findUserHandler)
    .put(validate(updateUserSchema), requireUser, updateUserHandler)
    .delete(validate(deleteUserSchema), requireUser, deleteUserHandler)

router.get( '/me', deserializeUser, requireUser, getCurrentUserHandler)
export default router