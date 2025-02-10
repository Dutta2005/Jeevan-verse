import { Router } from "express";
import { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    updateUser,
    searchDonors,
    updateDonationStatus,
    getCurrentUser,
    getUserById
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/:id", getUserById);

// secure routes

router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);

router.use(verifyJWT);
router.post("/change-password", changeCurrentPassword);
router.patch("/update", updateUser);
router.get("/search", searchDonors);
router.patch("/donation-status", updateDonationStatus);
router.get("/current-user/details", getCurrentUser);


export default router;