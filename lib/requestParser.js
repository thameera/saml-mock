import xmldom from 'xmldom'
import xpath from 'xpath'
import zlib from 'zlib'

const _parseDOM = (req) => {
  if (!req) return {}

  try {
    const input = Buffer.from(req, 'base64')

    // Source: https://github.com/auth0/node-samlp/blob/54d8715926c3066074412138714ad362f5a5f0da/lib/utils.js#L93
    if (input[0] === 60) {
      // content is just encoded, not zipped
      const xml = new xmldom.DOMParser().parseFromString(input.toString())
      if (!xml || !xml.documentElement) {
        return { error: 'Invalid SAML Request' }
      }

      return xml
    } else {
      let buf = null

      try {
        buf = zlib.inflateRawSync(input)
      } catch (e) {
        console.log(e)
        return { error: 'Error inflating SAML Request' }
      }

      const xml = new xmldom.DOMParser().parseFromString(buf.toString())
      if (!xml || !xml.documentElement) {
        return { error: 'Invalid SAML Request' }
      }

      return xml
    }
  } catch (e) {
    console.log(e)
    return { error: 'Error parsing the SAML request' }
  }
}

export const parseSamlRequest = (req) => {
  const dom = _parseDOM(req)
  if (dom.error) {
    return dom
  }

  const data = {}

  // Source: https://github.com/auth0/node-samlp/blob/54d8715926c3066074412138714ad362f5a5f0da/lib/samlp.js#L229
  const issuer = xpath.select(
    "//*[local-name(.)='Issuer' and namespace-uri(.)='urn:oasis:names:tc:SAML:2.0:assertion']/text()",
    dom
  )
  if (issuer && issuer.length > 0) data.issuer = issuer[0].textContent

  const subject = xpath.select(
    "//*[local-name(.)='Subject' and namespace-uri(.)='urn:oasis:names:tc:SAML:2.0:assertion']/*[local-name(.)='NameID']",
    dom
  )
  if (subject && subject.length > 0) data.subject = subject[0].textContent

  const acsUrl = dom.documentElement.getAttribute('AssertionConsumerServiceURL')
  if (acsUrl) data.assertionConsumerServiceURL = acsUrl

  const destination = dom.documentElement.getAttribute('Destination')
  if (destination) data.destination = destination

  const id = dom.documentElement.getAttribute('ID')
  if (id) data.id = id

  return data
}

export const parseLogoutRequest = (req) => {
  const dom = _parseDOM(req)
  if (dom.error) {
    return dom
  }

  const data = {}

  data.id = dom.documentElement.getAttribute('ID')

  return data
}
