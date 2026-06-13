const fs = require('fs');
const path = require('path');
const cloudinary = require('../config/cloudinary');

const isHttp = (s) => /^https?:\/\//i.test(s || '');

/**
 * Resolve the value to persist in the DB for an uploaded multer file.
 * - Cloudinary storage exposes the secure URL on `file.path`.
 * - Local disk storage exposes `file.filename`; we build `/uploads/<folder>/<name>`.
 */
function toImageUrl(file, folder) {
  if (!file) return '';
  if (file.path && isHttp(file.path)) return file.path; // Cloudinary
  return `/uploads/${folder}/${file.filename}`;          // local disk
}

/** Extract the Cloudinary public_id from a delivery URL. */
function extractPublicId(url) {
  // e.g. https://res.cloudinary.com/<cloud>/image/upload/v1699/qbds/team/team-123.jpg
  //  ->  qbds/team/team-123
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

/**
 * Remove a previously-stored image. Handles both Cloudinary URLs and local paths.
 * Never throws for a missing file.
 */
async function removeImage(imageUrl) {
  if (!imageUrl) return;

  if (isHttp(imageUrl)) {
    if (cloudinary) {
      const publicId = extractPublicId(imageUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (_) {
          /* ignore deletion errors */
        }
      }
    }
    return;
  }

  const relativePath = imageUrl.replace(/^\/+/, '');
  const absolutePath = path.join(__dirname, '..', relativePath);
  try {
    await fs.promises.unlink(absolutePath);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

module.exports = { toImageUrl, removeImage };
