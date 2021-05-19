require('dotenv').config();
var AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID_S3,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_S3
});
const BUCKET_NAME = "dr-lee-s3"
module.exports = {
    async uploadFile(file) {
            // Read content from the file
       const fileContent = fs.createReadStream(file.path)
    
        // Setting up S3 upload parameters
        const params = {
            Bucket: BUCKET_NAME,
            Key: file.filename ,
            Body: fileContent
        };
        try {
            const data = await s3.upload(params).promise();
            return data;
        } catch (error) {
            console.log(error);
        }
    }
}

