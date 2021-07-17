import format from 'string-template'
import { DateTime } from 'luxon'
import zlib from 'zlib'
import { canonicalize, generateId } from '../../lib/utils'

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

  res.status(200).json({
    qs: {
      SAMLRequest,
      RelayState: body.relayState,
    },
  })
}
