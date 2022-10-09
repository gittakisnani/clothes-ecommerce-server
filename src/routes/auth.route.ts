import { Router } from "express";
import { loginHandler, logoutHandler } from "../controller/auth.controller";
import { createSessionHandler } from "../controller/session.controller";
import { googleOauthHandler } from "../controller/user.controller";
import { deserializeUser } from "../middleware/deserializeUser";
import validate from "../middleware/validateResource";
import { loginSchema } from "../schema/auth.schema";
import { createSessionSchema } from "../schema/session.schema";

const router = Router();

router.use(deserializeUser)

router.post('/auth', validate(createSessionSchema), createSessionHandler)
router.get('/auth/oauth/google', googleOauthHandler)

router.get('/logout', logoutHandler)

export default router;