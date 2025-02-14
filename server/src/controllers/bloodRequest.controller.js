import { BloodRequest } from "../models/bloodRequest.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";


// craete a new blood request
const createBloodRequest = asyncHandler(async (req, res) => {
    try {
        const { bloodGroup, urgency, message, status, contactDetails, address } = req.body;
    
        if (!bloodGroup || !urgency || !status || !contactDetails || !address) {
            throw new ApiError(400, "All fields are required");
        }
    
        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }
    
        const bloodRequest = await BloodRequest.create({
            userId: req.user._id,
            bloodGroup,
            urgency,
            message: message || "Urgent blood required",
            contactDetails,
            status,
            address
        });
    
        const savedBloodRequest = await bloodRequest.save();
    
        return res.status(201).json(
            new ApiResponse(201, "Blood request created successfully", {
                bloodRequest: savedBloodRequest
            })
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while creating blood request")
        )
    }
})

// get all blood requests
const getAllBloodRequests = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const totalRequests = await BloodRequest.countDocuments();
        const bloodRequests = await BloodRequest.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json(
            new ApiResponse(200, "Blood requests fetched successfully", {
                bloodRequests,
                currentPage: page,
                totalPages: Math.ceil(totalRequests / limit),
                totalRequests,
                hasNext: page * limit < totalRequests,
                hasPrev: page > 1
            })
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while fetching blood requests")
        )
    }
})

// get blood request by id
const getBloodRequestById = asyncHandler(async (req, res) => {
    try {
        const bloodRequestId = req.params.id;
        const bloodRequest = await BloodRequest.findById(bloodRequestId)
            .populate({
                path: 'volunteers.user',
                select: 'name phone email'
            });

        if (!bloodRequest) {
            throw new ApiError(404, "Blood request not found");
        }

        // If the requester is not the creator, filter out contact details of volunteers who opted out
        if (!req.user || bloodRequest.userId.toString() !== req.user._id.toString()) {
            bloodRequest.volunteers = bloodRequest.volunteers.map(volunteer => {
                if (!volunteer.canShareDetails) {
                    // Remove sensitive information
                    if (volunteer.user) {
                        volunteer.user.phone = undefined;
                        volunteer.user.email = undefined;
                    }
                }
                return volunteer;
            });
        }

        return res.status(200).json(
            new ApiResponse(200, "Blood request fetched successfully", bloodRequest)
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while fetching blood request")
        );
    }
})



// get blood requests by user id
const getBloodRequestsByUserId = asyncHandler(async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const userId = req.user._id;

        const totalRequests = await BloodRequest.countDocuments({ userId });
        const bloodRequests = await BloodRequest.find({ userId })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return res.status(200).json(
            new ApiResponse(200, "Blood requests fetched successfully", {
                bloodRequests,
                currentPage: page,
                totalPages: Math.ceil(totalRequests / limit),
                totalRequests,
                hasNext: page * limit < totalRequests,
                hasPrev: page > 1
            })
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while fetching blood requests")
        )
    }    
})

// get blood requests by blood group
const getBloodRequestsByBloodGroup = asyncHandler(async (req, res) => {
    try {
        let { bloodGroup } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Decode the blood group from the URL
        bloodGroup = decodeURIComponent(bloodGroup);

        // Handle the case where '+' might be encoded as space
        if (bloodGroup.includes(' ')) {
            bloodGroup = bloodGroup.replace(' ', '+');
        }

        // Log the received and processed blood group
        // console.log('Received blood group:', req.query.bloodGroup);
        // console.log('Processed blood group:', bloodGroup);

        // Validate bloodGroup parameter
        if (!bloodGroup) {
            return res.status(400).json(
                new ApiResponse(400, "Blood group is required")
            );
        }

        // Validate blood group against allowed values
        const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (!validBloodGroups.includes(bloodGroup)) {
            return res.status(400).json(
                new ApiResponse(400, `Invalid blood group. Must be one of: ${validBloodGroups.join(', ')}. Received: ${bloodGroup}`)
            );
        }

        const totalRequests = await BloodRequest.countDocuments({ bloodGroup });
        const bloodRequests = await BloodRequest.find({ bloodGroup })
            .skip(skip)
            .limit(limit);

        return res.status(200).json(
            new ApiResponse(200, "Blood requests fetched successfully", {
                bloodRequests,
                currentPage: page,
                totalPages: Math.ceil(totalRequests / limit),
                totalRequests,
                hasNext: page * limit < totalRequests,
                hasPrev: page > 1
            })
        );
    } catch (error) {
        console.error('Error in getBloodRequestsByBloodGroup:', error);
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while fetching blood requests")
        );
    }
});

// update blood request status
const updateBloodRequestStatus = asyncHandler(async (req, res) => {
    try {
        const bloodRequestId = req.params.id;
        const { status } = req.body;
        const bloodRequest = await BloodRequest.findById(bloodRequestId);
        if (!bloodRequest) {
            throw new ApiError(404, "Blood request not found");
        }
        bloodRequest.status = status;
        const updatedBloodRequest = await bloodRequest.save();
        return res.status(200).json(
            new ApiResponse(200, "Blood request status updated successfully", updatedBloodRequest)
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while updating blood request status")
        )
    }
})

// update blood request
const updateBloodRequest = asyncHandler(async (req, res) => {
    try {
        const bloodRequestId = req.params.id;
        const { bloodGroup, urgency, message, contactDetails, address } = req.body;
        const bloodRequest = await BloodRequest.findById(bloodRequestId);
        if (!bloodRequest) {
            throw new ApiError(404, "Blood request not found");
        }
        bloodRequest.bloodGroup = bloodGroup || bloodRequest.bloodGroup;
        bloodRequest.urgency = urgency || bloodRequest.urgency;
        bloodRequest.message = message || bloodRequest.message;
        bloodRequest.contactDetails = contactDetails || bloodRequest.contactDetails;
        bloodRequest.address = address || bloodRequest.address;
        const updatedBloodRequest = await bloodRequest.save();
        return res.status(200).json(
            new ApiResponse(200, "Blood request updated successfully", updatedBloodRequest)
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while updating blood request")
        )    
    }
})

// delete blood request
const deleteBloodRequest = asyncHandler(async (req, res) => {
    try {
        const bloodRequestId = req.params.id;
        await BloodRequest.findByIdAndDelete(bloodRequestId);
        return res.status(200).json(
            new ApiResponse(200, "Blood request deleted successfully", null)
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while deleting blood request")
        )
    }
})

// Fetch Blood Requests with Status Filtering
const getBloodRequestsByStatus = asyncHandler(async (req, res) => {
    try {
        const { status } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
    
        if (status && !['pending', 'accepted', 'rejected'].includes(status)) {
            throw new ApiError(400, "Invalid status");
        }
    
        const query = status ? { status } : {};
        const totalRequests = await BloodRequest.countDocuments(query);
        const bloodRequests = await BloodRequest.find(query)
            .populate('userId', 'name email')
            .skip(skip)
            .limit(limit);
    
        res.status(200).json(
            new ApiResponse(200, "Blood requests fetched successfully", {
                bloodRequests,
                currentPage: page,
                totalPages: Math.ceil(totalRequests / limit),
                totalRequests,
                hasNext: page * limit < totalRequests,
                hasPrev: page > 1
            })
        );
    } catch (error) {
        res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while fetching blood requests")
        );
    }
})

// New function to add volunteer to blood request
const addVolunteerToRequest = asyncHandler(async (req, res) => {
    try {
        const bloodRequestId = req.params.id;
        const { canShareDetails = true } = req.body;
        
        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        const bloodRequest = await BloodRequest.findById(bloodRequestId);
        if (!bloodRequest) {
            throw new ApiError(404, "Blood request not found");
        }

        // Check if user is already a volunteer
        const isAlreadyVolunteer = bloodRequest.volunteers.some(
            volunteer => volunteer.user.toString() === req.user._id.toString()
        );

        if (isAlreadyVolunteer) {
            throw new ApiError(400, "You are already a volunteer for this request");
        }

        // Add new volunteer
        bloodRequest.volunteers.push({
            user: req.user._id,
            canShareDetails
        });

        const updatedBloodRequest = await bloodRequest.save();

        return res.status(200).json(
            new ApiResponse(200, "Successfully added as volunteer", updatedBloodRequest)
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while adding volunteer")
        );
    }
});

// update volunteer sharing preference
const updateVolunteerPreferences = asyncHandler(async (req, res) => {
    try {
        const bloodRequestId = req.params.id;
        const { canShareDetails } = req.body;

        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        const bloodRequest = await BloodRequest.findById(bloodRequestId);
        if (!bloodRequest) {
            throw new ApiError(404, "Blood request not found");
        }

        // Find and update volunteer preferences
        const volunteerIndex = bloodRequest.volunteers.findIndex(
            volunteer => volunteer.user.toString() === req.user._id.toString()
        );

        if (volunteerIndex === -1) {
            throw new ApiError(404, "You are not a volunteer for this request");
        }

        bloodRequest.volunteers[volunteerIndex].canShareDetails = canShareDetails;
        const updatedBloodRequest = await bloodRequest.save();

        return res.status(200).json(
            new ApiResponse(200, "Volunteer preferences updated successfully", updatedBloodRequest)
        );
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, error?.message || "Something went wrong while updating volunteer preferences")
        );
    }
});

export {
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
}

