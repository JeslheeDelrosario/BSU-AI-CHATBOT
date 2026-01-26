import path from 'path';
import fs from 'fs';

// Local storage configuration
const uploadsDir = path.join(__dirname, '../../uploads/post-images');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✓ Created uploads directory for images');
}

export const uploadImageToLocal = async (
  file: Express.Multer.File,
  folder: string = 'posts'
): Promise<string> => {
  const timestamp = Date.now();
  const sanitizedFilename = file.originalname.replace(/\s+/g, '-');
  const fileName = `${timestamp}-${sanitizedFilename}`;
  const filePath = path.join(uploadsDir, fileName);

  // Write file to disk
  await fs.promises.writeFile(filePath, file.buffer);

  // Return URL path
  const publicUrl = `/uploads/post-images/${fileName}`;
  console.log('✓ Image saved locally:', publicUrl);
  return publicUrl;
};

export const deleteImageFromLocal = async (imageUrl: string): Promise<void> => {
  try {
    // Extract filename from URL
    const fileName = imageUrl.split('/uploads/post-images/')[1];
    if (fileName) {
      const filePath = path.join(uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        console.log('✓ Image deleted:', fileName);
      }
    }
  } catch (error) {
    console.error('Image delete error:', error);
  }
};
