

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Настройка Cloudinary с данными из переменных окружения
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Настройка хранилища для multer с использованием Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ERHUB_uploads', 
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

// Создание middleware для загрузки файлов
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // ограничение до 10 МБ
});

export default upload;
