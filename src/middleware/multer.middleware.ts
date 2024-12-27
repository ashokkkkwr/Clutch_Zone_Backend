import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/');

    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+path.extname(file.originalname));
    }
})

// File filter for images
const fileFilter = (req:any, file:any, cb:any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only images are allowed!'), false);
    }
  };
  
  export const upload = multer({ storage, fileFilter });
  