const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const UPLOAD_DIR    = process.env.UPLOAD_PATH  || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME  = ['image/jpeg', 'image/png', 'application/pdf'];
const ALLOWED_EXT   = ['.jpg', '.jpeg', '.png', '.pdf'];

// Ensure base upload dir exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  /**
   * destination runs synchronously during the streaming phase, so
   * req.params is available but req.body is NOT yet fully parsed.
   * We only use req.params.id here (from the URL), which is safe.
   */
  destination: (req, file, cb) => {
    const proposalId  = req.params.id || 'unknown';
    const proposalDir = path.join(UPLOAD_DIR, 'proposals', proposalId);
    fs.mkdirSync(proposalDir, { recursive: true });
    cb(null, proposalDir);
  },

  /**
   * filename also runs during streaming.
   * We use a temporary timestamped name; the controller renames the file
   * to include the docType once multer has finished parsing the body.
   */
  filename: (req, file, cb) => {
    const ext      = path.extname(file.originalname).toLowerCase();
    const safeName = `upload_${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME.includes(file.mimetype) || !ALLOWED_EXT.includes(ext)) {
    return cb(new Error('Only PDF, JPG, and PNG files are allowed.'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

module.exports = { upload };
