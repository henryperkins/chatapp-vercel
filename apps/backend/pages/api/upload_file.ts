// pages/api/upload_file.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { authenticate } from '@/utils/auth';
import { AzureKeyCredential, DocumentAnalysisClient } from '@azure/ai-form-recognizer';
import clientPromise from '@/utils/mongodb'; // Assuming you're using MongoDB
import { errorHandler } from '@/middleware/errorHandler';
import Papa from 'papaparse'; // Import for CSV parsing <--- This was missing

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parser
  },
};

// Function to analyze the file using Azure Form Recognizer
const analyzeFileWithFormRecognizer = async (file: formidable.File): Promise<any> => {
  const endpoint = process.env.FORM_RECOGNIZER_ENDPOINT || '';
  const apiKey = process.env.FORM_RECOGNIZER_API_KEY || '';

  const credential = new AzureKeyCredential(apiKey);
  const client = new DocumentAnalysisClient(endpoint, credential);

  // Convert the File object to a Blob
  const fileBuffer = fs.readFileSync(file.filepath);
  const fileBlob = new Blob([fileBuffer], { type: file.type });

  try {
    // Determine the appropriate model and analysis logic based on file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      // Parse CSV data using Papa Parse
      const csvText = await fileBlob.text();
      const parsedData = Papa.parse(csvText, { header: true }).data;
      return { csvData: parsedData };
    } else if (['txt', 'md', 'js', 'py'].includes(fileExtension || '')) {
      // Handle text-based files (summarization, keyword extraction, etc.)
      const textContent = await fileBlob.text();
      // ... call Azure APIs for summarization, keyword extraction, etc. ...
      return { textContent, /* ... analysis results ... */ };
    } else {
      // Analyze other document types using Form Recognizer
      const poller = await client.beginAnalyzeDocument('prebuilt-document', fileBlob);
      const result = await poller.pollUntilDone();

      if (!result) {
        throw new Error('Failed to get analysis results from Form Recognizer.');
      }

      // Extract relevant data based on document type
      const extractedData = {
        keyValuePairResults: result.keyValuePairResults,
        tables: result.tables,
        // ... add other extraction logic as needed ...
      };

      return extractedData;
    }
  } catch (error: any) {
    console.error('Error analyzing file:', error);
    throw new Error('Failed to analyze file.');
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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

    const allowedExtensions = (process.env.ALLOWED_EXTENSIONS || 'txt,csv,docx,md,js,py,pdf').split(',').map(ext => ext.trim().toLowerCase());
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      res.status(400).json({ message: `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}` });
      return;
    }

    try {
      const analysis = await analyzeFileWithFormRecognizer(file); // Analyze the file

      // Store file and analysis in the database (optional)
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME);
      const uploads = db.collection('uploads');

      await uploads.insertOne({
        user_id: user.id,
        filename: file.name,
        filepath: file.filepath, // Or store the file content in the database
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
