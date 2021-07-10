import { SignedXml } from 'xml-crypto'
import { privatekey, cert } from './certs'
import { pemToCert } from './utils'

export const sign = (xml) => {
  // Reference: https://github.com/auth0/node-saml/blob/7ee79849d6b0a0935e42ad456ae8cb92d2b3bb93/lib/xml/sign.js#L45
  // which is implicitly invoked by https://github.com/auth0/node-samlp/blob/54d8715926c3066074412138714ad362f5a5f0da/lib/samlp.js#L89

  const sig = new SignedXml(null, {
    signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
    idAttribute: 'ID',
  })
  sig.addReference(
    "//*[local-name(.)='Assertion']",
    [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#',
    ],
    'http://www.w3.org/2000/09/xmldsig#sha1'
  )

  sig.signingKey = privatekey

  sig.keyInfoProvider = {
    getKeyInfo: (key, prefix) => {
      prefix = prefix ? prefix + ':' : prefix
      return (
        '<' +
        prefix +
        'X509Data><' +
        prefix +
        'X509Certificate>' +
        pemToCert(cert) +
        '</' +
        prefix +
        'X509Certificate></' +
        prefix +
        'X509Data>'
      )
    },
  }

  sig.computeSignature(xml, {
    location: {
      reference: "//*[local-name(.)='Issuer']",
      action: 'after',
    },
  })

  return sig.getSignedXml()
}
