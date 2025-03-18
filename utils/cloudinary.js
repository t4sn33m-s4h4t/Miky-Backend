const cloudinary = require("cloudinary").v2;
// CLOUDINARY_CLOUDE_NAME
// CLOUDINARY_API_SECRET
// CLOUDINARY_API_KEY
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDE_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    timeout: 60000,
})

const uploadToCloudinary = async(fileUri)=>{
    try {
        const response = await cloudinary.uploader.upload(fileUri)
        return response;
    } catch (error) {
        console.log(error);
        throw new Error("Failed to upload image to cloudinary");
        
    }
}
module.exports = {uploadToCloudinary, cloudinary};