import { Router } from "express";
import { getFeed } from "../controllers/community.controller.js";

const router = Router();
// Both underlying feeds already allow public reads. Mutations retain their own auth middleware.
router.get("/feed", getFeed);
export default router;
