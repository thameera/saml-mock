import format from 'string-template'
import { DateTime } from 'luxon'
import zlib from 'zlib'
import { canonicalize, generateId } from '../../lib/utils'
import { signPostRequest, signRedirectRequest } from '../../lib/signer'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(404)
  }

  const body = req.body

  // If we are not sending the request, exit early
  if (!body.sendRequest) {
    if (!body.sendRelayState) {
      return res.json({})
    }
    return res.json({ RelayState: body.relayState })
  }

  const mappings = {
    id: generateId(),
    issueTime: DateTime.now().toUTC().toISO(),
    signinUrl: body.signinUrl,
    issuer: 'saml-mock',
  }

  const rawRequest = format(body.request, mappings)
  const canonicalizedRequest = canonicalize(rawRequest)

  if (body.binding === 'redirect') {
    /* HTTP-Redirect */
    const deflated = zlib.deflateRawSync(Buffer.from(canonicalizedRequest))
    const SAMLRequest = deflated.toString('base64')

    const params = body.sendRelayState
      ? { SAMLRequest, RelayState: body.relayState }
      : { SAMLRequest }

    const qs = signRedirectRequest(params, body.sigOpts)

    return res.json(qs)
  } else {
    /* HTTP-POST */
    const signedRequest = signPostRequest(canonicalizedRequest, body.sigOpts)
    const SAMLRequest = Buffer.from(signedRequest).toString('base64')

    const data = body.sendRelayState
      ? { SAMLRequest, RelayState: body.relayState }
      : { SAMLRequest }

    return res.json(data)
  }
}
