import { Router } from "express";
import { registerUser, launchNewsletter } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/launch-newsletter").post(launchNewsletter);

export default router;
