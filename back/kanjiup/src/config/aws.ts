import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const createS3 = (): AWS.S3 =>
  new AWS.S3({
    endpoint: `https://${process.env.CF_ACC_ID}.r2.cloudflarestorage.com`,
    accessKeyId: process.env.AWS_ACCESS_ID,
    secretAccessKey: process.env.AWS_ACCESS_SECRET,
    signatureVersion: 'v4',
  });

export const createBucket = (name: string): Promise<AWS.S3.CreateBucketOutput | AWS.AWSError> => {
  const s3 = createS3();

  const params = {
    Bucket: name,
    CreateBucketConfiguration: {
      LocationConstraint: 'eu-west-3',
    },
  };
  return new Promise((resolve, reject) => {
    s3.createBucket(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        console.log('Bucket Created Successfully', data.Location);
        resolve(data);
      }
    });
  });
};

export const uploadFile = (fileName: string, content: Buffer, customParams: Partial<AWS.S3.PutObjectRequest> = {}): Promise<AWS.S3.ManagedUpload.SendData | Error> => {
  const s3 = createS3();

  const params: AWS.S3.PutObjectRequest = {
    Bucket: process.env.AWS_BUCKET_NAME || '',
    Key: fileName,
    Body: content,
    ...customParams,
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, function(err, data) {
      if (err) {
        reject(err);
      }
      // console.log(`File uploaded successfully. ${data.Location}`);
      resolve(data);
    });
  });
};

export const deleteFile = (fileName: string, customParams: Partial<AWS.S3.DeleteObjectRequest> = {}): Promise<AWS.S3.DeleteObjectOutput | AWS.AWSError> => {
  const s3 = createS3();

  const params: AWS.S3.DeleteObjectRequest = {
    Bucket: process.env.AWS_BUCKET_NAME || '',
    Key: fileName,
    ...customParams,
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, function(err, data) {
      if (err) {
        reject(err);
      }
      console.log(`File deleted successfully. ${fileName}`);
      resolve(data);
    });
  });
};
