import { ServiceException } from '@smithy/smithy-client';

import { DeleteObjectCommand, DeleteObjectCommandInput, DeleteObjectCommandOutput, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

import dotenv from 'dotenv';

dotenv.config();

export const storageUrl = `${process.env.STORAGE_BASE_URL}`;
const endpoint = `https://${process.env.CF_ACC_ID}.r2.cloudflarestorage.com`;
export const Bucket = process.env.AWS_BUCKET_NAME || '';

const client = new S3Client({
  endpoint,
  region: 'weur',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_ID || '',
    secretAccessKey: process.env.AWS_ACCESS_SECRET || '',
  },
});

export const uploadFile = async (fileName: string, content: Buffer, customParams: Partial<PutObjectCommandInput> = {}): Promise<any | Error> => {
  const params: PutObjectCommandInput = {
    Bucket,
    Key: fileName,
    Body: content,
    ...customParams,
  };

  const command = new PutObjectCommand(params);

  await client.send(command);

  return `${storageUrl}/${Bucket}/${fileName}`;
};

export const deleteFile = async (fileName: string, customParams: Partial<DeleteObjectCommandInput> = {}): Promise<DeleteObjectCommandOutput | ServiceException | null> => {
  const params: DeleteObjectCommandInput = {
    Bucket: process.env.AWS_BUCKET_NAME || '',
    Key: fileName,
    ...customParams,
  };

  const command = new DeleteObjectCommand(params);

  return await client.send(command);
};
