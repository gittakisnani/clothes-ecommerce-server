import { Router } from "express";
import { loginHandler, logoutHandler } from "../controller/auth.controller";
import validate from "../middleware/validateResource";
import { loginSchema } from "../schema/auth.schema";

const router = Router();

router.post('/auth', validate(loginSchema), loginHandler)

router.get('/logout', logoutHandler)

export default router;