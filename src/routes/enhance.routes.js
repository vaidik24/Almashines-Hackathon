import { Router } from "express";
import { enhanceText } from "../controllers/enhance.controller.js";

const router = Router();

router.route("/enhance").post(enhanceText);

export default router;
