import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Structured output schema so Gemini never returns truncated JSON ────────
const prescriptionSchema = {
  type: SchemaType.OBJECT,
  properties: {
    medications: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name:      { type: SchemaType.STRING },
          dosage:    { type: SchemaType.STRING },
          frequency: { type: SchemaType.STRING },
          duration:  { type: SchemaType.STRING }
        },
        required: ['name']
      }
    },
    diagnosis:  { type: SchemaType.STRING },
    doctorName: { type: SchemaType.STRING },
    date:       { type: SchemaType.STRING },
    notes:      { type: SchemaType.STRING }
  },
  required: ['medications']
};

/**
 * Robust JSON extractor — handles markdown fences and partial JSON
 */
const extractJSON = (text) => {
  // 1. Try to extract from markdown fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch { /* continue */ }
  }

  // 2. Try the raw text directly
  try { return JSON.parse(text.trim()); } catch { /* continue */ }

  // 3. Find the outermost { } block
  const first = text.indexOf('{');
  const last  = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    try { return JSON.parse(text.slice(first, last + 1)); } catch { /* continue */ }
  }

  return null;
};

const fallbackAnalysis = (message = 'Could not fully analyze. Please try with a clearer image or PDF.') => ({
  medications: [],
  diagnosis: 'Unable to analyze',
  doctorName: 'Not readable',
  date: 'Not readable',
  notes: message
});

/**
 * Upload a prescription file to Cloudinary
 * Supports both images and PDFs
 */
export const uploadPrescriptionFile = async (fileBuffer, fileType) => {
  try {
    const resourceType = fileType === 'pdf' ? 'raw' : 'image';

    const response = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'prescriptions',
          format: fileType === 'pdf' ? 'pdf' : undefined
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      );
      uploadStream.end(fileBuffer);
    });

    return response;
  } catch (error) {
    console.error('Error uploading prescription to Cloudinary:', error);
    throw error;
  }
};

/**
 * Analyze a prescription image using Gemini's vision capabilities.
 * Uses structured output (responseMimeType: application/json) so Gemini
 * always returns valid, complete JSON — never truncated.
 */
export const analyzePrescriptionImage = async (fileBuffer, mimeType) => {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: prescriptionSchema
      }
    });

    const base64Data = fileBuffer.toString('base64');

    const prompt = `You are a medical prescription analyzer. Carefully analyze this prescription image and extract all available information.

For medications, extract every medicine listed with its dosage, frequency (e.g. "twice daily"), and duration (e.g. "7 days").
For any field you cannot read, use "Not readable".
Always extract as many medications as you can find.`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      }
    ]);

    const responseText = result.response.text();
    const parsed = extractJSON(responseText);

    if (!parsed) {
      console.warn('analyzePrescriptionImage: could not parse response:', responseText.substring(0, 200));
      return fallbackAnalysis();
    }

    return parsed;
  } catch (error) {
    console.error('Error analyzing prescription image:', error?.message || error);
    return fallbackAnalysis();
  }
};

/**
 * Analyze a PDF prescription using pdf-parse + Gemini structured output
 */
export const analyzePrescriptionPDF = async (fileBuffer) => {
  try {
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    const pdfData = await pdfParse(fileBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length < 10) {
      // Scanned/image-based PDF — fall back to vision analysis
      return await analyzePrescriptionImage(fileBuffer, 'application/pdf');
    }

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL_ID || 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: prescriptionSchema
      }
    });

    const prompt = `You are a medical prescription analyzer. Analyze the following prescription text and extract all information.

Prescription Text:
${extractedText.substring(0, 8000)}

Extract every medication listed with dosage, frequency and duration. Use "Not found" for any field not present.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = extractJSON(responseText);

    if (!parsed) {
      console.warn('analyzePrescriptionPDF: could not parse response:', responseText.substring(0, 200));
      return fallbackAnalysis('Could not structure the PDF content.');
    }

    parsed._rawText = extractedText;
    return parsed;
  } catch (error) {
    console.error('Error analyzing prescription PDF:', error?.message || error);
    return fallbackAnalysis('The PDF could not be fully analyzed.');
  }
};

/**
 * Generate a human-readable summary of prescription analysis
 */
export const formatPrescriptionSummary = (analysis) => {
  let summary = '## 📋 Prescription Analysis\n\n';

  const isValid = (val) => val && val !== 'Not readable' && val !== 'Not found' && val !== 'Unable to analyze';

  if (isValid(analysis.diagnosis)) {
    summary += `**Diagnosis:** ${analysis.diagnosis}\n\n`;
  }

  if (analysis.medications && analysis.medications.length > 0) {
    summary += '### Medications:\n';
    analysis.medications.forEach((med, i) => {
      summary += `${i + 1}. **${med.name}**`;
      if (isValid(med.dosage))    summary += ` — ${med.dosage}`;
      if (isValid(med.frequency)) summary += ` | ${med.frequency}`;
      if (isValid(med.duration))  summary += ` | ${med.duration}`;
      summary += '\n';
    });
    summary += '\n';
  }

  if (isValid(analysis.doctorName)) {
    summary += `**Doctor:** ${analysis.doctorName}\n`;
  }

  if (isValid(analysis.date)) {
    summary += `**Date:** ${analysis.date}\n`;
  }

  if (isValid(analysis.notes)) {
    summary += `\n**Notes:** ${analysis.notes}\n`;
  }

  summary += '\n---\n*I can answer questions about these medications, their interactions, or side effects. Just ask!*';
  summary += '\n\n⚠️ *Please consult a healthcare provider for proper medical advice.*';

  return summary;
};
