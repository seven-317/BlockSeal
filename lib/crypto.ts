// Browser-only: native Web Crypto API, no dependencies

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function fromB64url(s: string): ArrayBuffer {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf.buffer as ArrayBuffer
}

async function deriveWrappingKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 200_000, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['wrapKey', 'unwrapKey'],
  )
}

export interface SealResult {
  ciphertextBase64: string
  cipherHash: string
  shareFragment: string
}

export async function encryptMessage(plaintext: string, password?: string): Promise<SealResult> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoded = new TextEncoder().encode(plaintext)
  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded,
  )

  const hashBuf = await crypto.subtle.digest('SHA-256', cipherBuf)
  const cipherHash = Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  if (password) {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const kiv = crypto.getRandomValues(new Uint8Array(12))
    const wrappingKey = await deriveWrappingKey(password, salt)
    const wrappedKey = await crypto.subtle.wrapKey('raw', key, wrappingKey, { name: 'AES-GCM', iv: kiv })
    return {
      ciphertextBase64: b64url(cipherBuf),
      cipherHash,
      shareFragment: `k=${b64url(wrappedKey)}&iv=${b64url(iv.buffer as ArrayBuffer)}&salt=${b64url(salt.buffer as ArrayBuffer)}&kiv=${b64url(kiv.buffer as ArrayBuffer)}&pwd=1`,
    }
  }

  const rawKey = await crypto.subtle.exportKey('raw', key)
  return {
    ciphertextBase64: b64url(cipherBuf),
    cipherHash,
    shareFragment: `k=${b64url(rawKey)}&iv=${b64url(iv.buffer as ArrayBuffer)}`,
  }
}

export function fragmentNeedsPassword(fragment: string): boolean {
  const params = new URLSearchParams(fragment.replace(/^#/, ''))
  return params.get('pwd') === '1'
}

export async function decryptMessage(
  ciphertextBase64: string,
  fragment: string,
  password?: string,
): Promise<{ plaintext: string; verified: boolean; localHash: string }> {
  const params = new URLSearchParams(fragment.replace(/^#/, ''))
  const iv = new Uint8Array(fromB64url(params.get('iv')!))
  const cipherBuf = fromB64url(ciphertextBase64)

  const hashBuf = await crypto.subtle.digest('SHA-256', cipherBuf)
  const localHash = Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  let rawKey: ArrayBuffer
  if (params.get('pwd') === '1') {
    if (!password) throw new Error('需要密碼')
    const salt = new Uint8Array(fromB64url(params.get('salt')!))
    const kiv = new Uint8Array(fromB64url(params.get('kiv')!))
    const wrappingKey = await deriveWrappingKey(password, salt)
    const unwrapped = await crypto.subtle.unwrapKey(
      'raw', fromB64url(params.get('k')!), wrappingKey,
      { name: 'AES-GCM', iv: kiv }, { name: 'AES-GCM' }, false, ['decrypt'],
    ).catch(() => { throw new Error('密碼錯誤') })
    const key2 = unwrapped
    const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key2, cipherBuf)
    return { plaintext: new TextDecoder().decode(plainBuf), verified: true, localHash }
  }

  rawKey = fromB64url(params.get('k')!)
  const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['decrypt'])
  const plainBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBuf)
  return { plaintext: new TextDecoder().decode(plainBuf), verified: true, localHash }
}
