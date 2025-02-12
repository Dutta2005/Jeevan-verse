import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET 
})

const uploadOnCloudinary = async (fileBuffer) => {
    try {
        if(!fileBuffer) {
            return null;
        }

        const response = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: 'blog'
                },
                (error, result) => {
                    if (error) reject(error);
                    resolve(result);
                }
            );

            uploadStream.end(fileBuffer);
        });

        return response;
        
    } catch (error) {
        console.log("Failed to upload on cloudinary", error);
        return null;
    }
}

const deleteFromCloudinary = async(publicId) => {
    try {
        const result = await cloudinary.uploader.destroy('blog/' + publicId)
        return result;
    } catch (error) {
        console.log("Failed to delete from cloudinary", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }