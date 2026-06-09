import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, BUCKET } from '@/lib/supabase'
import { sealOnChain } from '@/lib/chain'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { ciphertextBase64, cipherHash } = await req.json()

    if (!ciphertextBase64 || !cipherHash) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }

    const id = randomUUID()
    const sb = supabaseAdmin()

    // 1. Store ciphertext in Supabase Storage
    const buf = Buffer.from(
      ciphertextBase64.replace(/-/g, '+').replace(/_/g, '/'),
      'base64',
    )
    const { error: uploadErr } = await sb.storage
      .from(BUCKET)
      .upload(`${id}.bin`, buf, { contentType: 'application/octet-stream' })

    if (uploadErr) throw uploadErr

    // 2. Write integrity hash to Sepolia
    const txHash = await sealOnChain(id, cipherHash)

    // 3. Record metadata
    const { error: dbErr } = await sb.from('seals').insert({
      id,
      tx_hash: txHash,
      cipher_hash: cipherHash,
      read_once: true,
    })
    if (dbErr) throw dbErr

    return NextResponse.json({ id, txHash })
  } catch (err) {
    console.error('[seal]', err)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
