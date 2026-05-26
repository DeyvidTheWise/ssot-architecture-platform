import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { authController } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), authController.register);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.get("/me", authenticate, authController.me);

export { authRouter };