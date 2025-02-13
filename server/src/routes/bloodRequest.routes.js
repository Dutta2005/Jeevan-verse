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
    getBloodRequestsByStatus
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


export default router;