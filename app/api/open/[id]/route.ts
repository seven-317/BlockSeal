import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, BUCKET } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const sb = supabaseAdmin()

    // Fetch metadata
    const { data: seal, error: dbErr } = await sb
      .from('seals')
      .select('cipher_hash, tx_hash, opened_at, expires_at, read_once, created_at')
      .eq('id', id)
      .single()

    if (dbErr || !seal) {
      return NextResponse.json({ error: 'not found' }, { status: 404 })
    }

    // Guard: already consumed
    if (seal.read_once && seal.opened_at) {
      return NextResponse.json({ error: 'already opened' }, { status: 410 })
    }

    // Guard: expired
    if (seal.expires_at && new Date(seal.expires_at) < new Date()) {
      return NextResponse.json({ error: 'expired' }, { status: 410 })
    }

    // Download ciphertext
    const { data: fileData, error: dlErr } = await sb.storage
      .from(BUCKET)
      .download(`${id}.bin`)

    if (dlErr || !fileData) {
      return NextResponse.json({ error: 'ciphertext missing' }, { status: 404 })
    }

    const arrayBuf = await fileData.arrayBuffer()
    const b64 = Buffer.from(arrayBuf).toString('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

    return NextResponse.json({
      ciphertextBase64: b64,
      cipherHash: seal.cipher_hash,
      txHash: seal.tx_hash,
      sealedAt: seal.created_at,
    })
  } catch (err) {
    console.error('[open]', err)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
