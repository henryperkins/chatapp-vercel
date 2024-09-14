import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { authenticate } from '@/utils/auth';
import { allowedFile, fileSizeUnderLimit, MAX_FILE_SIZE_MB } from '@/utils/helpers';
import { analyzeFileContent } from '@/utils/azure';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).json({ message: 'Error parsing the uploaded file.' });
    }

    const file = files.file as formidable.File;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    if (!allowedFile(file.originalFilename || '')) {
      return res.status(400).json({ message: 'File type not allowed.' });
    }

    if (!fileSizeUnderLimit(file.size)) {
      return res
        .status(400)
        .json({ message: `File size exceeds the limit of ${MAX_FILE_SIZE_MB} MB.` });
    }

    try {
      // Read file content
      const content = await fs.promises.readFile(file.filepath, 'utf-8');

      // Analyze file content using Azure OpenAI API
      const analysis = await analyzeFileContent(content);

      res.status(200).json({ analysis });
    } catch (error: any) {
      console.error('Error processing file:', error);
      res.status(500).json({ message: 'An error occurred.', error: error.message });
    }
  });
}
