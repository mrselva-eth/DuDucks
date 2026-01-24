'use client';

import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';

interface DocumentUploadProps {
  onUpload: (data: {
    name: string;
    dateOfBirth: string;
    documentId: string;
    issuingCountry: string;
    documentBuffer: string;
  }) => void;
  isLoading: boolean;
}

export function DocumentUpload({ onUpload, isLoading }: DocumentUploadProps) {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    documentId: '',
    issuingCountry: 'US',
  });

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'upload' | 'confirm'>('input');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setError('Please upload an image or PDF document');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setDocumentFile(file);

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview('PDF Document');
    }

    setError('');
    setStep('confirm');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (
      !formData.name ||
      !formData.dateOfBirth ||
      !formData.documentId ||
      !documentFile
    ) {
      setError('Please fill in all fields and upload a document');
      return;
    }

    // Validate date
    const birthDate = new Date(formData.dateOfBirth);
    if (isNaN(birthDate.getTime())) {
      setError('Invalid date of birth');
      return;
    }

    if (birthDate > new Date()) {
      setError('Date of birth cannot be in the future');
      return;
    }

    try {
      // Convert document to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        onUpload({
          ...formData,
          documentBuffer: base64,
        });
      };
      reader.readAsDataURL(documentFile);
    } catch (err) {
      setError('Failed to process document');
      console.error(err);
    }
  };

  const countries = [
    'US',
    'UK',
    'CA',
    'AU',
    'DE',
    'FR',
    'JP',
    'IN',
    'BR',
    'MX',
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        {(step === 'input' || step === 'confirm') && (
          <div className="space-y-4 p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold">Personal Information</h3>

            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                disabled={isLoading || step === 'confirm'}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={isLoading || step === 'confirm'}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Issuing Country
                </label>
                <select
                  name="issuingCountry"
                  value={formData.issuingCountry}
                  onChange={handleInputChange}
                  disabled={isLoading || step === 'confirm'}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Document ID
              </label>
              <input
                type="text"
                name="documentId"
                value={formData.documentId}
                onChange={handleInputChange}
                placeholder="Passport or ID number"
                disabled={isLoading || step === 'confirm'}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>
          </div>
        )}

        {/* Document Upload */}
        {step !== 'confirm' && (
          <div className="p-6 bg-card rounded-lg border">
            <label className="block">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg hover:bg-accent/50 cursor-pointer transition">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <span className="text-sm font-medium">
                  Upload Identity Document
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, or PDF (Max 10MB)
                </span>
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Document Preview */}
        {step === 'confirm' && preview && (
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-sm font-semibold mb-3">Document Preview</h3>
            {typeof preview === 'string' && preview.startsWith('data:') ? (
              <img
                src={preview || "/placeholder.svg"}
                alt="Document preview"
                className="max-w-full h-auto rounded border"
              />
            ) : (
              <div className="p-4 bg-muted rounded text-center text-sm">
                {preview}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setDocumentFile(null);
                setPreview('');
                setStep('input');
              }}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Change Document
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Privacy Notice:</strong> Your document will be hashed and
            used to generate a zero-knowledge proof. Your actual identity
            information will never be revealed on-chain.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {step === 'confirm' && (
            <button
              type="button"
              onClick={() => setStep('input')}
              className="px-6 py-2 border rounded-lg hover:bg-accent"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !documentFile}
            className="flex-1 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Generating Proof...' : 'Generate ZK Proof'}
          </button>
        </div>
      </form>
    </div>
  );
}
