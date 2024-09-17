import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { authenticate } from '@/utils/auth';
import { AzureKeyCredential, DocumentAnalysisClient } from '@azure/ai-form-recognizer';
import clientPromise from '@/utils/mongodb';
import Papa from 'papaparse';
import { analyzeFileContent } from '@/utils/azure';
import { apiHandler } from '@/utils/apiHandler';
import { AnalysisResult, ErrorResponse } from '../../../frontend/src/types';

export const config = {
  api: {
    bodyParser: false,
  },
};

const analyzeFileWithFormRecognizer = async (file: formidable.File): Promise<AnalysisResult> => {
  const endpoint = process.env.FORM_RECOGNIZER_ENDPOINT || '';
  const apiKey = process.env.FORM_RECOGNIZER_API_KEY || '';

  if (!endpoint || !apiKey) {
    throw { statusCode: 500, message: 'Form Recognizer configuration is missing.' };
  }

  const credential = new AzureKeyCredential(apiKey);
  const client = new DocumentAnalysisClient(endpoint, credential);

  const fileBuffer = fs.readFileSync(file.filepath);
  const fileBlob = new Blob([fileBuffer], { type: file.type });

  try {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      const csvText = await fileBlob.text();
      const parsedData = Papa.parse(csvText, { header: true }).data;
      return { analysis: JSON.stringify({ csvData: parsedData }) };
    } else if (['txt', 'md', 'js', 'py'].includes(fileExtension || '')) {
      const analysis = await analyzeFileContent(file.filepath);
      return { analysis };
    } else {
      const poller = await client.beginAnalyzeDocument('prebuilt-document', fileBlob);
      const result = await poller.pollUntilDone();

      if (!result) {
        throw { statusCode: 500, message: 'Failed to get analysis results from Form Recognizer.' };
      }

      return {
        analysis: JSON.stringify({
          keyValuePairResults: result.keyValuePairResults,
          tables: result.tables,
        })
      };
    }
  } catch (error: any) {
    console.error('Error analyzing file:', error);
    throw { statusCode: 500, message: `Failed to analyze file: ${error.message}` };
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse<AnalysisResult | ErrorResponse>) => {
  const user = authenticate(req, res);
  if (!user) {
    throw { statusCode: 401, message: 'Unauthorized: Invalid or missing authentication token.' };
  }

  if (req.method !== 'POST') {
    throw { statusCode: 405, message: `Method ${req.method} Not Allowed. Use POST to upload files.` };
  }

  const form = new formidable.IncomingForm();
  form.maxFileSize = parseFloat(process.env.MAX_FILE_SIZE_MB || '5') * 1024 * 1024;
  form.keepExtensions = true;

  return new Promise((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Formidable Error:', err);
        reject({ statusCode: 400, message: `Error parsing the uploaded file: ${err.message}` });
        return;
      }

      const file = files.file as formidable.File;
      if (!file) {
        reject({ statusCode: 400, message: 'No file uploaded. Please select a file to upload.' });
        return;
      }

      const allowedExtensions = (process.env.ALLOWED_EXTENSIONS || 'txt,csv,docx,md,js,py,pdf').split(',').map(ext => ext.trim().toLowerCase());
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        reject({ statusCode: 400, message: `File type not allowed. Allowed types are: ${allowedExtensions.join(', ')}. Uploaded file type: ${fileExtension || 'unknown'}` });
        return;
      }

      try {
        const analysis = await analyzeFileWithFormRecognizer(file);

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

        res.status(200).json({ analysis: `File uploaded and analyzed successfully. ${analysis.analysis}` });
        resolve();
      } catch (error: any) {
        console.error('Upload File Error:', error);
        reject({ statusCode: 500, message: `Failed to upload and analyze the file: ${error.message}` });
      }
    });
  });
};

export default apiHandler(handler);
