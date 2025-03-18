const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new S3Client({
    region: "ap-southeast-2", // Correct region for your bucket
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "tradetales",
        key: (req, file, cb) => {
            const fileName = `${Date.now()}-${file.originalname}`;
            cb(null, fileName);
        },
        contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});

// Function to delete an object from S3
const deleteImageFromS3 = async (imageUrl) => {
    if (!imageUrl) {
        // If imageUrl is null or undefined, skip deletion
        return;
    }

    try {
        const imageKey = imageUrl.split("/").pop(); // Extract the file key from the URL
        const params = { Bucket: "tradetales", Key: imageKey };
        await s3.send(new DeleteObjectCommand(params));
        console.log(`Deleted image: ${imageKey} from S3`);
    } catch (error) {
        console.error("Error deleting image from S3:", error);
        throw new Error("Failed to delete old image from S3");
    }
};

module.exports = {
    deleteImageFromS3,
    upload,
};
