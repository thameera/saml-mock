import { v4 as uuidv4 } from 'uuid'

export const canonicalize = (xmlStr) => {
  // https://github.com/auth0/node-samlp/blob/54d8715926c3066074412138714ad362f5a5f0da/lib/samlp.js#L26-L30
  return xmlStr
    .replace(/\r\n/g, '')
    .replace(/\n/g, '')
    .replace(/>(\s*)</g, '><') //unindent
    .trim()
}

export const pemToCert = (pem) => {
  const cert =
    /-----BEGIN CERTIFICATE-----([^-]*)-----END CERTIFICATE-----/g.exec(
      pem.toString()
    )
  return cert[1].replace(/[\n|\r\n]/g, '')
}

export const generateId = () => uuidv4().replace(/-/g, '')

export const generateRedirectUrl = (baseUrl, data) => {
  const url = new URL(baseUrl)
  for (const [key, value] of Object.entries(data)) {
    url.searchParams.append(key, value)
  }
  return url.href
}
