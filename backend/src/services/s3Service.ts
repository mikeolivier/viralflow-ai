import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.AWS_S3_ENDPOINT,
  s3ForcePathStyle: true,
});

const UPLOAD_BUCKET = process.env.AWS_S3_BUCKET || 'viralflow-videos';
const UPLOAD_EXPIRATION = 3600; // 1 hour
const DOWNLOAD_EXPIRATION = 604800; // 7 days

/**
 * Generate presigned URL for video upload
 */
export async function generateUploadPresignedUrl(
  userId: string,
  originalFilename: string
): Promise<{
  uploadUrl: string;
  fileKey: string;
  expiresAt: Date;
}> {
  const fileKey = `uploads/${userId}/${uuidv4()}-${originalFilename}`;

  const params = {
    Bucket: UPLOAD_BUCKET,
    Key: fileKey,
    Expires: UPLOAD_EXPIRATION,
    ContentType: 'video/*',
  };

  const uploadUrl = s3.getSignedUrl('putObject', params);
  const expiresAt = new Date(Date.now() + UPLOAD_EXPIRATION * 1000);

  return {
    uploadUrl,
    fileKey,
    expiresAt,
  };
}

/**
 * Generate presigned URL for video download
 */
export async function generateDownloadPresignedUrl(fileKey: string): Promise<{
  downloadUrl: string;
  expiresAt: Date;
}> {
  const params = {
    Bucket: UPLOAD_BUCKET,
    Key: fileKey,
    Expires: DOWNLOAD_EXPIRATION,
  };

  const downloadUrl = s3.getSignedUrl('getObject', params);
  const expiresAt = new Date(Date.now() + DOWNLOAD_EXPIRATION * 1000);

  return {
    downloadUrl,
    expiresAt,
  };
}

/**
 * Copy file from uploads to processing bucket
 */
export async function copyFileToProcessing(
  sourceKey: string,
  userId: string
): Promise<string> {
  const destinationKey = `processing/${userId}/${uuidv4()}-${sourceKey.split('/').pop()}`;

  const params = {
    Bucket: UPLOAD_BUCKET,
    CopySource: `${UPLOAD_BUCKET}/${sourceKey}`,
    Key: destinationKey,
  };

  await s3.copyObject(params).promise();
  return destinationKey;
}

/**
 * Copy file from processing to output bucket
 */
export async function copyFileToOutput(
  sourceKey: string,
  userId: string,
  filename: string
): Promise<string> {
  const destinationKey = `outputs/${userId}/${uuidv4()}-${filename}`;

  const params = {
    Bucket: UPLOAD_BUCKET,
    CopySource: `${UPLOAD_BUCKET}/${sourceKey}`,
    Key: destinationKey,
  };

  await s3.copyObject(params).promise();
  return destinationKey;
}

/**
 * Delete file from S3
 */
export async function deleteFile(fileKey: string): Promise<void> {
  const params = {
    Bucket: UPLOAD_BUCKET,
    Key: fileKey,
  };

  await s3.deleteObject(params).promise();
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileKey: string): Promise<{
  size: number;
  lastModified: Date;
  contentType?: string;
}> {
  const params = {
    Bucket: UPLOAD_BUCKET,
    Key: fileKey,
  };

  const metadata = await s3.headObject(params).promise();

  return {
    size: metadata.ContentLength || 0,
    lastModified: metadata.LastModified || new Date(),
    contentType: metadata.ContentType,
  };
}

/**
 * List files in a prefix
 */
export async function listFiles(prefix: string): Promise<string[]> {
  const params = {
    Bucket: UPLOAD_BUCKET,
    Prefix: prefix,
  };

  const result = await s3.listObjectsV2(params).promise();
  return (result.Contents || []).map((obj) => obj.Key || '');
}

/**
 * Upload file from buffer
 */
export async function uploadFileFromBuffer(
  fileKey: string,
  buffer: Buffer,
  contentType: string = 'application/octet-stream'
): Promise<void> {
  const params = {
    Bucket: UPLOAD_BUCKET,
    Key: fileKey,
    Body: buffer,
    ContentType: contentType,
  };

  await s3.putObject(params).promise();
}

/**
 * Download file to buffer
 */
export async function downloadFileToBuffer(fileKey: string): Promise<Buffer> {
  const params = {
    Bucket: UPLOAD_BUCKET,
    Key: fileKey,
  };

  const result = await s3.getObject(params).promise();
  return result.Body as Buffer;
}

/**
 * Check if file exists
 */
export async function fileExists(fileKey: string): Promise<boolean> {
  try {
    const params = {
      Bucket: UPLOAD_BUCKET,
      Key: fileKey,
    };

    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if ((error as any).code === 'NotFound') {
      return false;
    }
    throw error;
  }
}
