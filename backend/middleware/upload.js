const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const fileFilter = (_, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'));
    return;
  }
  cb(null, true);
};

/**
 * Build a multer storage engine for the given folder/prefix.
 * Uses Cloudinary when configured, otherwise local disk (./uploads/<folder>).
 */
function makeStorage(folder, prefix) {
  if (cloudinary) {
    return new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `qbds/${folder}`,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        public_id: () => `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      },
    });
  }

  const dir = path.join(__dirname, '..', 'uploads', folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (_, __, cb) => cb(null, dir),
    filename: (_, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    },
  });
}

const limits = { fileSize: 5 * 1024 * 1024 };

const eventUpload = multer({ storage: makeStorage('events', 'event'), fileFilter, limits });
const storyUpload = multer({ storage: makeStorage('stories', 'story'), fileFilter, limits });
const teamUpload  = multer({ storage: makeStorage('team', 'team'),    fileFilter, limits });

module.exports = { eventUpload, storyUpload, teamUpload };
