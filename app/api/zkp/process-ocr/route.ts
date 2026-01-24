import { NextRequest, NextResponse } from 'next/server';
import {
  performOCR,
  extractIdentityData,
  generateTLSDocumentHash,
  calculateAge,
} from '@/lib/ocr-utils';
import crypto from 'crypto';

/**
 * POST /api/zkp/process-ocr
 *
 * Process document with OCR and extract identity information
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[v0] OCR processing request received');

    const formData = await request.formData();
    const documentFile = formData.get('document') as File;

    if (!documentFile) {
      return NextResponse.json(
        { error: 'Document file is required' },
        { status: 400 }
      );
    }

    console.log('[v0] Processing document with OCR...', {
      name: documentFile.name,
      type: documentFile.type,
      size: documentFile.size,
    });

    // Convert File to Buffer for server-side processing
    const arrayBuffer = await documentFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 1: Perform OCR
    console.log('[v0] Step 1: Performing OCR...');
    const ocrResult = await performOCR(documentFile);

    console.log('[v0] OCR completed:', {
      confidence: ocrResult.confidence,
      textLength: ocrResult.text.length,
    });

    // Step 2: Extract identity data
    console.log('[v0] Step 2: Extracting identity data...');
    const extractedData = extractIdentityData(ocrResult.text);

    console.log('[v0] Extracted data:', {
      fullName: extractedData.fullName,
      dateOfBirth: extractedData.dateOfBirth,
      documentNumber: extractedData.documentNumber,
    });

    // Step 3: Generate TLS hash
    const salt = crypto.randomBytes(32).toString('hex');
    const tlsHash = generateTLSDocumentHash(extractedData, salt);

    // Step 4: Calculate age if DOB is available
    let age = 0;
    if (extractedData.dateOfBirth) {
      age = calculateAge(extractedData.dateOfBirth);
    }

    // Step 5: Verify document is valid
    const isValid =
      extractedData.fullName &&
      extractedData.fullName !== 'Unknown' &&
      extractedData.dateOfBirth &&
      ocrResult.confidence > 0.6;

    return NextResponse.json(
      {
        success: true,
        extractedData: {
          fullName: extractedData.fullName || 'Unknown',
          dateOfBirth: extractedData.dateOfBirth || '',
          documentNumber: extractedData.documentNumber || '',
          extractionConfidence: ocrResult.confidence,
        },
        tlsHash,
        age,
        isValid,
        rawText: ocrResult.text.substring(0, 500), // Limit raw text size
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] OCR processing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process document with OCR',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

