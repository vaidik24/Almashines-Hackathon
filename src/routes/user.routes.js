import { Router } from "express";
import { createIndustryPool, fetchHighestFrequencyIndustry, generateContentFromNews, fetchSuggestions } from "../controllers/user.controller.js";
import { launchNewsletter } from "../controllers/user.controller.js";

const router = Router();

router.route("/fetchIndustry").post(fetchHighestFrequencyIndustry);
router.route("/generateContent").post(generateContentFromNews);
router.route("/launch-newsletter").post(launchNewsletter);
router.route("/fetchSuggestions").get(fetchSuggestions);

export default router;
