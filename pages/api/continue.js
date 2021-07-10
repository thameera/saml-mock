import format from 'string-template'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { parseSamlRequest } from '../../lib/requestParser'
import { canonicalize } from '../../lib/utils'
import { sign } from '../../lib/signer'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(404)
  }

  const body = req.body

  const parsedReq = body.samlreq ? parseSamlRequest(body.samlreq) : {}
  if (parsedReq.error) {
    return res.status(400).json({ parsedReq })
  }

  const now = DateTime.now()
  const issueTime = now.toUTC().toISO()
  const expiryTime = now.plus({ days: 1 }).toUTC().toISO()

  const mappings = {
    id: uuidv4().replace(/-/g, ''),
    issueTime,
    expiryTime,
    issuer: body.issuer,
    redirectUrl: body.acsUrl,
    destination: body.acsUrl || parsedReq.destination,
    audience: body.aud,
    inResponseTo: parsedReq.id,
  }

  // Prepare assertion
  const assertion = format(body.assertion, mappings)
  const canonicalizedAssertion = canonicalize(assertion)
  const signedAssertion = sign(canonicalizedAssertion)

  mappings.assertion = signedAssertion

  // Prepare response
  const response = format(body.response, mappings)
  const canonicalizedResponse = canonicalize(response)

  res.status(200).json({
    SAMLResponse: Buffer.from(canonicalizedResponse).toString('base64'),
    RelayState: body.relayState,
    acsUrl: body.acsUrl,
  })
}
