import { Router } from "express";
import { deleteUserSessionHandler } from "../controller/session.controller";
import { createSessionHandler } from "../controller/session.controller";
import { githubOauthHandler, googleOauthHandler } from "../controller/user.controller";
import { deserializeUser } from "../middleware/deserializeUser";
import { requireUser } from "../middleware/requireUser";
import validate from "../middleware/validateResource";
import { createSessionSchema } from "../schema/session.schema";

const router = Router();

router.use(deserializeUser)

router.post('/auth', validate(createSessionSchema), createSessionHandler)
router.get('/auth/oauth/google', googleOauthHandler)
router.get('/auth/oauth/github', githubOauthHandler)

router.get('/logout', requireUser, deleteUserSessionHandler)

export default router;