import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dfyire9xu',
  api_key: process.env.CLOUDINARY_API_KEY || '963362658922675',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'oMa4u7E0RRI_LUZg9D_TDwf1WM8'
});

export default cloudinary;
