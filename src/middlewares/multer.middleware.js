import multer from "multer";

const storage = multer.diskStorage({
    destination : function (req,file,cb){
        cb(null,"./public/temp")
    },
    filename : function (req,file,cb){
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1E9);

        cb(null,file.fieldname + '-' +  uniqueSuffix  +'-'+  file.originalname);
    }
});

const fileFilter = (req,file,cb) => {
    console.log("Mimetype:", file.mimetype);
    if(file.mimetype.startsWith("image/") ||
    file.mimetype === "application/octet-stream"){
        cb(null,true);
    }
    else{
        cb( new Error("only image files are allowed"),false);
    }
}
export const upload = multer ({
    storage,
    fileFilter,
    limits : {
        fileSize :5*1024*1024
    }
})