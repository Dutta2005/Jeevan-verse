import { Router } from "express";
import {
    registerOrganization,
    loginOrganization,
    logoutOrganization,
    refreshAccessToken,
    changePassword,
    updateOrganization,
    getOrganizationProfile,
    getOrganizationProfileById
} from "../controllers/organization.controller.js";
import { verifyJWT } from "../middlewares/org.middleware.js";

const router = Router();

// /api/v1/organizations


router.post("/register", registerOrganization);
router.post("/login", loginOrganization);
router.get("/profile/:id", getOrganizationProfileById);


router.post("/logout", verifyJWT, logoutOrganization);
router.post("/refresh-token", refreshAccessToken);

router.use(verifyJWT)
router.post("/change-password", changePassword);
router.patch("/update", updateOrganization);
router.get("/profile", getOrganizationProfile);



export default router;