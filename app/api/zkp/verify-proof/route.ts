import { createClient } from '@supabase/supabase-js';
import { verifyAgeProof } from '@/lib/zkp-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface VerifyProofRequest {
  proofId: string;
  identityData: {
    name: string;
    dateOfBirth: string;
    documentId: string;
    issuingCountry: string;
  };
}

export async function POST(request: Request) {
  try {
    const body: VerifyProofRequest = await request.json();
    const { proofId, identityData } = body;

    // Fetch proof from database
    const { data: proofRecord, error: fetchError } = await supabase
      .from('zk_proofs')
      .select('*')
      .eq('id', proofId)
      .single();

    if (fetchError || !proofRecord) {
      return Response.json(
        { error: 'Proof not found' },
        { status: 404 }
      );
    }

    const proof = JSON.parse(proofRecord.proof_data);

    // Verify the proof
    const isValid = verifyAgeProof(
      proof,
      identityData,
      proofRecord.salt
    );

    if (!isValid) {
      return Response.json(
        { error: 'Proof verification failed' },
        { status: 400 }
      );
    }

    // Update proof status
    await supabase
      .from('zk_proofs')
      .update({ status: 'verified' })
      .eq('id', proofId);

    return Response.json({
      success: true,
      isValid: true,
      proofId,
      minAge: proofRecord.min_age,
      timestamp: proof.ageVerification.timestamp,
      message: 'Proof verified successfully',
    });
  } catch (error) {
    console.error('Error verifying proof:', error);
    return Response.json(
      { error: 'Failed to verify proof' },
      { status: 500 }
    );
  }
}
