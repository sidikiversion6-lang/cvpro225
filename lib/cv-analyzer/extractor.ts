import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { ExtractedCV } from './types';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text.trim();
  } catch (error) {
    throw new Error('Impossible d\'extraire le texte du PDF. Le fichier est peut-être corrompu ou protégé.');
  }
}

export async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (error) {
    throw new Error('Impossible d\'extraire le texte du DOCX. Le fichier est peut-être corrompu.');
  }
}

export async function extractTextFromFile(
  file: File
): Promise<ExtractedCV> {
  // Valider le type
  const fileName = file.name.toLowerCase();
  const isPDF = fileName.endsWith('.pdf') || file.type === 'application/pdf';
  const isDOCX = fileName.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  if (!isPDF && !isDOCX) {
    throw new Error('Format non supporté. Utilisez un fichier PDF ou DOCX.');
  }

  // Valider la taille (5 Mo max)
  const maxSize = 5 * 1024 * 1024; // 5 Mo
  if (file.size > maxSize) {
    throw new Error('Fichier trop volumineux. Taille maximum : 5 Mo.');
  }

  // Convertir en Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Extraire le texte
  const text = isPDF
    ? await extractTextFromPDF(buffer)
    : await extractTextFromDOCX(buffer);

  // Valider que le texte est utilisable
  if (!text || text.length < 100) {
    throw new Error('Le CV semble vide ou illisible. Essayez un autre fichier.');
  }

  if (text.length > 50000) {
    throw new Error('Le CV est trop long. Nos analyses sont optimisées pour des CV de 1-3 pages.');
  }

  return {
    text,
    wordCount: text.split(/\s+/).length,
    fileName: file.name,
    fileType: isPDF ? 'pdf' : 'docx',
    fileSize: file.size,
  };
}
