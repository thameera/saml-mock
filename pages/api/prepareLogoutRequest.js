import { DateTime } from 'luxon'
import format from 'string-template'
import zlib from 'zlib'
import { signPostLogoutRequest, signRedirectRequest } from '../../lib/signer'
import { canonicalize, generateId } from '../../lib/utils'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(404)
  }

  const body = req.body

  const mappings = {
    id: generateId(),
    issueTime: DateTime.now().toUTC().toISO(),
    logoutUrl: body.logoutUrl,
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
    const signedRequest = signPostLogoutRequest(
      canonicalizedRequest,
      body.sigOpts
    )
    const SAMLRequest = Buffer.from(signedRequest).toString('base64')

    const data = body.sendRelayState
      ? { SAMLRequest, RelayState: body.relayState }
      : { SAMLRequest }

    return res.json(data)
  }
}
