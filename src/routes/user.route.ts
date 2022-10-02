import { Router } from "express";
import { createUserHandler, deleteUserHandler, findUserHandler, updateUserHandler } from "../controller/user.controller";
import { createUserSchema, deleteUserSchema, findUserSchema, updateUserSchema } from "../schema/user.schema";
import validate from "../middleware/validateResource";
const router = Router();


router.route('/users')
    .post(validate(createUserSchema), createUserHandler)

router.route('/users/:userId')
    .get(validate(findUserSchema), findUserHandler)
    .put(validate(updateUserSchema), updateUserHandler)
    .delete(validate(deleteUserSchema), deleteUserHandler)

export default router