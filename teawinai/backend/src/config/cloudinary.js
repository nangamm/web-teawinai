const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const requiredEnv = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

const missingEnv = requiredEnv.filter(name => !process.env[name]);

if (missingEnv.length > 0) {
  throw new Error(`Missing Cloudinary environment variables: ${missingEnv.join(', ')}`);
}

const allowedImageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
]);

const imageFileFilter = (req, file, cb) => {
  if (allowedImageMimeTypes.has(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error('Only JPG, PNG, and WEBP image files are allowed'), false);
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'teawinai/places',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
    ]
  }
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'teawinai/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'auto', quality: 'auto' }
    ]
  }
});

module.exports = { cloudinary, storage, avatarStorage, imageFileFilter };
