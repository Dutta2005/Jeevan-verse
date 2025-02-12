import { Router } from "express";
import { 
   createPost, 
   getAllPosts, 
   getPostById, 
   getPostsByOrganizationId,
   editPost, 
   deletePost
} from "../controllers/orgPost.controller.js";
import { verifyJWT } from "../middlewares/org.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.get("/organization/:id", getPostsByOrganizationId);

router.use(verifyJWT);

// /api/v1/org-posts
router.post("/create", 
   upload.fields([
   { name: "thumbnail", maxCount: 1 },
]), 
createPost);
router.patch("/edit/:id", editPost);
router.delete("/delete/:id", deletePost);

export default router;