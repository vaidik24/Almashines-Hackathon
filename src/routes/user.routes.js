import { Router } from "express";
import { createIndustryPool, fetchHighestFrequencyIndustry } from "../controllers/user.controller.js";
import { registerUser, launchNewsletter } from "../controllers/user.controller.js";

const router = Router();

router.route("/fetchIndustry").post(fetchHighestFrequencyIndustry);
router.route("/register").post(registerUser);
router.route("/launch-newsletter").post(launchNewsletter);

export default router;
