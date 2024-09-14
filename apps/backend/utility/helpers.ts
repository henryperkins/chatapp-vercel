import { encode } from 'gpt-3-encoder';

export const MAX_FILE_SIZE_MB = parseFloat(process.env.MAX_FILE_SIZE_MB || '5.0');
export const ALLOWED_EXTENSIONS = (process.env.ALLOWED_EXTENSIONS || 'txt,md,json')
  .split(',')
  .map((ext) => ext.trim().toLowerCase());

export function allowedFile(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return ALLOWED_EXTENSIONS.includes(extension || '');
}

export function fileSizeUnderLimit(sizeInBytes: number): boolean {
  const sizeInMB = sizeInBytes / (1024 * 1024);
  return sizeInMB <= MAX_FILE_SIZE_MB;
}

export function countTokens(text: string): number {
  const tokens = encode(text);
  return tokens.length;
}
