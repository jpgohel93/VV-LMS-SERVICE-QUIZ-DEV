const path = require('path');
const fs = require('fs');
const multerS3 = require("multer-s3");
const { S3Client, DeleteObjectsCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const { randomString } = require('../utils');

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY, // store it in .env file to keep it safe
        secretAccessKey: process.env.AWS_S3_SECRET_KEY
    },
    region: "ca-central-1" // this is the region that you select in AWS account
})

module.exports.createS3Client = async (key) => {
    let storage;
    let filePathPrefix;

    if (process.env.STORAGE_TYPE === 'S3') {
        // Initialize S3 instance
        storage = multerS3({
            s3: s3,
            bucket: process.env.BUCKET_FOLDER_NAME,
            acl: 'public-read',
            metadata: (req, file, cb) => {
                cb(null, { fieldname: file.fieldname });
            },
            key: async (req, file, cb) => {
                const fileExtension = path.extname(file.originalname).toLowerCase();
                const fileName = `${key}/${Date.now()}${await randomString(8)}${fileExtension}`;
                filePathPrefix = fileName; // Store the file path prefix
                cb(null, fileName);
            },
        });        
    } else if (process.env.STORAGE_TYPE === 'local') {
        // Use local storage (uploads folder in the root directory)
        storage = multer.diskStorage({
            destination: async (req, file, cb) => {
                const destinationDir = path.join(__dirname, '../../uploads', key);
                const isExists = await fs.existsSync(destinationDir);
                if(isExists === false){
                    await fs.mkdirSync(destinationDir, { recursive: true });
                }

                cb(null, 'uploads/');
            },
            filename: async (req, file, cb) => {
                const fileExtension = path.extname(file.originalname).toLowerCase();
                const fileName = `${key}/${Date.now()}${await randomString(8)}${fileExtension}`;
                filePathPrefix = fileName; // Store the file path prefix
                cb(null, fileName);
            },
        });
        // storage = multer({ storagePath });
    } else {
        throw new Error('Invalid storage type specified');
    }

    const upload = multer({
        storage: storage,
        fileFilter: (req, file, callback) => {
            this.sanitizeFile(file, callback)
        },
    });
    
    return upload; // Return both storage and filePathPrefix
};

module.exports.sanitizeFile = async (file, cb) => {
     // Define the allowed extension
     const fileExts = [".png", ".jpg", ".jpeg", ".gif",".mp3", ".mp4", ".pdf",".txt",".doc",".avi", ".mov", ".mkv", ".webm",".docx"];

     // Check allowed extensions
     const isAllowedExt = fileExts.includes(
         path.extname(file.originalname.toLowerCase())
     );
 
     if (isAllowedExt && (file.mimetype.startsWith("image/") ||  file.mimetype.startsWith("video/") ||  file.mimetype.startsWith("application/")  ||  file.mimetype.startsWith("text/"))) {
         return cb(null, true); // no errors
     } else {
         // pass error msg to callback, which can be displaye in frontend
         cb("Error: File type not allowed!");
     }
    
};
 
module.exports.deleteFile = async (file_path) => {

    let fileArray = file_path.split("/")
   
    if(fileArray && fileArray?.length == 3){
        if(fileArray[0] == "local"){
            if (fs.existsSync('uploads/'+fileArray[1]+'/'+fileArray[2])) {
                fs.unlinkSync('uploads/'+fileArray[1]+'/'+fileArray[2]);
            }
        }else if(fileArray[0] == "S3"){
            //delete the file from AWS
            var params = {
                Bucket: process.env.BUCKET_NAME,
                Key: file_path
            };

            const command = new DeleteObjectCommand(params);
            await s3.send(command);
        }
    }else{
        //delete the file from AWS
        var params = {
            Bucket: process.env.BUCKET_NAME,
            Key: file_path
        };

        const command = new DeleteObjectCommand(params);
        await s3.send(command);
    }
    return true
};

module.exports.deleteMultipleFiles = async (filesPath) => {
 
    // delete file
    await filesPath.map(async (key) => {
        let fileArray = key.split("/")
   
        if(fileArray && fileArray?.length == 3){
            if(fileArray[0] == "local"){
                if (fs.existsSync('uploads/'+fileArray[1]+'/'+fileArray[2])) {
                    fs.unlinkSync('uploads/'+fileArray[1]+'/'+fileArray[2]);
                }
            }else if(fileArray[0] == "S3"){
                //delete the file from AWS
                var params = {
                    Bucket: process.env.BUCKET_NAME,
                    Key: key
                };
    
                const command = new DeleteObjectCommand(params);
                await s3.send(command);
            }
        }else{
            //delete the file from AWS
            var params = {
                Bucket: process.env.BUCKET_NAME,
                Key: key
            };
    
            const command = new DeleteObjectCommand(params);
            await s3.send(command);
        }
    })

    return true
};