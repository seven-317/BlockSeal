import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, BUCKET } from '@/lib/supabase'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const sb = supabaseAdmin()

    // Mark opened
    await sb.from('seals').update({ opened_at: new Date().toISOString() }).eq('id', id)

    // Delete ciphertext from storage (read-once guarantee)
    await sb.storage.from(BUCKET).remove([`${id}.bin`])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[consume]', err)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
