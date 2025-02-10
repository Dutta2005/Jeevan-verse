import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asynchandler.js';

export const verifyJWT = asyncHandler( async (req, _, next) => {
    let token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if(!token) {
        throw new ApiError(401, "Unauthorized: Access token is required")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken._id).select("-password -refreshToken")

    if(!user) {
        throw new ApiError(401, "Unauthorized: User not found")
    }

    req.user = user  

    next()
})