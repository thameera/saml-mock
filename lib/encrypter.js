import crypto from 'crypto'

// Keyed by the short name used in the UI. Lengths in bytes. CBC has no
// integrity guarantee (xmlenc 1.1 6.1.1) but is kept for legacy peers.
const DATA_ENCRYPTION_ALGORITHMS = {
  'aes128-cbc': {
    uri: 'http://www.w3.org/2001/04/xmlenc#aes128-cbc',
    cipher: 'aes-128-cbc',
    keyLength: 16,
    ivLength: 16,
    gcm: false,
  },
  'aes256-cbc': {
    uri: 'http://www.w3.org/2001/04/xmlenc#aes256-cbc',
    cipher: 'aes-256-cbc',
    keyLength: 32,
    ivLength: 16,
    gcm: false,
  },
  'aes128-gcm': {
    uri: 'http://www.w3.org/2009/xmlenc11#aes128-gcm',
    cipher: 'aes-128-gcm',
    keyLength: 16,
    ivLength: 12,
    gcm: true,
  },
  'aes256-gcm': {
    uri: 'http://www.w3.org/2009/xmlenc11#aes256-gcm',
    cipher: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 12,
    gcm: true,
  },
}

const DEFAULT_DATA_ENCRYPTION_ALGORITHM = 'aes256-gcm'

const KEY_ENCRYPTION_ALGORITHMS = {
  'rsa-1_5': 'http://www.w3.org/2001/04/xmlenc#rsa-1_5',
  'rsa-oaep-mgf1p': 'http://www.w3.org/2001/04/xmlenc#rsa-oaep-mgf1p',
  // Carries an explicit <MGF> element, so MGF1 is not pinned to SHA-1.
  'rsa-oaep': 'http://www.w3.org/2009/xmlenc11#rsa-oaep',
}

const DIGEST_ALGORITHMS = {
  sha1: 'http://www.w3.org/2000/09/xmldsig#sha1',
  sha256: 'http://www.w3.org/2001/04/xmlenc#sha256',
  sha512: 'http://www.w3.org/2001/04/xmlenc#sha512',
}

// XML Encryption 1.1 5.5.2.
const MGF_ALGORITHMS = {
  sha1: 'http://www.w3.org/2009/xmlenc11#mgf1sha1',
  sha256: 'http://www.w3.org/2009/xmlenc11#mgf1sha256',
  sha512: 'http://www.w3.org/2009/xmlenc11#mgf1sha512',
}

const getPublicKey = (pem) => {
  if (pem.includes('BEGIN CERTIFICATE')) {
    return new crypto.X509Certificate(pem).publicKey
  }
  return crypto.createPublicKey(pem)
}

// RFC 8017 B.2.1.
const mgf1 = (seed, length, hash) => {
  const hLen = crypto.createHash(hash).digest().length
  const out = Buffer.alloc(Math.ceil(length / hLen) * hLen)
  const counter = Buffer.alloc(4)

  for (let i = 0; i * hLen < length; i++) {
    counter.writeUInt32BE(i, 0)
    crypto
      .createHash(hash)
      .update(seed)
      .update(counter)
      .digest()
      .copy(out, i * hLen)
  }

  return out.subarray(0, length)
}

const xor = (a, b) => {
  const out = Buffer.allocUnsafe(a.length)
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i] ^ b[i]
  }
  return out
}

// The OAEP label, carried as base64 in <xenc:OAEPparams>. Decoded here so the
// element and the ciphertext can never disagree about the bytes used.
const resolveOaepLabel = (opts) => {
  if (!opts.oaepParams) {
    return Buffer.alloc(0)
  }

  const b64 = opts.oaepParams.trim()
  if (b64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) {
    throw new Error(`oaepParams must be base64: ${opts.oaepParams}`)
  }

  return Buffer.from(b64, 'base64')
}

// EME-OAEP encode (RFC 8017 7.1.1) plus a raw RSA op, so the two digests can
// differ -- Node's `oaepHash` sets both. hLen and lHash come from the message
// digest, both masks from the MGF1 digest.
const encryptWithOaep = (key, publicKey, oaepDigest, mgf1Digest, label) => {
  const k = Math.ceil(publicKey.asymmetricKeyDetails.modulusLength / 8)
  const hLen = crypto.createHash(oaepDigest).digest().length

  if (key.length > k - 2 * hLen - 2) {
    throw new Error(
      `symmetric key of ${key.length} bytes is too long to wrap with ` +
        `${oaepDigest} OAEP under a ${k * 8}-bit key`
    )
  }

  const lHash = crypto.createHash(oaepDigest).update(label).digest()
  const db = Buffer.concat([
    lHash,
    Buffer.alloc(k - key.length - 2 * hLen - 2),
    Buffer.from([0x01]),
    key,
  ])
  const seed = crypto.randomBytes(hLen)
  const maskedDb = xor(db, mgf1(seed, db.length, mgf1Digest))
  const maskedSeed = xor(seed, mgf1(maskedDb, hLen, mgf1Digest))

  // Leading zero keeps the encoded message below the modulus.
  const em = Buffer.concat([Buffer.alloc(1), maskedSeed, maskedDb])

  return crypto.publicEncrypt(
    { key: publicKey, padding: crypto.constants.RSA_NO_PADDING },
    em
  )
}

// rsa-oaep-mgf1p pins MGF1 to SHA-1 (xmlenc 1.1 5.5.2); `forceMgf1Mismatch`
// breaks that on purpose, reproducing what Node's crypto emits by default.
const resolveMgf1Digest = (opts) => {
  const oaepDigest = opts.oaepDigestAlgo || 'sha1'

  if (opts.keyEncryptionAlgo === 'rsa-oaep') {
    return opts.mgf1DigestAlgo || 'sha1'
  }
  if (opts.forceMgf1Mismatch) {
    return oaepDigest
  }
  return 'sha1'
}

const encryptSymmetricKey = (key, opts) => {
  const publicKey = getPublicKey(opts.encryptionCert)

  if (opts.keyEncryptionAlgo === 'rsa-1_5') {
    return crypto.publicEncrypt(
      { key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
      key
    )
  }

  const oaepDigest = opts.oaepDigestAlgo || 'sha1'
  const mgf1Digest = resolveMgf1Digest(opts)
  const label = resolveOaepLabel(opts)

  // Matching digests: let OpenSSL do the padding. Only a mismatch needs ours.
  if (oaepDigest === mgf1Digest) {
    return crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: oaepDigest,
        ...(label.length ? { oaepLabel: label } : {}),
      },
      key
    )
  }

  return encryptWithOaep(key, publicKey, oaepDigest, mgf1Digest, label)
}

const buildKeyEncryptionMethod = (opts) => {
  if (opts.keyEncryptionAlgo === 'rsa-1_5') {
    return `<xenc:EncryptionMethod Algorithm="${KEY_ENCRYPTION_ALGORITHMS['rsa-1_5']}"/>`
  }

  const oaepDigest = opts.oaepDigestAlgo || 'sha1'
  const digestUri = DIGEST_ALGORITHMS[oaepDigest]
  if (!digestUri) {
    throw new Error(`unsupported OAEP digest algorithm: ${oaepDigest}`)
  }

  const algorithmUri = KEY_ENCRYPTION_ALGORITHMS[opts.keyEncryptionAlgo]
  if (!algorithmUri) {
    throw new Error(
      `unsupported key encryption algorithm: ${opts.keyEncryptionAlgo}`
    )
  }

  // Re-encoded from the decoded label, so it always matches the ciphertext.
  const label = resolveOaepLabel(opts)
  const oaepParamsElement = label.length
    ? `<xenc:OAEPparams>${label.toString('base64')}</xenc:OAEPparams>`
    : ''

  // <MGF> MUST NOT appear under rsa-oaep-mgf1p, so a mismatched mgf1p document
  // has no way to advertise its MGF1 digest -- hence undecryptable elsewhere.
  let mgfElement = ''
  if (opts.keyEncryptionAlgo === 'rsa-oaep') {
    const mgf1Digest = resolveMgf1Digest(opts)
    const mgfUri = MGF_ALGORITHMS[mgf1Digest]
    if (!mgfUri) {
      throw new Error(`unsupported MGF1 digest algorithm: ${mgf1Digest}`)
    }
    mgfElement = `<xenc11:MGF xmlns:xenc11="http://www.w3.org/2009/xmlenc11#" Algorithm="${mgfUri}"/>`
  }

  // OAEPparams precedes the <any> children (MGF, DigestMethod) per the xmlenc
  // EncryptionMethodType schema.
  return (
    `<xenc:EncryptionMethod Algorithm="${algorithmUri}">` +
    oaepParamsElement +
    mgfElement +
    `<ds:DigestMethod xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Algorithm="${digestUri}"/>` +
    `</xenc:EncryptionMethod>`
  )
}

export const encryptAssertion = (assertionXml, opts) => {
  if (!opts || !opts.encryptAssertion) {
    return assertionXml
  }

  const dataAlgoName =
    opts.dataEncryptionAlgo || DEFAULT_DATA_ENCRYPTION_ALGORITHM
  const dataAlgo = DATA_ENCRYPTION_ALGORITHMS[dataAlgoName]
  if (!dataAlgo) {
    throw new Error(`unsupported data encryption algorithm: ${dataAlgoName}`)
  }

  // Per xmlenc the IV/nonce is prepended, and for GCM the 16-byte tag appended.
  const key = crypto.randomBytes(dataAlgo.keyLength)
  const iv = crypto.randomBytes(dataAlgo.ivLength)
  const cipher = crypto.createCipheriv(dataAlgo.cipher, key, iv)
  const ciphertext = Buffer.concat([
    cipher.update(assertionXml, 'utf8'),
    cipher.final(),
  ])
  const encryptedData = Buffer.concat([
    iv,
    ciphertext,
    dataAlgo.gcm ? cipher.getAuthTag() : Buffer.alloc(0),
  ]).toString('base64')

  // First, so a bad algorithm fails before we spend the RSA operation.
  const keyEncryptionMethod = buildKeyEncryptionMethod(opts)

  const encryptedKey = encryptSymmetricKey(key, opts).toString('base64')

  return (
    `<saml:EncryptedAssertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">` +
    `<xenc:EncryptedData xmlns:xenc="http://www.w3.org/2001/04/xmlenc#" Type="http://www.w3.org/2001/04/xmlenc#Element">` +
    `<xenc:EncryptionMethod Algorithm="${dataAlgo.uri}"/>` +
    `<ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">` +
    `<xenc:EncryptedKey>` +
    keyEncryptionMethod +
    `<xenc:CipherData><xenc:CipherValue>${encryptedKey}</xenc:CipherValue></xenc:CipherData>` +
    `</xenc:EncryptedKey>` +
    `</ds:KeyInfo>` +
    `<xenc:CipherData><xenc:CipherValue>${encryptedData}</xenc:CipherValue></xenc:CipherData>` +
    `</xenc:EncryptedData>` +
    `</saml:EncryptedAssertion>`
  )
}
