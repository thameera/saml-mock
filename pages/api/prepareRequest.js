import format from 'string-template'
import { DateTime } from 'luxon'
import zlib from 'zlib'
import { canonicalize, generateId } from '../../lib/utils'
import { signRedirectRequest } from '../../lib/signer'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(404)
  }

  const body = req.body

  const mappings = {
    id: generateId(),
    issueTime: DateTime.now().toUTC().toISO(),
    signinUrl: body.signinUrl,
    issuer: 'saml-mock',
  }

  const rawRequest = format(body.request, mappings)
  const canonicalizedRequest = canonicalize(rawRequest)
  const deflated = zlib.deflateRawSync(Buffer.from(canonicalizedRequest))
  const SAMLRequest = deflated.toString('base64')

  const params = {
    SAMLRequest,
    RelayState: body.relayState,
  }

  const qs = signRedirectRequest(params, { algo: 'rsa-sha1' })

  res.status(200).json({
    qs,
  })
}
