import { Router } from "express";
import { 
    createBloodRequest, 
    getAllBloodRequests, 
    getBloodRequestById, 
    getBloodRequestsByUserId,
    getBloodRequestsByBloodGroup,
    updateBloodRequestStatus, 
    updateBloodRequest, 
    deleteBloodRequest,
    getBloodRequestsByStatus,
    addVolunteerToRequest,
    updateVolunteerPreferences
} from "../controllers/bloodRequest.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

//api/v1/blood-requests
router.get("/", getAllBloodRequests);
router.get("/status", getBloodRequestsByStatus);
router.get("/blood-group", getBloodRequestsByBloodGroup);
router.get("/:id", getBloodRequestById);
router.get("/user/:id", getBloodRequestsByUserId);
router.post("/create", createBloodRequest);
router.patch("/update/:id", updateBloodRequest);
router.patch("/status/:id", updateBloodRequestStatus);
router.delete("/delete/:id", deleteBloodRequest);

// New volunteer-related routes
router.post("/:id/volunteer", addVolunteerToRequest);
router.patch("/:id/volunteer-preferences", updateVolunteerPreferences);


export default router;