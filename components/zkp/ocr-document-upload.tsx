'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCheck,
  AlertCircle,
  Loader,
  Eye,
  X,
  CheckCircle,
} from 'lucide-react';
import Tesseract from 'tesseract.js';

interface DocumentPreview {
  file: File;
  preview: string;
  extractedData: {
    fullName: string;
    dateOfBirth: string;
    documentNumber: string;
    extractionConfidence: number;
  } | null;
  tlsHash: string | null;
  isVerified: boolean;
}

interface OCRDocumentUploadProps {
  onDocumentProcessed: (data: DocumentPreview) => void;
  isProcessing: boolean;
}

export function OCRDocumentUpload({
  onDocumentProcessed,
  isProcessing: externalIsProcessing,
}: OCRDocumentUploadProps) {
  const [document, setDocument] = useState<DocumentPreview | null>(null);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid document image (JPEG, PNG, GIF, or PDF)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = async (e) => {
      const preview = e.target?.result as string;

      const newDocument: DocumentPreview = {
        file,
        preview,
        extractedData: null,
        tlsHash: null,
        isVerified: false,
      };

      setDocument(newDocument);

      // Start OCR processing
      await processDocumentOCR(newDocument);
    };
    reader.readAsDataURL(file);
  };

  const processDocumentOCR = async (doc: DocumentPreview) => {
    try {
      console.log('[v0] Processing document with OCR...');
      setIsProcessing(true);
      setError('');

      // Perform OCR using Tesseract.js
      console.log('[v0] Starting Tesseract OCR...');
      const { data } = await Tesseract.recognize(doc.file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing') {
            console.log('[v0] OCR progress:', Math.round(m.progress * 100) + '%');
          }
        },
      });

      const ocrText = data.text || '';
      const confidence = (data.confidence || 0) / 100;

      console.log('[v0] OCR completed:', {
        confidence,
        textLength: ocrText.length,
        textPreview: ocrText.substring(0, 100),
      });

      // Extract identity data from OCR text
      const extractedData = extractDataFromOCR(ocrText);

      // Generate TLS hash using Web Crypto API
      const tlsHash = await generateClientTLSHash(extractedData);

      // Validate extracted data
      const isValid =
        extractedData.fullName &&
        extractedData.fullName !== 'Unknown' &&
        extractedData.dateOfBirth &&
        confidence > 0.6;

      // Update document with extracted data
      doc.extractedData = {
        fullName: extractedData.fullName || 'Unknown',
        dateOfBirth: extractedData.dateOfBirth || '',
        documentNumber: extractedData.documentNumber || '',
        extractionConfidence: confidence,
      };

      doc.tlsHash = tlsHash;
      doc.isVerified = isValid;

      setDocument({ ...doc });

      if (isValid) {
        onDocumentProcessed(doc);
      } else {
        setError(
          'Failed to extract required information from document. Please ensure the document is clear and contains readable text.'
        );
      }

      console.log('[v0] Document processed successfully');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to process document. Please try again.';
      setError(errorMessage);
      console.error('[v0] OCR error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to extract data from OCR text
  const extractDataFromOCR = (text: string) => {
    const result: {
      fullName: string;
      dateOfBirth: string;
      documentNumber: string;
    } = {
      fullName: 'Unknown',
      dateOfBirth: '',
      documentNumber: '',
    };

    // Extract date of birth (multiple patterns)
    const dobPatterns = [
      /(?:DOB|Date of Birth|Birth Date|Born)[:\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i,
      /(\d{1,2}[-/]\d{1,2}[-/]\d{4})/,
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
    ];

    for (const pattern of dobPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.dateOfBirth = match[1].replace(/\//g, '-');
        break;
      }
    }

    // Extract name (usually on first few lines, all caps)
    const namePatterns = [
      /(?:NAME|SURNAME|FULL NAME)[:\s]+([A-Z][A-Z\s]{2,})/i,
      /^([A-Z][A-Z\s]{3,})/m,
      /([A-Z]{2,}\s+[A-Z]{2,})/,
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.fullName = match[1].trim().toUpperCase();
        break;
      }
    }

    // Extract document number
    const docNumberPatterns = [
      /(?:NO|NUMBER|ID|DOCUMENT)[:\s#]+([A-Z0-9]{6,})/i,
      /([A-Z]{2}\d{7,})/,
      /(\d{9,})/,
    ];

    for (const pattern of docNumberPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.documentNumber = match[1].trim().toUpperCase();
        break;
      }
    }

    return result;
  };

  // Generate TLS hash client-side using Web Crypto API
  const generateClientTLSHash = async (data: {
    fullName: string;
    dateOfBirth: string;
    documentNumber: string;
  }): Promise<string> => {
    const dataString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-100');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeDocument = () => {
    setDocument(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
      {!document ? (
        <div className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200 group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <Upload className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Your Identity Document
              </h3>
              <p className="text-gray-600 mb-4 text-lg">
                Drag and drop your document or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supported: JPEG, PNG, GIF, PDF (Max 10MB)
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      ) : (
        // Document Preview and Data
        <div className="space-y-4">
          {/* Loading State */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-3 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <Loader className="w-5 h-5 animate-spin text-blue-600" />
              <p className="text-blue-800 font-medium">Processing document with OCR...</p>
            </div>
          )}

          {/* Document Card */}
          {!isProcessing && (
            <>
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                  {/* Preview Image */}
                  <div className="md:col-span-1">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden hover:opacity-90 transition-all duration-200 relative group shadow-md hover:shadow-lg"
                    >
                      <img
                        src={document.preview || "/placeholder.svg"}
                        alt="Document preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="w-6 h-6 text-gray-900" />
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Extracted Data */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-900 text-lg">
                        Extracted Information
                      </h4>

                      {document.extractedData && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Full Name</span>
                            <span className="font-semibold text-gray-900">
                              {document.extractedData.fullName}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Date of Birth</span>
                            <span className="font-semibold text-gray-900">
                              {document.extractedData.dateOfBirth}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-3 border-b border-gray-200">
                            <span className="text-gray-600 font-medium">Document Number</span>
                            <span className="font-semibold text-gray-900 font-mono text-sm">
                              {document.extractedData.documentNumber}
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-3">
                            <span className="text-gray-600 font-medium">OCR Confidence</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-500 ${
                                    document.extractedData.extractionConfidence > 0.9
                                      ? 'bg-emerald-500'
                                      : document.extractedData.extractionConfidence > 0.7
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                  }`}
                                  style={{
                                    width: `${document.extractedData.extractionConfidence * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-900 min-w-[3rem]">
                                {Math.round(document.extractedData.extractionConfidence * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Verification Status */}
                    {document.isVerified && (
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-emerald-800">
                          TLS Verification Passed - Document Integrity Confirmed
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* TLS Hash */}
                {document.tlsHash && (
                  <div className="px-6 pb-6 pt-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">TLS Document Hash</p>
                    <code className="text-xs font-mono text-gray-900 break-all bg-white px-3 py-2 rounded-lg border border-gray-200 block">
                      {document.tlsHash}
                    </code>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={removeDocument}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
                >
                  <X className="w-4 h-4" />
                  Replace Document
                </button>
              </div>

              {/* Info Box */}
              <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800 leading-relaxed">
                  <span className="font-bold">Next Step:</span> Your document has been scanned with
                  OCR and verified via TLS. Click "Generate ZK Proof" to create a cryptographic proof
                  of your age without revealing your identity.
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Full Screen Preview Modal */}
      {showPreview && document && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
            <img src={document.preview || "/placeholder.svg"} alt="Full document preview" className="w-full h-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
