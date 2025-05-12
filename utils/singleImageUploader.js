import multer from "multer";
import pkg from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from 'dotenv';
dotenv.config();

const { v2: cloudinary } = pkg; //Equivalent to - const cloudinary = pkg.v2;

//we will pass cloudinary as the multer storage
//orage engine in the storage ingine we create with CloudinaryStorage to authorize the upload of images to cloudinary by showing that we have access to and own the cloudinary account we are uploading to. 
try {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    })
} catch (error) {
    res.status(500).json({ error: 'Cloudinary configuration failed' });
}

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "images", // The name of the folder in your Cloudinary account where the images will be stored
        allowed_formats: ["jpg", "png", "jpeg"] // Allowed image formats to filter the multipart/form data in request body as req.file or req.files
    }
});

export const parser = multer({ 
    storage: storage,
    limits: {files: 4},
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only JPEG/JPG and PNG images are allowed.'));
        }
      }
});// This will parse the incoming request and store the image in req.file or req.files depending on the type of upload you are doing, single or multiple.
// the storage engine will automatically upload the image to Cloudinary and return the image URL in the req.file or req.files object.



