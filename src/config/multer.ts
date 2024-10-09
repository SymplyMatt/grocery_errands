import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({});

const fileFilter = (req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'banner' || file.fieldname === 'image') {
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      cb(new Error('Banner must be an image file'), false);
      return;
    }
  } else if (file.fieldname === 'video') {
    if (!['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
      cb(new Error('Video must be a video file'), false);
      return;
    }
  }

  cb(null, true);
};

const upload = multer({ storage, fileFilter });

export default upload;
