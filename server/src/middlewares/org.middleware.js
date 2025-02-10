import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { Organization } from "../models/organization.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        let token = 
            req.cookies?.accessToken || 
            req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(
            token, 
            process.env.ACCESS_TOKEN_SECRET
        );

        const organization = await Organization.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!organization) {
            throw new ApiError(401, "Invalid access token");
        }

        req.organization = organization;
        next();
    } catch (error) {
        // throw new ApiError(401, error?.message || "Invalid access token");
        if (error.name === "TokenExpiredError") {
            console.error("Token expired:", error);
            throw new ApiError(401, "Access token has expired");
        } else {
            console.error("JWT error:", error);
            throw new ApiError(401, error.message || "Invalid access token");
        }
    }
});