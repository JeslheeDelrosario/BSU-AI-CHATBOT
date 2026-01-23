import { Storage } from '@google-cloud/storage';
import path from 'path';

const keyFilePath = process.env.GCS_KEY_FILE || path.join(__dirname, '../../gcp-service-account-key.json');

export const storage = new Storage({
  keyFilename: keyFilePath,
  projectId: process.env.GCP_PROJECT_ID
});

export const bucketName = process.env.GCS_BUCKET_NAME || 'bsu-ai-chatbot-images';
export const bucket = storage.bucket(bucketName);

export const uploadImageToGCS = async (
  file: Express.Multer.File,
  folder: string = 'posts'
): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `${folder}/${timestamp}-${file.originalname.replace(/\s+/g, '-')}`;
  const blob = bucket.file(fileName);

  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype,
      cacheControl: 'public, max-age=31536000',
    },
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err: Error) => {
      console.error('GCS upload error:', err);
      reject(err);
    });

    blobStream.on('finish', async () => {
      await blob.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
      resolve(publicUrl);
    });

    blobStream.end(file.buffer);
  });
};

export const deleteImageFromGCS = async (imageUrl: string): Promise<void> => {
  try {
    const fileName = imageUrl.split(`${bucketName}/`)[1];
    if (fileName) {
      await bucket.file(fileName).delete();
    }
  } catch (error) {
    console.error('GCS delete error:', error);
  }
};
