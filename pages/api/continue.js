import { parseSamlRequest } from '../../lib/requestParser'
import format from 'string-template'
import { DateTime } from 'luxon'
import { canonicalize } from '../../lib/utils'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(404)
  }

  const body = req.body

  const parsedReq = body.samlreq ? parseSamlRequest(body.samlreq) : {}
  if (parsedReq.error) {
    return res.status(400).json({ parsedReq })
  }

  // Date prep
  const now = DateTime.now()
  const issueTime = now.toUTC().toISO()
  const expiryTime = now.plus({ days: 1 }).toUTC().toISO()

  const mappings = {
    issueTime,
    expiryTime,
    issuer: 'saml-mock',
    redirectUrl: body.acsUrl,
    destination: body.acsUrl || parsedReq.destination,
    audience: body.aud,
    inResponseTo: parsedReq.id,
  }

  const assertion = format(body.assertion, mappings)
  const canonicalizedAssertion = canonicalize(assertion)
  console.log(canonicalizedAssertion)

  res.status(200).json({ name: 'John Doe' })
}
