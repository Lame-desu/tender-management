import multer, { MulterError } from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "10485760", 10); // 10MB

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".xlsx", ".xls", ".jpg", ".jpeg", ".png"];
const ALLOWED_MIMETYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "image/jpeg",
  "image/png",
];

const storage = multer.diskStorage({
  destination: (_req: Request, _file, cb) => {
    const dir = path.join(UPLOAD_DIR, "bids", "temp");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req: Request, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}-${safeName}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Accepted: PDF, DOCX, DOC, XLSX, XLS, JPG, PNG`));
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

/**
 * Wraps a multer middleware to catch multer errors (file type, file size, etc.)
 * and return a proper 400 JSON response instead of crashing with a 500.
 */
export function handleUpload(multerMiddleware: ReturnType<typeof upload.fields>) {
  return (req: Request, res: Response, next: NextFunction) => {
    multerMiddleware(req, res, (err: unknown) => {
      if (err) {
        if (err instanceof MulterError) {
          // Multer-specific errors (file size limit, too many files, etc.)
          const messages: Record<string, string> = {
            LIMIT_FILE_SIZE: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
            LIMIT_FILE_COUNT: "Too many files uploaded",
            LIMIT_UNEXPECTED_FILE: "Unexpected file field",
          };
          return res.status(400).json({
            success: false,
            message: messages[err.code] || err.message,
          });
        }
        // Custom errors from fileFilter
        if (err instanceof Error) {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }
        return res.status(500).json({
          success: false,
          message: "File upload failed",
        });
      }
      next();
    });
  };
}

export function moveBidFiles(bidId: number, files: Express.Multer.File[]): Express.Multer.File[] {
  const destDir = path.join(UPLOAD_DIR, "bids", String(bidId));
  fs.mkdirSync(destDir, { recursive: true });

  return files.map((file) => {
    const newPath = path.join(destDir, path.basename(file.path));
    fs.renameSync(file.path, newPath);
    return { ...file, path: newPath };
  });
}
