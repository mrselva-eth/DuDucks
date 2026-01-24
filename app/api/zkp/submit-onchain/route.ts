import { createClient } from '@supabase/supabase-js';
import { createOnChainProofData } from '@/lib/zkp-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

interface SubmitOnChainRequest {
  proofId: string;
  userAddress: string;
  txHash?: string;
}

export async function POST(request: Request) {
  try {
    const body: SubmitOnChainRequest = await request.json();
    const { proofId, userAddress, txHash } = body;

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

    if (proofRecord.status !== 'verified') {
      return Response.json(
        { error: 'Proof must be verified before on-chain submission' },
        { status: 400 }
      );
    }

    const proof = JSON.parse(proofRecord.proof_data);

    // Create on-chain proof data
    const onChainData = createOnChainProofData(proof, userAddress);

    // Store on-chain submission record
    const { data: onChainRecord, error: insertError } = await supabase
      .from('on_chain_proofs')
      .insert({
        zk_proof_id: proofId,
        user_address: userAddress,
        proof_data: JSON.stringify(onChainData),
        tx_hash: txHash || null,
        status: txHash ? 'submitted' : 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return Response.json(
        { error: 'Failed to store on-chain record' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      onChainProofId: onChainRecord.id,
      proofData: onChainData,
      message: 'Proof ready for on-chain submission',
      submissionData: {
        commitment: onChainData.commitment,
        hashedAge: onChainData.hashedAge,
        timestamp: onChainData.timestamp,
        proofSignature: onChainData.proofSignature,
      },
    });
  } catch (error) {
    console.error('Error submitting proof on-chain:', error);
    return Response.json(
      { error: 'Failed to submit proof' },
      { status: 500 }
    );
  }
}
