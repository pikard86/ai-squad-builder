import * as mammoth from 'mammoth';
import { FileType } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const extractTextFromDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Mammoth extraction failed", error);
    throw new Error("Failed to extract text from DOCX");
  }
};

export const detectFileType = (file: File): FileType => {
  if (file.type === 'application/pdf') return FileType.PDF;
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return FileType.DOCX;
  return FileType.UNKNOWN;
};
