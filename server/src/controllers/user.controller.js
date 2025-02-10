import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { 
        name, 
        phone, 
        email, 
        age, 
        canDonate, 
        address, 
        status, 
        info,
        password 
    } = req.body;

    // Validation
    if (!name || !phone || !email || !age || !password || 
        canDonate === undefined || !address || !status || !info) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate address
    if (!address.state || !address.district || !address.city) {
        throw new ApiError(400, "All address fields are required");
    }

    // Validate medical info
    if (!info.bloodGroup || !info.height || !info.weight) {
        throw new ApiError(400, "All medical info fields are required");
    }

    // Check existing user
    const existedUser = await User.findOne({
        $or: [{ phone }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists with this phone or email");
    }

    // Create user
    const user = await User.create({
        name,
        phone,
        email,
        password,
        age,
        canDonate,
        address,
        status,
        info
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(201,  "User registered successfully", {
            user: createdUser
        })
    );
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordMatched(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const accessOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIARY) * 1000
    }

    const refreshOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIARY) * 1000
   }

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessOptions)
        .cookie("refreshToken", refreshToken, refreshOptions)
        .json(
            new ApiResponse(200, "User logged in successfully", {
                user: loggedInUser,
                accessToken,
                refreshToken
            })
        );
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "User logged out successfully", {}));
});

// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    "Access token refreshed",
                    { accessToken, refreshToken: newRefreshToken }
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

// change password
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, "Current password and new password are required");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordMatched(currentPassword);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid current password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, "Password changed successfully", {})
    );
})

// Update user profile
const updateUser = asyncHandler(async (req, res) => {
    const { name, age, address, status, info } = req.body;
    
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name,
                age,
                address,
                status,
                info
            }
        },
        { new: true, runValidators: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, "Profile updated successfully", user)
    );
});

// Search donors
const searchDonors = asyncHandler(async (req, res) => {
    const { bloodGroup, state, district, city } = req.query;

    const query = { canDonate: true };

    if (bloodGroup) query["info.bloodGroup"] = bloodGroup;
    if (state) query["address.state"] = state;
    if (district) query["address.district"] = district;
    if (city) query["address.city"] = city;

    const donors = await User.find(query)
        .select("name phone email address info.bloodGroup status")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, "Donors fetched successfully", donors)
    );
});

// Update donation status
const updateDonationStatus = asyncHandler(async (req, res) => {
    const { canDonate } = req.body;

    if (canDonate === undefined) {
        throw new ApiError(400, "Donation status is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { canDonate }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, "Donation status updated successfully", user)
    );
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, "User fetched successfully", req.user)
    );
});

// Get user by id
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password -refreshToken -v -updatedAt");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "User fetched successfully", user)
    );
});

export {
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
};