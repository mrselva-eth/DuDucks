import { createClient } from '@supabase/supabase-js';
import {
  generateAgeVerificationProof,
  generateSalt,
  hashDocument,
} from '@/lib/zkp-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface GenerateProofRequest {
  identityData: {
    name: string;
    dateOfBirth: string;
    documentId: string;
    issuingCountry: string;
  };
  minAge: number;
  userId: string;
  documentBuffer?: string; // Base64 encoded document
}

export async function POST(request: Request) {
  try {
    const body: GenerateProofRequest = await request.json();

    const { identityData, minAge, userId, documentBuffer } = body;

    // Generate salt for this proof
    const salt = generateSalt();

    // Generate ZK proof
    const proof = generateAgeVerificationProof(
      identityData,
      minAge,
      salt
    );

    if (!proof) {
      return Response.json(
        {
          error: 'Age verification failed. User does not meet minimum age requirement.',
        },
        { status: 400 }
      );
    }

    // Hash document if provided
    let documentHash = '';
    if (documentBuffer) {
      const buffer = Buffer.from(documentBuffer, 'base64');
      documentHash = hashDocument(buffer);
    }

    // Store proof in database
    const { data, error } = await supabase
      .from('zk_proofs')
      .insert({
        user_id: userId,
        proof_data: JSON.stringify(proof),
        proof_type: 'age_verification',
        min_age: minAge,
        salt,
        document_hash: documentHash || null,
        status: 'generated',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return Response.json(
        { error: 'Failed to store proof' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      proofId: data.id,
      proof,
      message: 'ZK proof generated successfully',
      publicInputs: proof.publicInputs,
    });
  } catch (error) {
    console.error('Error generating proof:', error);
    return Response.json(
      { error: 'Failed to generate proof' },
      { status: 500 }
    );
  }
}
