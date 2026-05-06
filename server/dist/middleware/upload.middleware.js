import multer from 'multer';
import path from 'path';
import fs from 'fs';
const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
        const authReq = req;
        const uploadDir = path.join(process.cwd(), 'uploads', authReq.userId || 'anonymous');
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only .docx files are allowed'));
    }
};
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});
//# sourceMappingURL=upload.middleware.js.map