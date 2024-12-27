import multer from "multer";
import path from "path";
import fs from "fs";
// const gameCoverStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/gameCoverImages');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const gameIconStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/gameIconImages');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

const ensureDirectoryExistence = (directory: fs.PathLike) => {
  if(!fs.existsSync(directory)){
    fs.mkdirSync(directory, { recursive: true });
  }
}
// paths for the folders
const gameCoverImagesPath = "uploads/gameCoverImages";
const gameIconImagesPath = "uploads/gameIconImages";
const tournamentIconImagesPath = "uploads/tournamentIconImages";
const tournamentCoverImagesPath = "uploads/tournamentCoverImages";
// Ensure folders exist
ensureDirectoryExistence(gameCoverImagesPath);
ensureDirectoryExistence(gameIconImagesPath);
ensureDirectoryExistence(tournamentIconImagesPath);
ensureDirectoryExistence(tournamentCoverImagesPath);

const gameStorage= multer.diskStorage({
  destination: (req, file, cb) => {
    if(file.fieldname==='game_cover_image'){
      cb(null,gameCoverImagesPath );
    }
    if(file.fieldname==='game_icon'){
      cb(null, gameIconImagesPath);
    }
   
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
})
const tournamentStorage=multer.diskStorage({
  destination: (req, file, cb) => {
    if(file.fieldname==='tournament_icon'){
      cb(null,tournamentIconImagesPath );
    }
    if(file.fieldname==='tournament_cover'){
      cb(null, tournamentCoverImagesPath);
    }
   
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
})


const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only images are allowed!'), false);
  }
};

// export const gameCoverUpload = multer({ storage: gameCoverStorage, fileFilter });
// export const gameIconUpload = multer({ storage: gameIconStorage, fileFilter });

export const gamesImagesUpload = multer({
  storage: gameStorage,
  fileFilter: fileFilter,
});
export const tournamentImagesUpload = multer({
storage:tournamentStorage,
fileFilter:fileFilter 
})