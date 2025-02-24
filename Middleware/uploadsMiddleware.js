// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const uploadPath = path.join(__dirname, '../uploads');
// // console.log('Uploads directory:', uploadPath); 

// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath);
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadPath); 
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); 
//   },
// });


// const fileFilter = (req, file, cb) => {
//   const filetypes = /jpeg|jpg|png/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (extname && mimetype) {
//     return cb(null, true);
//   } else {
//     cb(new Error('Только изображения формата JPEG, PNG или JPG'));
//   }
// };


// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 10 * 1024 * 1024 },
// });

// export default upload;

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
    folder: 'ERHUB_uploads', // задайте название папки в облаке
    allowed_formats: ['jpg', 'jpeg', 'png'], // разрешенные форматы
  },
});

// Создание middleware для загрузки файлов
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // ограничение до 10 МБ
});

export default upload;
