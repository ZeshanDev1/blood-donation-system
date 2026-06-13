const cloudinary = require('cloudinary').v2;

/**
 * Configures Cloudinary from environment variables.
 *
 * Provide EITHER:
 *   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
 * OR the three separate values:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * If none are set, this module exports `null` and the upload middleware
 * transparently falls back to local disk storage (handy for local dev).
 */
let configured = false;

if (process.env.CLOUDINARY_URL) {
  // The SDK auto-reads CLOUDINARY_URL, but we call config() so secure URLs are forced.
  cloudinary.config({ secure: true });
  configured = true;
} else if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

if (configured) {
  console.log('Cloudinary configured — uploads will be stored in the cloud.');
} else {
  console.log('Cloudinary not configured — uploads will be stored on local disk.');
}

module.exports = configured ? cloudinary : null;
