import { parseSamlRequest } from '../../lib/requestParser'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(404)
  }

  const body = req.body
  console.log(body)

  const parsedReq = body.samlreq ? parseSamlRequest(body.samlreq) : {}
  console.log(parsedReq)
  if (parsedReq.error) {
    return res.status(400).json({ parsedReq })
  }

  res.status(200).json({ name: 'John Doe' })
}
