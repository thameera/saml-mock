import { DateTime } from 'luxon'
import format from 'string-template'
import zlib from 'zlib'
import { parseLogoutRequest } from '../../lib/requestParser'
import {
  signPostLogoutResponse,
  signRedirectLogoutResponse,
} from '../../lib/signer'
import { canonicalize, generateId } from '../../lib/utils'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(404)
  }

  const body = req.body

  // If we are not sending the response, exit early
  if (!body.sendResponse) {
    return res.json(responseParams)
  }

  const parsedReq = body.logoutreq ? parseLogoutRequest(body.logoutreq) : {}
  if (parsedReq.error) {
    return res.status(400).json({ parsedReq })
  }

  const now = DateTime.now()
  const issueTime = now.toUTC().toISO()

  const mappings = {
    id: generateId(),
    issueTime,
    issuer: body.issuer,
    callbackUrl: body.callbackUrl,
    inResponseTo: parsedReq.id,
  }

  const response = format(body.response, mappings)
  const canonicalizedResponse = canonicalize(response)

  if (body.binding === 'redirect') {
    /* HTTP-Redirect */
    // https://github.com/auth0/node-samlp/blob/1d72b8034709cbe1ede5a4241cf79ee746026ae3/lib/logout.js#L343
    const deflated = zlib.deflateRawSync(Buffer.from(canonicalizedResponse))
    const SAMLResponse = deflated.toString('base64')

    const params = body.sendRelayState
      ? { SAMLResponse, RelayState: body.relayState }
      : { SAMLResponse }

    const qs = signRedirectLogoutResponse(params, body.sigOpts)

    return res.json(qs)
  } else {
    /* HTTP-POST */
    const finalResponseXml = signPostLogoutResponse(canonicalizedResponse, {
      ...body.sigOpts,
      logoutResponse: true,
    })

    const SAMLResponse = Buffer.from(finalResponseXml).toString('base64')

    const data = body.sendRelayState
      ? { SAMLResponse, RelayState: body.relayState }
      : { SAMLResponse }

    return res.json(data)
  }
}
