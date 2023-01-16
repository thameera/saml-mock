import { DateTime } from 'luxon'
import format from 'string-template'
import { parseLogoutRequest } from '../../lib/requestParser'
import { signResponse } from '../../lib/signer'
import { canonicalize, generateId } from '../../lib/utils'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(404)
  }

  const body = req.body

  const responseParams = { callbackUrl: body.callbackUrl }

  if (body.sendRelayState) {
    responseParams.RelayState = body.relayState
  }

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
  const finalResponseXml = signResponse(canonicalizedResponse, {
    ...body.sigOpts,
    logoutResponse: true,
  })

  responseParams.SAMLResponse = Buffer.from(finalResponseXml).toString('base64')

  res.json(responseParams)
}
