import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { getCommunityFeed } from "../service/community-feed.js";

export const getFeed = asyncHandler(async (req, res) => {
  try {
    const feed = await getCommunityFeed(req.query);
    return res
      .status(200)
      .json(new ApiResponse(200, "Community feed fetched", feed));
  } catch (error) {
    const status = error.statusCode === 400 ? 400 : 500;
    const message =
      status === 400
        ? "Invalid community feed query"
        : "Could not load community feed";
    return res.status(status).json(new ApiResponse(status, message));
  }
});
