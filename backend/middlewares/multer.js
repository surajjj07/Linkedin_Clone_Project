import multer from "multer"

/*
This is multer storage . it stores the recently image.
*/

let storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"./public")
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})

const upload=multer({storage})
export default upload
