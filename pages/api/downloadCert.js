import { cert } from '../../lib/certs'

export default function handler(req, res) {
  const buf = Buffer.from(cert)
  res.setHeader('Content-Type', 'application/octet-stream')
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="mock-idp-cert.pem'
  )
  res.send(buf)
}
