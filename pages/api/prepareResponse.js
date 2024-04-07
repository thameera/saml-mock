import format from 'string-template'
import { DateTime } from 'luxon'
import { parseSamlRequest } from '../../lib/requestParser'
import { canonicalize, generateId } from '../../lib/utils'
import { signAssertion, signResponse } from '../../lib/signer'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(404)
  }

  const body = req.body

  const responseParams = { acsUrl: body.acsUrl }

  if (body.sendRelayState) {
    responseParams.RelayState = body.relayState
  }

  // If we are not sending the response, exit early
  if (!body.sendResponse) {
    return res.json(responseParams)
  }

  const parsedReq = body.samlreq ? parseSamlRequest(body.samlreq) : {}
  if (parsedReq.error) {
    return res.status(400).json({ parsedReq })
  }

  const now = DateTime.now()
  const issueTime = now.toUTC().toISO()
  const expiryTime = now.plus({ days: 1 }).toUTC().toISO()

  const mappings = {
    respId: generateId(),
    assertId: generateId(),
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
  mappings.assertion = signAssertion(canonicalizedAssertion, body.sigOpts)

  // Prepare response
  const response = format(body.response, mappings)
  const canonicalizedResponse = canonicalize(response)
  const finalResponseXml = signResponse(canonicalizedResponse, body.sigOpts)

  responseParams.SAMLResponse = Buffer.from(finalResponseXml).toString('base64')

  res.json(responseParams)
}
