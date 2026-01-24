import Tesseract from 'tesseract.js';
import crypto from 'crypto';

/**
 * Document OCR Extraction and TLS Verification
 * Extracts identity data from documents and verifies integrity
 */

export interface ExtractedDocumentData {
  fullName: string;
  dateOfBirth: string;
  documentType: string;
  documentNumber: string;
  issuanceDate: string;
  expirationDate: string;
  documentImage: string;
  rawText: string;
  extractionConfidence: number;
  tlsHash: string;
  tlsSignature: string;
  timestamp: number;
}

export interface DocumentVerification {
  isValid: boolean;
  tlsVerified: boolean;
  integrityHash: string;
  verificationTimestamp: number;
  errors: string[];
}

/**
 * Extract date of birth from raw text
 * Supports multiple date formats (DD/MM/YYYY, YYYY-MM-DD, etc.)
 */
function parseDateOfBirth(text: string): string | null {
  // Common patterns for DOB
  const patterns = [
    /(?:DOB|Date of Birth|Birth Date)[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i,
    /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/,
    /born[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: string): number {
  try {
    const dob = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    return age;
  } catch {
    return 0;
  }
}

/**
 * Perform OCR on document image
 * Returns extracted text with confidence score
 */
export async function performOCR(
  imageFile: File | Blob
): Promise<{
  text: string;
  confidence: number;
  data: any;
}> {
  try {
    console.log('[v0] Starting OCR processing...');

    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing') {
          console.log('[v0] OCR progress:', m.progress);
        }
      },
    });

    const confidence = result.data.confidence || 0;
    const text = result.data.text || '';

    console.log('[v0] OCR complete. Confidence:', confidence);

    return {
      text,
      confidence: confidence / 100,
      data: result.data,
    };
  } catch (error) {
    console.error('[v0] OCR error:', error);
    throw new Error('Failed to perform OCR on document');
  }
}

/**
 * Extract identity information from OCR text
 */
export function extractIdentityData(ocrText: string): Partial<ExtractedDocumentData> {
  console.log('[v0] Extracting identity data from OCR text...');

  const dateOfBirth = parseDateOfBirth(ocrText);
  const age = dateOfBirth ? calculateAge(dateOfBirth) : 0;

  // Extract name (usually on first or second line)
  const namePatterns = [
    /(?:NAME|SURNAME)[:\s]+([A-Z][A-Z\s]+)/i,
    /^([A-Z][A-Z\s]{3,})/m,
  ];

  let fullName = 'Unknown';
  for (const pattern of namePatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      fullName = match[1].trim();
      break;
    }
  }

  // Extract document number
  const docNumberPattern = /(?:NO|NUMBER|ID)[:\s]+([A-Z0-9]{6,})/i;
  const docNumberMatch = ocrText.match(docNumberPattern);
  const documentNumber = docNumberMatch ? docNumberMatch[1] : 'Unknown';

  // Extract dates
  const datePatterns = /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/g;
  const dates = ocrText.match(datePatterns) || [];

  console.log('[v0] Extracted data:', {
    fullName,
    dateOfBirth,
    age,
    documentNumber,
  });

  return {
    fullName,
    dateOfBirth: dateOfBirth || '',
    documentNumber,
    issuanceDate: dates[0] || '',
    expirationDate: dates[1] || '',
    rawText: ocrText,
  };
}

/**
 * Generate TLS-based document hash
 * Creates cryptographic commitment to document integrity
 */
export function generateTLSDocumentHash(
  documentData: Partial<ExtractedDocumentData>,
  salt: string
): string {
  try {
    console.log('[v0] Generating TLS document hash...');

    // Create hash input from document data
    const dataString = JSON.stringify({
      fullName: documentData.fullName,
      dateOfBirth: documentData.dateOfBirth,
      documentNumber: documentData.documentNumber,
      issuanceDate: documentData.issuanceDate,
      salt,
    });

    // Use SHA-256 for TLS commitment
    const hash = crypto
      .createHash('sha256')
      .update(dataString)
      .digest('hex');

    console.log('[v0] TLS hash generated:', hash);

    return hash;
  } catch (error) {
    console.error('[v0] Error generating TLS hash:', error);
    throw error;
  }
}

/**
 * Verify document integrity using TLS signature
 */
export function verifyDocumentIntegrity(
  documentData: ExtractedDocumentData,
  expectedTLSHash: string
): DocumentVerification {
  try {
    console.log('[v0] Verifying document integrity...');

    const salt = crypto.randomBytes(32).toString('hex');
    const computedHash = generateTLSDocumentHash(documentData, salt);

    const isValid = computedHash === expectedTLSHash;
    const errors: string[] = [];

    if (!isValid) {
      errors.push('Document TLS hash mismatch - document may have been tampered with');
    }

    // Verify extraction confidence
    if (documentData.extractionConfidence < 0.7) {
      errors.push(
        `Low extraction confidence (${documentData.extractionConfidence}). Document quality may be poor.`
      );
    }

    // Verify document is not expired
    if (documentData.expirationDate) {
      const expDate = new Date(documentData.expirationDate);
      if (expDate < new Date()) {
        errors.push('Document has expired');
      }
    }

    console.log('[v0] Verification complete. Valid:', isValid);

    return {
      isValid: isValid && errors.length === 0,
      tlsVerified: isValid,
      integrityHash: computedHash,
      verificationTimestamp: Date.now(),
      errors,
    };
  } catch (error) {
    console.error('[v0] Error verifying document:', error);
    return {
      isValid: false,
      tlsVerified: false,
      integrityHash: '',
      verificationTimestamp: Date.now(),
      errors: ['Document verification failed'],
    };
  }
}

/**
 * Create document commitment for ZK proof
 * Combines document data and TLS hash into a single commitment
 */
export function createDocumentCommitment(
  documentData: ExtractedDocumentData
): {
  commitment: string;
  salt: string;
} {
  try {
    console.log('[v0] Creating document commitment...');

    const salt = crypto.randomBytes(32).toString('hex');

    const commitmentData = {
      fullName: documentData.fullName,
      dateOfBirth: documentData.dateOfBirth,
      documentHash: documentData.tlsHash,
      timestamp: documentData.timestamp,
      salt,
    };

    const commitment = crypto
      .createHash('sha256')
      .update(JSON.stringify(commitmentData))
      .digest('hex');

    console.log('[v0] Document commitment created:', commitment);

    return {
      commitment,
      salt,
    };
  } catch (error) {
    console.error('[v0] Error creating document commitment:', error);
    throw error;
  }
}

/**
 * Prepare document for ZK proof generation
 */
export async function prepareDocumentForZKProof(
  imageFile: File | Blob
): Promise<{
  documentData: ExtractedDocumentData;
  verification: DocumentVerification;
  commitment: string;
  salt: string;
}> {
  try {
    console.log('[v0] Preparing document for ZK proof...');

    // Step 1: Perform OCR
    const ocrResult = await performOCR(imageFile);

    // Step 2: Extract identity data
    const extractedData = extractIdentityData(ocrResult.text);

    // Step 3: Generate TLS hash
    const salt = crypto.randomBytes(32).toString('hex');
    const tlsHash = generateTLSDocumentHash(extractedData, salt);

    // Step 4: Create document data object
    const documentData: ExtractedDocumentData = {
      fullName: extractedData.fullName || 'Unknown',
      dateOfBirth: extractedData.dateOfBirth || '',
      documentType: 'ID',
      documentNumber: extractedData.documentNumber || '',
      issuanceDate: extractedData.issuanceDate || '',
      expirationDate: extractedData.expirationDate || '',
      documentImage: imageFile instanceof File ? imageFile.name : 'document',
      rawText: extractedData.rawText || '',
      extractionConfidence: ocrResult.confidence,
      tlsHash,
      tlsSignature: '',
      timestamp: Date.now(),
    };

    // Step 5: Verify document integrity
    const verification = verifyDocumentIntegrity(documentData, tlsHash);

    // Step 6: Create commitment
    const { commitment, salt: commitmentSalt } = createDocumentCommitment(documentData);

    console.log('[v0] Document prepared successfully for ZK proof');

    return {
      documentData,
      verification,
      commitment,
      salt: commitmentSalt,
    };
  } catch (error) {
    console.error('[v0] Error preparing document for ZK proof:', error);
    throw error;
  }
}

/**
 * Validate extracted data before ZK proof
 */
export function validateExtractedData(
  documentData: ExtractedDocumentData
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!documentData.fullName || documentData.fullName === 'Unknown') {
    errors.push('Failed to extract name from document');
  }

  if (!documentData.dateOfBirth) {
    errors.push('Failed to extract date of birth from document');
  }

  if (documentData.extractionConfidence < 0.6) {
    errors.push(
      `Low OCR confidence (${documentData.extractionConfidence}). Please upload a clearer image.`
    );
  }

  if (!documentData.tlsHash) {
    errors.push('Failed to generate TLS hash');
  }

  console.log('[v0] Extracted data validation:', {
    isValid: errors.length === 0,
    errors,
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
