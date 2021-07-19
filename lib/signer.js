import crypto from 'crypto'
import querystring from 'querystring'
import { SignedXml } from 'xml-crypto'
import { privatekey, cert } from './certs'
import { pemToCert } from './utils'

// https://github.com/auth0/node-saml/blob/7ee79849d6b0a0935e42ad456ae8cb92d2b3bb93/lib/xml/sign.js#L46
const ASSERTION_SIGNATURE_PATH = "//*[local-name(.)='Issuer']"
// https://github.com/auth0/node-samlp/blob/54d8715926c3066074412138714ad362f5a5f0da/lib/constants.js#L24
const RESPONSE_SIGNATURE_PATH =
  "//*[local-name(.)='Response' and namespace-uri(.)='urn:oasis:names:tc:SAML:2.0:protocol']"

const ALGORITHMS = {
  SIGNATURE: {
    'rsa-sha256': 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
    'rsa-sha1': 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
  },
  DIGEST: {
    sha256: 'http://www.w3.org/2001/04/xmlenc#sha256',
    sha1: 'http://www.w3.org/2000/09/xmldsig#sha1',
  },
}

const sign = (xml, opts) => {
  // Reference: https://github.com/auth0/node-saml/blob/7ee79849d6b0a0935e42ad456ae8cb92d2b3bb93/lib/xml/sign.js#L45
  // which is implicitly invoked by https://github.com/auth0/node-samlp/blob/54d8715926c3066074412138714ad362f5a5f0da/lib/samlp.js#L89

  const sig = new SignedXml(null, {
    signatureAlgorithm: ALGORITHMS.SIGNATURE[opts.sigAlgo],
    idAttribute: 'ID',
  })
  sig.addReference(
    opts.signatureLocation,
    [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#',
    ],
    ALGORITHMS.DIGEST[opts.digestAlgo]
  )

  sig.signingKey = privatekey

  sig.keyInfoProvider = {
    getKeyInfo: (key, prefix) => {
      prefix = prefix ? prefix + ':' : ''
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

export const signAssertion = (xml, opts) => {
  if (!opts.signAssertion) {
    return xml
  }
  return sign(xml, { ...opts, signatureLocation: ASSERTION_SIGNATURE_PATH })
}

export const signResponse = (xml, opts) => {
  if (!opts.signResponse) {
    return xml
  }
  return sign(xml, { ...opts, signatureLocation: RESPONSE_SIGNATURE_PATH })
}

export const signRedirectRequest = (params, opts) => {
  params.SigAlg = ALGORITHMS.SIGNATURE[opts.algo]

  // https://github.com/auth0/passport-wsfed-saml2/blob/master/lib/passport-wsfed-saml2/samlp.js#L230
  const qs = querystring.stringify(params)

  // https://github.com/auth0/passport-wsfed-saml2/blob/master/lib/passport-wsfed-saml2/samlp.js#L92-L96
  const signer = crypto.createSign(opts.algo.toUpperCase())
  signer.update(qs, 'latin1')
  params.Signature = signer.sign(privatekey, 'base64')

  return params
}
