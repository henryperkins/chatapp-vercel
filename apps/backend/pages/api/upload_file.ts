// File: apps/backend/pages/api/upload_file.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { authenticate } from '@/utils/auth';
import { analyzeFileContent } from '@/utils/azure';
import clientPromise from '@/utils/mongodb';
import { errorHandler } from '@/middleware/errorHandler';

interface UploadFileResponse {
  message: string;
  analysis?: string;
}

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parser
  },
};

const handler = async (req: NextApiRequest, res: NextApiResponse<UploadFileResponse>) => {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    return;
  }

  const form = new formidable.IncomingForm();
  form.maxFileSize = parseFloat(process.env.MAX_FILE_SIZE_MB || '5') * 1024 * 1024; // Convert MB to bytes
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable Error:', err);
      res.status(400).json({ message: 'Error parsing the uploaded file.' });
      return;
    }

    const file = files.file as formidable.File;
    if (!file) {
      res.status(400).json({ message: 'No file uploaded.' });
      return;
    }

    const allowedExtensions = (process.env.ALLOWED_EXTENSIONS || 'txt,md,json').split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      res.status(400).json({ message: `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}` });
      return;
    }

    try {
      const fileContent = fs.readFileSync(file.filepath, 'utf-8');
      const analysis = await analyzeFileContent(fileContent);

      // Optionally, store file and analysis in the database
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME);
      const uploads = db.collection('uploads');

      await uploads.insertOne({
        user_id: user.id,
        filename: file.name,
        filepath: file.filepath,
        analysis,
        uploaded_at: new Date(),
      });

      res.status(200).json({ message: 'File uploaded and analyzed successfully.', analysis });
    } catch (error: any) {
      console.error('Upload File Error:', error);
      res.status(500).json({ message: error.message || 'Failed to upload and analyze the file.' });
    }
  });
};

export default errorHandler(handler);
