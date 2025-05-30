import { Router } from "express";
import { createIndustryPool, fetchHighestFrequencyIndustry } from "../controllers/user.controller.js";

const router = Router();

router.route("/fetchIndustry").post(fetchHighestFrequencyIndustry);

export default router;
